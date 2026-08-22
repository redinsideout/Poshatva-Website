import api from './axiosInstance';
export const cartAPI = {
  getCart:        () => api.get('/cart'),
  addToCart:      (data) => api.post('/cart', data),
  removeFromCart: (productId, variantId = '') => api.delete(`/cart/${productId}`, { params: { variantId } }),
  clearCart:      () => api.delete('/cart/clear'),
};
