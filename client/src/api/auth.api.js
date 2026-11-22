import client from './client';

export const authApi = {
  register: (userData) => client.post('/api/auth/register', userData),
  login: (credentials) => client.post('/api/auth/login', credentials),
  getMe: () => client.get('/api/auth/me'),
  forgotPassword: (email) => client.post('/api/auth/forgot-password', { email }),
  resetPassword: (payload) => client.post('/api/auth/reset-password', payload),
};
