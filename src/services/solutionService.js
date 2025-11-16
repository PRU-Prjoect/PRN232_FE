import api from './api';

export const solutionService = {
  // Get solutions by exam ID
  getSolutions: async ({ pageIndex = 1, pageSize = 10, examId } = {}) => {
    const queryParams = new URLSearchParams();
    if (pageIndex) queryParams.append('pageIndex', pageIndex);
    if (pageSize) queryParams.append('pageSize', pageSize);
    if (examId) queryParams.append('examId', examId);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/solution?${queryString}` : '/solution';
    const response = await api.get(url);
    return response.data;
  },

  // Get solution by ID
  getSolutionById: async (solutionId) => {
    const { data } = await api.get(`/solution/${solutionId}`);
    return data;
  },

  // Download solution file - GET /api/solution/{solutionId}/download
  downloadSolution: async (solutionId) => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://localhost:7244/api');
    
    const response = await fetch(`${API_URL}/solution/${solutionId}/download`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    let filename = null;
    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (utf8Match) {
        try {
          filename = decodeURIComponent(utf8Match[1]);
        } catch (e) {
        }
      }
      if (!filename) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
        }
      }
    }
    
    return { blob, filename };
  },
};

export default solutionService;
