import api from './api';

export const questionService = {
  // Get questions by part ID and solution ID
  getQuestions: async (params = {}) => {
    const { 
      pageIndex = 1, 
      pageSize = 10, 
      sortColumn = '',
      sortDirection = 'asc',
      partId = null,
      solutionId = null
    } = params;
    
    const queryParams = new URLSearchParams();
    if (pageIndex) queryParams.append('pageIndex', pageIndex);
    if (pageSize) queryParams.append('pageSize', pageSize);
    if (sortColumn) queryParams.append('sortColumn', sortColumn);
    if (sortDirection) queryParams.append('sortDirection', sortDirection);
    if (partId) queryParams.append('partId', partId);
    if (solutionId) queryParams.append('solutionId', solutionId);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/question?${queryString}` : '/question';
    const response = await api.get(url);
    return response.data;
  },

  // Get question by ID
  getQuestionById: async (questionId) => {
    const response = await api.get(`/question/${questionId}`);
    return response.data;
  },

  // Create question
  createQuestion: async (questionData) => {
    const response = await api.post('/question', questionData);
    return response.data;
  },

  // Update question
  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/question/${questionId}`, questionData);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/question/${questionId}`);
    return response.data;
  },
};

export default questionService;

