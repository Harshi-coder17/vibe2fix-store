const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/admin.service');
const refundService = require('../services/refund.service');
const reviewService = require('../services/review.service');

// GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardKPIs();
  res.status(200).json(data);
});

// GET /api/admin/refunds
const getRefunds = asyncHandler(async (req, res) => {
  const data = await refundService.adminGetRefunds(req.query);
  res.status(200).json(data);
});

// PUT /api/admin/refunds/:id
const updateRefund = asyncHandler(async (req, res) => {
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

// GET /api/admin/reviews/reported
const getReportedReviews = asyncHandler(async (req, res) => {
  const data = await reviewService.adminGetReportedReviews(req.query);
  res.status(200).json(data);
});

// PUT /api/admin/reviews/:id/dismiss
const dismissReviewReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const data = await reviewService.adminDismissReport({
    reviewId: id,
    adminId: req.user.id,
    reason,
  });

  res.status(200).json({
    message: 'Report dismissed, review restored to active',
    data,
  });
});

// DELETE /api/admin/reviews/:id
const removeReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const data = await reviewService.adminRemoveReview({
    reviewId: id,
    adminId: req.user.id,
    reason,
  });

  res.status(200).json({
    message: 'Review removed by administrator',
    data,
  });
});

module.exports = {
  getDashboard,
  getRefunds,
  updateRefund,
  getReportedReviews,
  dismissReviewReport,
  removeReview,
};
