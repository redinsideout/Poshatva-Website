import api from './axiosInstance';
export const productsAPI = {
  getAll:       (params)  => api.get('/products', { params }),
  getBySlug:    (slug)    => api.get(`/products/${slug}`),
  getById:      (id)      => api.get(`/products/id/${id}`),
  create:       (data)    => api.post('/products', data),
  update:       (id, data)=> api.put(`/products/${id}`, data),
  delete:       (id)      => api.delete(`/products/${id}`),
  addReview:    (id, data)=> api.post(`/products/${id}/reviews`, data),
};
