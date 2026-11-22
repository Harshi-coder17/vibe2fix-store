const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

router.get('/', asyncHandler(categoryController.list));

module.exports = router;
