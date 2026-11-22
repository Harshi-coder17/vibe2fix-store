const prisma = require('../config/db');
const AppError = require('../utils/AppError');

async function getWishlist(userId) {
  const wishlist = await prisma.wishlist.upsert({ where: { userId }, create: { userId }, update: {} });
  return prisma.wishlist.findUnique({ where: { id: wishlist.id }, include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } } });
}

async function add(userId, productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw new AppError('Product not found or unavailable', 404);
  const wishlist = await prisma.wishlist.upsert({ where: { userId }, create: { userId }, update: {} });
  await prisma.wishlistItem.upsert({ where: { wishlistId_productId: { wishlistId: wishlist.id, productId } }, create: { wishlistId: wishlist.id, productId }, update: {} });
  return getWishlist(userId);
}

async function remove(userId, productId) {
  const wishlist = await prisma.wishlist.upsert({ where: { userId }, create: { userId }, update: {} });
  const result = await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
  if (!result.count) throw new AppError('Wishlist item not found', 404);
  return getWishlist(userId);
}

module.exports = { getWishlist, add, remove };
