import api from './api';

export const markingService = {
  // Create marking (save score for a question)
  createMarking: async (markingData) => {
    const { assignmentId, questionId, score, note } = markingData;
    
    const response = await api.post('/marking', {
      assignmentId,
      questionId,
      score: parseFloat(score) || 0,
      note: note || ''
    });
    return response.data;
  },

  // Get markings with pagination
  getMarkings: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/marking?${queryParams}` : '/marking';
    const response = await api.get(url);
    return response.data;
  },

  // Get markings by assignment ID
  getMarkingsByAssignment: async (assignmentId) => {
    const response = await api.get(`/marking/assignment/${assignmentId}`);
    return response.data;
  },

  // Update marking
  updateMarking: async (markingId, markingData) => {
    const response = await api.put(`/marking/${markingId}`, markingData);
    return response.data;
  },

  // Delete marking
  deleteMarking: async (markingId) => {
    const response = await api.delete(`/marking/${markingId}`);
    return response.data;
  },
};

export default markingService;

