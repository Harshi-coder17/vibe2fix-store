const categoryService = require('../services/category.service');

const list = async (req, res) => {
  const categories = await categoryService.listCategories();
  res.status(200).json({ data: categories });
};

const create = async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ data: category });
};

const update = async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body
  );
  res.status(200).json({ data: category });
};

const remove = async (req, res) => {
  const category = await categoryService.deleteCategory(req.params.id);
  res.status(200).json({ data: category });
};

module.exports = { list, create, update, remove };
