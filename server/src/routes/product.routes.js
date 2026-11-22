const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/', asyncHandler(productController.list));
router.get('/:id/reviews', asyncHandler(productController.listReviews));
router.get('/:id', asyncHandler(productController.getById));

module.exports = router;
