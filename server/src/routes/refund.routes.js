const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refund.controller');
const { requireAuth } = require('../middleware/auth');

// All refund routes require authentication
router.use(requireAuth);

// Customer endpoints (supports both GET /api/refunds and GET /api/refunds/my)
router.get('/', refundController.getMyRefunds);
router.get('/my', refundController.getMyRefunds);
router.get('/:id', refundController.getRefundById);
router.post('/order/:orderNumber', refundController.requestRefund);

module.exports = router;
