const service = require('../services/wishlist.service');
const asyncHandler = require('../utils/asyncHandler');
exports.get = asyncHandler(async (req, res) => res.json({ data: await service.getWishlist(req.user.id) }));
exports.add = asyncHandler(async (req, res) => res.status(201).json({ data: await service.add(req.user.id, req.params.productId) }));
exports.remove = asyncHandler(async (req, res) => res.json({ data: await service.remove(req.user.id, req.params.productId) }));
