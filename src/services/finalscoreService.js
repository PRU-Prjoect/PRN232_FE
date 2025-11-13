import api from './api';

export const finalscoreService = {
  // Create or update final score
  createFinalScore: async (finalScoreData) => {
    const { solutionId, totalScore, approvedAt } = finalScoreData;
    
    const requestBody = {
      solutionId,
      totalScore: parseFloat(totalScore) || 0
    };
    
    // Only include approvedAt if it's provided (not null/undefined)
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
    const { solutionId, assignmentId, totalScore } = approveData;
    
    const response = await api.post('/finalscore/approve', {
      solutionId,
      assignmentId,
      totalScore: parseFloat(totalScore) || 0
    });
    return response.data;
  },
};

export default finalscoreService;

