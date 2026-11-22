const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const addressController = require('../controllers/address.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', addressController.getAddresses);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
