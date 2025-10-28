import api from './api';

export const examService = {
  // Get all exams
  getExams: async () => {
    const response = await api.get('/exams');
    return response.data;
  },

  // Get exam by ID
  getExamById: async (examId) => {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  },

  // Create exam
  createExam: async (examData) => {
    const response = await api.post('/exams', examData);
    return response.data;
  },

  // Update exam
  updateExam: async (examId, examData) => {
    const response = await api.put(`/exams/${examId}`, examData);
    return response.data;
  },

  // Delete exam
  deleteExam: async (examId) => {
    const response = await api.delete(`/exams/${examId}`);
    return response.data;
  },

  // Get exam statistics
  getExamStatistics: async (examId) => {
    const response = await api.get(`/exams/${examId}/statistics`);
    return response.data;
  },

  // Export grade sheet
  exportGradeSheet: async (examId) => {
    const response = await api.get(`/exams/${examId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default examService;

