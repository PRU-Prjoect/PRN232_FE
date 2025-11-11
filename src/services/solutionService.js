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
    // API returns { data: { data: [...], totalCount, ... } }
    // So we return response.data which contains the full response object
    return response.data;
  },

  // Get solution by ID
  getSolutionById: async (solutionId) => {
    const { data } = await api.get(`/solution/${solutionId}`);
    return data;
  },
};

export default solutionService;
