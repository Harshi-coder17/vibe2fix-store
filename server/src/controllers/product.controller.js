const productService = require('../services/product.service');

const list = async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.status(200).json(result);
};

const getById = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ data: product });
};

const listReviews = async (req, res) => {
  const result = await productService.getProductReviews(
    req.params.id,
    req.query
  );
  res.status(200).json(result);
};

const adminList = async (req, res) => {
  const result = await productService.getAdminProducts(req.query);
  res.status(200).json(result);
};

const create = async (req, res) => {
  const product = await productService.createProduct(req.body, req.files);
  res.status(201).json({ data: product });
};

const update = async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.files
  );
  res.status(200).json({ data: product });
};

const remove = async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  res.status(200).json({ data: product });
};

module.exports = { list, getById, listReviews, adminList, create, update, remove };
