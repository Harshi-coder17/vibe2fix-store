const asyncHandler = require('../utils/asyncHandler');
const refundService = require('../services/refund.service');

// POST /api/orders/:orderNumber/refund
const requestRefund = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const { reason, amount } = req.body;

  const refund = await refundService.requestRefund({
    orderNumber,
    userId: req.user.id,
    reason,
    amount,
  });

  res.status(201).json({
    message: 'Refund request submitted successfully',
    data: refund,
  });
});

// GET /api/refunds
const getMyRefunds = asyncHandler(async (req, res) => {
  const refunds = await refundService.getMyRefunds(req.user.id);
  res.status(200).json({ data: refunds });
});

// GET /api/refunds/:id
const getRefundById = asyncHandler(async (req, res) => {
  const refund = await refundService.getRefundById(req.params.id, req.user);
  res.status(200).json({ data: refund });
});

// GET /api/admin/refunds
const adminGetRefunds = asyncHandler(async (req, res) => {
  const result = await refundService.adminGetRefunds(req.query);
  res.status(200).json(result);
});

// PUT /api/admin/refunds/:id
const adminUpdateRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  const updatedRefund = await refundService.adminUpdateRefundStatus({
    refundId: id,
    status,
    adminNote,
  });

  res.status(200).json({
    message: `Refund status updated to ${status}`,
    data: updatedRefund,
  });
});

module.exports = {
  requestRefund,
  getMyRefunds,
  getRefundById,
  adminGetRefunds,
  adminUpdateRefund,
};
