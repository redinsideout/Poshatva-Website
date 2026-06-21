import api from './axiosInstance';
export const authAPI = {
  register: (data)       => api.post('/auth/register', data),
  login:    (data)       => api.post('/auth/login', data),
  firebaseLogin: (token) => api.post('/auth/firebase', { token }),
  getMe:    ()           => api.get('/auth/me'),
  update:   (data)       => api.put('/auth/profile', data),
  addAddress:(data)      => api.post('/auth/address', data),
};
