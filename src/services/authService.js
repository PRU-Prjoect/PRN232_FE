import api from './api';

export const authService = {
  // Login - Backend trả về { accessToken: "..." }
  login: async (email, password) => {
    const response = await api.post('/auth/login', { Email: email, Password: password });
    const { accessToken } = response.data;
    if (accessToken) {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const user = {
        id: payload.sub,
        email: email,
        ...(roleClaim && { role: roleClaim })
      };
      return { token: accessToken, user };
    }
    
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

export default authService;

