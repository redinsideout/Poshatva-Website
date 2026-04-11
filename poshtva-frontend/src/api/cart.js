import api from './axiosInstance';
export const cartAPI = {
  getCart:        ()         => api.get('/cart'),
  addToCart:      (data)     => api.post('/cart', data),
  removeFromCart: (productId)=> api.delete(`/cart/${productId}`),
  clearCart:      ()         => api.delete('/cart/clear'),
};
