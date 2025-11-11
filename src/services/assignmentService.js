import api from './api';

export const assignmentService = {
  assignExam: async (examId, lecturerIds) => {
    try {
      const response = await api.post('/assignment/assign', {
        examId,
        lecturerIds,
      });
      return response.data;
    } catch (error) {
      if (error?.message) {
        try {
          const errorJson = JSON.parse(error.message);
          if (errorJson.error?.details) {
            throw new Error(errorJson.error.details);
          } else if (errorJson.error?.title) {
            throw new Error(errorJson.error.title);
          }
        } catch (e) {

        }
      }
      throw error;
    }
  },
  //call api 1 solu with 1 lecturer 
  assignSolution: async (solutionId, lecturerId, examId = null) => {
    try {
      const requestBody = {
        solutionId,
        lecturerId,
      };
      if (examId) {
        requestBody.examId = examId;
      }
      const response = await api.post('/api/assignment', requestBody);
      return response.data;
    } catch (error) {
      if (error?.message) {
        try {
          const errorJson = JSON.parse(error.message);
          if (errorJson.error?.details) {
            throw new Error(errorJson.error.details);
          } else if (errorJson.error?.title) {
            throw new Error(errorJson.error.title);
          }
        } catch (e) {

        }
      }
      throw error;
    }
  },

  // Get assignments
  getAssignments: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `/assignment?${queryParams}` : '/assignment';
    const response = await api.get(url);
    return response.data;
  },

  // Get assignment by ID
  getAssignmentById: async (assignmentId) => {
    const response = await api.get(`/assignment/${assignmentId}`);
    return response.data;
  },

  // Update assignment
  updateAssignment: async (assignmentId, data) => {
    const response = await api.put(`/assignment/${assignmentId}`, data);
    return response.data;
  },

  // Delete assignment
  deleteAssignment: async (assignmentId) => {
    const response = await api.delete(`/assignment/${assignmentId}`);
    return response.data;
  },

  // Assign solution to lecturer
  assignSolution: async (solutionId, lecturerId, examId = null) => {
    try {
      const requestBody = {
        solutionId,
        lecturerId,
      };

      // Include examId if provided
      if (examId) {
        requestBody.examId = examId;
      }

      const response = await api.post('/assignment', requestBody);
      return response.data;
    } catch (error) {
      // Parse error message from JSON response if available
      if (error?.message) {
        try {
          const errorJson = JSON.parse(error.message);
          if (errorJson.error?.details) {
            throw new Error(errorJson.error.details);
          } else if (errorJson.error?.title) {
            throw new Error(errorJson.error.title);
          }
        } catch (e) {
          // If not JSON, use original error message
        }
      }
      throw error;
    }
  },

};

export default assignmentService;

