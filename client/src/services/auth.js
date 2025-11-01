import { api } from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  profile: () => api.get('/auth/profile'),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload),
  resendOTP: (email) => api.post('/auth/resend-otp', { email })
};

export default authService;
