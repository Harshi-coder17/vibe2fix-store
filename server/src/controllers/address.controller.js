const asyncHandler = require('../utils/asyncHandler');
const addressService = require('../services/address.service');

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);
  res.status(200).json({ data: addresses });
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  res.status(201).json({ data: address });
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
  res.status(200).json({ data: address });
});

const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.user.id, req.params.id);
  res.status(200).json({ message: 'Address deleted successfully' });
});

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
