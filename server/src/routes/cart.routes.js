const router = require('express').Router();
const auth = require('../middleware/requireAuth');
const cart = require('../controllers/cart.controller');

router.use(auth);
router.get('/', cart.getCart);
router.post('/items', cart.addToCart);
router.put('/items/:productId', cart.updateQuantity);
router.delete('/items/:productId', cart.removeItem);
router.post('/coupon', cart.applyCoupon);
router.delete('/coupon', cart.removeCoupon);

module.exports = router;
