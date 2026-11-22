const asyncHandler = require('../utils/asyncHandler');
const reviewService = require('../services/review.service');

// POST /api/products/:id/reviews
const createReview = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { rating, comment } = req.body;
  const files = req.files || [];

  const review = await reviewService.createReview({
    productId,
    userId: req.user.id,
    rating,
    comment,
    files,
  });

  res.status(201).json({
    message: 'Review posted successfully',
    data: review,
  });
});

// GET /api/products/:id/reviews
const getProductReviews = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const { page, limit } = req.query;

  const result = await reviewService.getProductReviews({
    productId,
    page,
    limit,
  });

  res.status(200).json(result);
});

// PUT /api/reviews/:id
const updateReview = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, comment } = req.body;

  const updatedReview = await reviewService.updateReview({
    reviewId,
    userId: req.user.id,
    rating,
    comment,
  });

  res.status(200).json({
    message: 'Review updated successfully',
    data: updatedReview,
  });
});

// DELETE /api/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;

  const result = await reviewService.deleteReview({
    reviewId,
    user: req.user,
  });

  res.status(200).json(result);
});

// POST /api/reviews/:id/report
const reportReview = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const { reason } = req.body;

  const report = await reviewService.reportReview({
    reviewId,
    userId: req.user.id,
    reportReason: reason,
  });

  res.status(201).json({
    message: 'Review reported successfully',
    data: report,
  });
});

// GET /api/admin/reviews/reported
const adminGetReportedReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.adminGetReportedReviews(req.query);
  res.status(200).json(result);
});

// PUT /api/admin/reviews/:id/dismiss
const adminDismissReport = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const { reason } = req.body;

  const review = await reviewService.adminDismissReport({
    reviewId,
    adminId: req.user.id,
    reason,
  });

  res.status(200).json({
    message: 'Report dismissed, review restored to active',
    data: review,
  });
});

// DELETE /api/admin/reviews/:id
const adminRemoveReview = asyncHandler(async (req, res) => {
  const { id: reviewId } = req.params;
  const { reason } = req.body;

  const review = await reviewService.adminRemoveReview({
    reviewId,
    adminId: req.user.id,
    reason,
  });

  res.status(200).json({
    message: 'Review removed by administrator',
    data: review,
  });
});

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  reportReview,
  adminGetReportedReviews,
  adminDismissReport,
  adminRemoveReview,
};
