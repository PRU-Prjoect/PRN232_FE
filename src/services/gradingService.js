import api from './api';

export const gradingService = {
  // Grade a submission
  gradeSubmission: async (assignmentId, gradingData) => {
    const response = await api.post(`/grading/assignments/${assignmentId}`, gradingData);
    return response.data;
  },

  // Get grading details for a submission
  getGradingDetails: async (assignmentId) => {
    const response = await api.get(`/grading/assignments/${assignmentId}`);
    return response.data;
  },

  // Update grading
  updateGrading: async (markingId, gradingData) => {
    const response = await api.put(`/grading/${markingId}`, gradingData);
    return response.data;
  },

  // Delete grading
  deleteGrading: async (markingId) => {
    const response = await api.delete(`/grading/${markingId}`);
    return response.data;
  },

  // Approve score
  approveScore: async (solutionId, markingId, totalScore) => {
    const response = await api.post(`/grading/approve`, {
      solutionId,
      markingId,
      totalScore,
    });
    return response.data;
  },

  // Get pending approvals
  getPendingApprovals: async () => {
    const response = await api.get('/grading/pending-approvals');
    return response.data;
  },
};

export default gradingService;

