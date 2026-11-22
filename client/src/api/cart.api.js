import client from './client';

export const cartApi = {
  getCart: () => client.get('/api/cart'),
  addItem: (productId, quantity = 1) => client.post('/api/cart/items', { productId, quantity }),
  updateQuantity: (productId, quantity) => client.put(`/api/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => client.delete(`/api/cart/items/${productId}`),
  applyCoupon: (code) => client.post('/api/cart/coupon', { code: code.toUpperCase() }),
  removeCoupon: () => client.delete('/api/cart/coupon'),
};

export const wishlistApi = {
  getWishlist: () => client.get('/api/wishlist'),
  addItem: (productId) => client.post(`/api/wishlist/${productId}`),
  removeItem: (productId) => client.delete(`/api/wishlist/${productId}`),
};
