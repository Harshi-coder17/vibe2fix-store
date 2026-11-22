const service = require('../services/cart.service');
const asyncHandler = require('../utils/asyncHandler');
const { resolveContextCart } = require('../utils/sessionContextResolver');

const send = (fn, status = 200) => asyncHandler(async (req, res) => res.status(status).json({ data: await fn(req) }));

exports.getCart = asyncHandler(async (req, res) => {
  const data = await resolveContextCart(req);
  res.status(200).json({ data });
});

exports.addToCart      = send(req => service.addToCart(req.user.id, req.body.productId, req.body.quantity), 201);
exports.updateQuantity = send(req => service.updateQuantity(req.user.id, req.params.productId, req.body.quantity));
exports.removeItem     = send(req => service.removeItem(req.user.id, req.params.productId));
exports.applyCoupon    = send(req => service.applyCoupon(req.user.id, req.body.code));
exports.removeCoupon   = send(req => service.removeCoupon(req.user.id));
