const customerService = require('../services/customer.service');

const list = async (req, res) => {
  const result = await customerService.listCustomers(req.query);
  res.status(200).json(result);
};

const updateStatus = async (req, res) => {
  const customer = await customerService.updateCustomerStatus(
    req.params.id,
    req.body
  );
  res.status(200).json({ data: customer });
};

module.exports = { list, updateStatus };
