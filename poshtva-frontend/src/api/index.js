import api from './axiosInstance';
export const ordersAPI = {
  create:       (data) => api.post('/orders', data),
  getMyOrders:  ()     => api.get('/orders/my'),
  getById:      (id)   => api.get(`/orders/${id}`),
  markPaid:     (id, paymentData) => api.put(`/orders/${id}/pay`, paymentData),
  getAllOrders:  (params) => api.get('/orders/admin', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verify:      (data) => api.post('/payment/verify', data),
};

export const categoriesAPI = {
  getAll:   ()           => api.get('/categories'),
  getBySlug:(slug)       => api.get(`/categories/${slug}`),
  create:   (data)       => api.post('/categories', data),
  update:   (id, data)   => api.put(`/categories/${id}`, data),
  delete:   (id)         => api.delete(`/categories/${id}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers:     () => api.get('/admin/users'),
};

export const uploadAPI = {
  uploadImages: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export * from './auth';
export * from './products';
export * from './cart';
