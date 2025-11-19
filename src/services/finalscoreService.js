import api from './api';

export const finalscoreService = {
  // Create or update final score
  createFinalScore: async (finalScoreData) => {
    const { solutionId, totalScore, approvedAt } = finalScoreData;
    
    const requestBody = {
      solutionId,
      totalScore: parseFloat(totalScore) || 0
    };
    if (approvedAt !== null && approvedAt !== undefined) {
      requestBody.approvedAt = approvedAt;
    }
    
    const response = await api.post('/finalscore', requestBody);
    return response.data;
  },

  // Get final scores with pagination
  getFinalScores: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/finalscore?${queryParams}` : '/finalscore';
    const response = await api.get(url);
    return response.data;
  },

  // Get final score by solution ID
  getFinalScoreBySolution: async (solutionId) => {
    const response = await api.get(`/finalscore/solution/${solutionId}`);
    return response.data;
  },

  // Update final score
  updateFinalScore: async (finalScoreId, finalScoreData) => {
    const response = await api.put(`/finalscore/${finalScoreId}`, finalScoreData);
    return response.data;
  },

  // Approve final score
  approveFinalScore: async (approveData) => {
    const { solutionId, assignmentId } = approveData;
    
    const response = await api.post('/finalscore/approve', {
      solutionId,
      assignmentId
    });
    return response.data;
  },

  // Export scores to Excel
  exportScores: async (examId) => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://localhost:7244/api');
    
    const response = await fetch(`${API_URL}/finalscore/export`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ examId }),
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

export default finalscoreService;

