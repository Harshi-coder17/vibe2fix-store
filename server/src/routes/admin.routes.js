const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const { productImages } = require('../middleware/upload');
const prisma = require('../config/db');
const AppError = require('../utils/AppError');

// Controllers
const productController = require('../controllers/product.controller');
const categoryController = require('../controllers/category.controller');
const customerController = require('../controllers/customer.controller');
const adminController = require('../controllers/admin.controller');
const orderController = require('../controllers/order.controller');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// 1. Dashboard
router.get('/dashboard', adminController.getDashboard);

// 2. Products
router.get('/products', asyncHandler(productController.adminList));
router.post('/products', productImages, asyncHandler(productController.create));
router.put('/products/:id', productImages, asyncHandler(productController.update));
router.delete('/products/:id', asyncHandler(productController.remove));

// 3. Categories
router.post('/categories', asyncHandler(categoryController.create));
router.put('/categories/:id', asyncHandler(categoryController.update));
router.delete('/categories/:id', asyncHandler(categoryController.remove));

// 4. Customers
router.get('/customers', asyncHandler(customerController.list));
router.put('/customers/:id/status', asyncHandler(customerController.updateStatus));

// 5. Orders
router.get('/orders', orderController.listAll);
router.put('/orders/:id/status', orderController.updateStatus);

// 6. Refunds
router.get('/refunds', adminController.getRefunds);
router.put('/refunds/:id', adminController.updateRefund);
router.patch('/refunds/:id', adminController.updateRefund);

// 7. Reviews Moderation
router.get('/reviews/reported', adminController.getReportedReviews);
router.get('/reviews/flagged', adminController.getReportedReviews);
router.put('/reviews/:id/dismiss', adminController.dismissReviewReport);
router.patch('/reviews/:id/dismiss', adminController.dismissReviewReport);
router.delete('/reviews/:id', adminController.removeReview);
router.delete('/reviews/:id/admin', adminController.removeReview);

// 8. Coupons
router.get('/coupons', asyncHandler(async (req, res) => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ data: coupons });
}));

router.post('/coupons', asyncHandler(async (req, res) => {
  const { code, type = 'percent', value, minOrder = 0, maxDiscount, expiry, usageLimit = 100 } = req.body;
  if (!code || value === undefined || !expiry) {
    throw new AppError('Code, value, and expiry date are required', 400);
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: String(code).trim().toUpperCase(),
      type,
      value: Number(value),
      minOrder: Number(minOrder || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      expiry: new Date(expiry),
      usageLimit: Number(usageLimit || 100),
      isActive: true,
    },
  });
  res.status(201).json({ data: coupon });
}));

router.put('/coupons/:id', asyncHandler(async (req, res) => {
  const { code, type, value, minOrder, maxDiscount, expiry, usageLimit, isActive } = req.body;
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: {
      code: code ? String(code).trim().toUpperCase() : undefined,
      type: type || undefined,
      value: value !== undefined ? Number(value) : undefined,
      minOrder: minOrder !== undefined ? Number(minOrder) : undefined,
      maxDiscount: maxDiscount !== undefined ? (maxDiscount ? Number(maxDiscount) : null) : undefined,
      expiry: expiry ? new Date(expiry) : undefined,
      usageLimit: usageLimit !== undefined ? Number(usageLimit) : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
    },
  });
  res.status(200).json({ data: coupon });
}));

router.delete('/coupons/:id', asyncHandler(async (req, res) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.status(200).json({ message: 'Coupon deleted successfully' });
}));

module.exports = router;
