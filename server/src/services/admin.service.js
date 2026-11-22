const prisma = require('../config/db');

/**
 * Fetch executive dashboard KPIs using efficient Prisma aggregations
 */
const getDashboardKPIs = async () => {
  const lowStockThreshold = parseInt(process.env.LOW_STOCK_THRESHOLD, 10) || 5;

  // Run independent aggregation queries in parallel
  const [
    revenueAggregation,
    totalOrders,
    ordersByStatusRaw,
    totalCustomers,
    lowStockProducts,
    pendingRefundsCount,
    flaggedReviewsCount,
    recentOrders,
  ] = await Promise.all([
    // 1. Total Revenue: Sum totalAmount of Delivered & Paid orders
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        orderStatus: 'Delivered',
        paymentStatus: 'Paid',
      },
    }),

    // 2. Total orders count
    prisma.order.count(),

    // 3. Orders grouped by status
    prisma.order.groupBy({
      by: ['orderStatus'],
      _count: { id: true },
    }),

    // 4. Total customer accounts (excluding admins)
    prisma.user.count({
      where: { role: { in: ['user', 'customer'] } },
    }),

    // 5. Products below low stock threshold
    prisma.product.findMany({
      where: {
        stock: { lt: lowStockThreshold },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
      },
      orderBy: { stock: 'asc' },
    }),

    // 6. Pending refund requests requiring action
    prisma.refund.count({
      where: { status: 'Requested' },
    }),

    // 7. Flagged reviews requiring moderation
    prisma.review.count({
      where: { reviewStatus: 'Flagged' },
    }),

    // 8. 5 most recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  // Format orders by status map
  const ordersByStatus = {
    Placed: 0,
    Packed: 0,
    Shipped: 0,
    'Out for Delivery': 0,
    Delivered: 0,
    Cancelled: 0,
  };
  ordersByStatusRaw.forEach((entry) => {
    ordersByStatus[entry.orderStatus] = entry._count.id;
  });

  return {
    kpis: {
      totalRevenue: revenueAggregation._sum.totalAmount || 0,
      totalOrders,
      totalCustomers,
      pendingRefunds: pendingRefundsCount,
      flaggedReviews: flaggedReviewsCount,
    },
    ordersByStatus,
    lowStockAlerts: {
      count: lowStockProducts.length,
      threshold: lowStockThreshold,
      products: lowStockProducts,
    },
    recentOrders,
  };
};

module.exports = {
  getDashboardKPIs,
};
