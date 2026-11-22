const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { requireAuth } = require('../middleware/auth');
const { uploadReview } = require('../middleware/upload');

// Reviews collection / item routes
router.put('/:id', requireAuth, reviewController.updateReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);
router.post('/:id/report', requireAuth, reviewController.reportReview);

module.exports = router;
