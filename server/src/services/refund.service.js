const prisma = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * Customer submits a refund request for a delivered order
 */
const requestRefund = async ({ orderNumber, userId, reason, amount }) => {
  if (!reason || reason.trim().length === 0) {
    throw new AppError('Refund reason is required', 400);
  }

  // 1. Locate the order
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // 2. Ownership check
  if (order.userId !== userId) {
    throw new AppError('You are not authorized to refund this order', 403);
  }

  // 3. Status must be 'Delivered'
  if (order.orderStatus !== 'Delivered') {
    throw new AppError('Refunds are only allowed for delivered orders', 400);
  }

  // 4. Check 7-day return policy
  if (!order.deliveredAt) {
    throw new AppError('Order delivery timestamp is missing', 400);
  }

  const returnWindowDays = parseInt(process.env.RETURN_WINDOW_DAYS, 10) || 7;
  const deliveryTime = new Date(order.deliveredAt).getTime();
  const timeDifference = Date.now() - deliveryTime;
  const maxReturnWindowMs = returnWindowDays * 24 * 60 * 60 * 1000;

  if (timeDifference > maxReturnWindowMs) {
    throw new AppError('Return window has expired', 400);
  }

  // 5. Check if order or refund has already been requested/processed
  if (order.paymentStatus === 'Refunded') {
    throw new AppError('This order has already been refunded', 400);
  }

  const existingRefund = await prisma.refund.findFirst({
    where: {
      orderId: order.id,
      status: { in: ['Requested', 'Approved', 'Refunded'] },
    },
  });

  if (existingRefund) {
    if (existingRefund.status === 'Requested') {
      return prisma.$transaction(async (tx) => {
        const refund = await tx.refund.update({
          where: { id: existingRefund.id },
          data: {
            reason: reason.trim(),
            amount: amount !== undefined ? Number(amount) : order.totalAmount,
          },
        });
        return refund;
      });
    }
    throw new AppError('A refund request has already been completed for this order', 409);
  }

  // 6. Create refund and history log in an atomic transaction
  try {
    return await prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          orderId: order.id,
          userId,
          reason: reason.trim(),
          amount: amount !== undefined ? Number(amount) : order.totalAmount,
          status: 'Requested',
        },
      });

      await tx.refundStatusHistory.create({
        data: {
          refundId: refund.id,
          status: 'Requested',
        },
      });

      return refund;
    });
  } catch (error) {
    // Catch PostgreSQL partial unique index violation (P2002)
    if (error.code === 'P2002') {
      throw new AppError('A refund request is already open for this order', 409);
    }
    throw error;
  }
};

/**
 * Get all refund requests for the logged-in customer
 */
const getMyRefunds = async (userId) => {
  return prisma.refund.findMany({
    where: { userId },
    include: {
      order: {
        select: {
          orderNumber: true,
          totalAmount: true,
          deliveredAt: true,
          items: {
            select: {
              productName: true,
              quantity: true,
              price: true,
              productImage: true,
            },
          },
        },
      },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get single refund details by ID
 */
const getRefundById = async (refundId, user) => {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: {
      order: {
        select: {
          orderNumber: true,
          totalAmount: true,
          deliveredAt: true,
          paymentStatus: true,
          items: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      statusHistory: {
        orderBy: { changedAt: 'asc' },
      },
    },
  });

  if (!refund) {
    throw new AppError('Refund request not found', 404);
  }

  // Authorization check (Customer can only see their own refund)
  if (user.role !== 'admin' && refund.userId !== user.id) {
    throw new AppError('You are not authorized to view this refund', 403);
  }

  return refund;
};

/**
 * Admin: List all refunds with optional status filter and pagination
 */
const adminGetRefunds = async ({ status, page = 1, limit = 20 }) => {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const where = {};
  if (status) {
    where.status = status;
  }

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      skip,
      take,
      include: {
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            deliveredAt: true,
            paymentStatus: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.refund.count({ where }),
  ]);

  return {
    refunds,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / take),
  };
};

/**
 * Admin: Approve, Reject, or Mark Refunded
 */
const adminUpdateRefundStatus = async ({ refundId, status, adminNote }) => {
  const validStatuses = ['Approved', 'Rejected', 'Refunded'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: { order: true },
  });

  if (!refund) {
    throw new AppError('Refund request not found', 404);
  }

  // Validation: Rejection requires an explanation note
  if (status === 'Rejected' && (!adminNote || adminNote.trim().length === 0)) {
    throw new AppError('Admin note is required when rejecting a refund', 400);
  }

  // State Transition Machine
  if (refund.status === 'Requested') {
    if (!['Approved', 'Rejected'].includes(status)) {
      throw new AppError('A Requested refund can only transition to Approved or Rejected', 400);
    }
  } else if (refund.status === 'Approved') {
    if (status !== 'Refunded') {
      throw new AppError('An Approved refund can only transition to Refunded', 400);
    }
  } else if (['Rejected', 'Refunded'].includes(refund.status)) {
    throw new AppError(`Cannot update a refund that is already ${refund.status}`, 400);
  }

  // Apply updates in an atomic transaction
  return prisma.$transaction(async (tx) => {
    const updatedRefund = await tx.refund.update({
      where: { id: refundId },
      data: {
        status,
        ...(adminNote && { adminNote: adminNote.trim() }),
      },
    });

    // Append to status history
    await tx.refundStatusHistory.create({
      data: {
        refundId,
        status,
      },
    });

    // If marked Refunded, also flip the parent order's paymentStatus
    if (status === 'Refunded') {
      await tx.order.update({
        where: { id: refund.orderId },
        data: { paymentStatus: 'Refunded' },
      });
    }

    return updatedRefund;
  });
};

module.exports = {
  requestRefund,
  getMyRefunds,
  getRefundById,
  adminGetRefunds,
  adminUpdateRefundStatus,
};
