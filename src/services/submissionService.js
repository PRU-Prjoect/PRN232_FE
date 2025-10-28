import api from './api';

export const submissionService = {
  // Get all submissions for a course
  getSubmissionsByCourse: async (courseId) => {
    const response = await api.get(`/submissions/course/${courseId}`);
    return response.data;
  },

  // Get assignments assigned to lecturer
  getLecturerAssignments: async (lecturerId) => {
    const response = await api.get(`/submissions/lecturer/${lecturerId}`);
    return response.data;
  },

  // Get submission by ID
  getSubmissionById: async (submissionId) => {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data;
  },

  // Upload submission
  uploadSubmission: async (courseId, formData) => {
    const response = await api.post(`/submissions/course/${courseId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Assign submission to lecturer
  assignSubmission: async (submissionId, lecturerId) => {
    const response = await api.post(`/submissions/${submissionId}/assign`, { lecturerId });
    return response.data;
  },

  // Assign all submissions in exam to lecturers
  assignExamToLecturers: async (examId, lecturerIds) => {
    const response = await api.post(`/exams/${examId}/assign`, { lecturerIds });
    return response.data;
  },

  // Change lecturer for a submission
  changeLecturer: async (assignmentId, newLecturerId) => {
    const response = await api.put(`/assignments/${assignmentId}/lecturer`, { lecturerId: newLecturerId });
    return response.data;
  },
};

export default submissionService;

