const prisma = require('../config/db');
const AppError = require('../utils/AppError');

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const validateCategory = (input, partial = false) => {
  const data = {};

  if (!partial || input.name !== undefined) {
    if (typeof input.name !== 'string' || !input.name.trim()) {
      throw new AppError('Category name is required', 400);
    }
    data.name = input.name.trim();
  }

  if (input.description !== undefined) {
    if (input.description !== null && typeof input.description !== 'string') {
      throw new AppError('Description must be text', 400);
    }
    data.description = input.description ? input.description.trim() : null;
  }

  if (!partial || input.slug !== undefined || input.name !== undefined) {
    const source =
      typeof input.slug === 'string' && input.slug.trim()
        ? input.slug
        : input.name;
    const slug = typeof source === 'string' ? slugify(source) : '';

    if (!slug) {
      throw new AppError('A valid category slug is required', 400);
    }
    data.slug = slug;
  }

  return data;
};

const listCategories = () =>
  prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

const createCategory = async (input) => {
  try {
    return await prisma.category.create({
      data: validateCategory(input),
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError('Category name or slug already exists', 409);
    }
    throw error;
  }
};

const updateCategory = async (id, input) => {
  try {
    return await prisma.category.update({
      where: { id },
      data: validateCategory(input, true),
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Category not found', 404);
    }
    if (error.code === 'P2002') {
      throw new AppError('Category name or slug already exists', 409);
    }
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    await prisma.category.delete({ where: { id } });
    return { id };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new AppError('Category not found', 404);
    }
    throw error;
  }
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
