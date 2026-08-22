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

export const shiprocketAPI = {
  pushOrder:      (orderId) => api.post(`/shiprocket/push/${orderId}`),
  getCouriers:    (orderId) => api.get(`/shiprocket/couriers/${orderId}`),
  assignAWB:      (orderId, data) => api.post(`/shiprocket/assign-awb/${orderId}`, data),
  schedulePickup: (orderId) => api.post(`/shiprocket/pickup/${orderId}`),
  generateLabel:  (orderId) => api.post(`/shiprocket/label/${orderId}`),
  generateManifest:(orderId) => api.post(`/shiprocket/manifest/generate/${orderId}`),
  printManifest:  (orderId) => api.post(`/shiprocket/manifest/print/${orderId}`),
  cancelShipment: (orderId) => api.post(`/shiprocket/cancel/${orderId}`),
  trackOrder:     (orderId) => api.get(`/shiprocket/track/${orderId}`),
  checkServiceability: (params) => api.get('/shiprocket/serviceability', { params }),
};

export const uploadAPI = {
  // Do NOT manually set Content-Type here — axios auto-detects FormData
  // and sets 'multipart/form-data; boundary=...' which multer requires.
  uploadImages: (formData) => api.post('/upload', formData),
};

export * from './auth';
export * from './products';
export * from './cart';
