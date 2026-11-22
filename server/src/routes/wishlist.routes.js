const router = require('express').Router();
const auth = require('../middleware/requireAuth');
const wishlist = require('../controllers/wishlist.controller');
router.use(auth);
router.get('/', wishlist.get);
router.post('/:productId', wishlist.add);
router.delete('/:productId', wishlist.remove);
module.exports = router;
