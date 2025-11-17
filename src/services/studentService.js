import api from './api';

const studentService = {
  getStudentById: async (studentId) => {
    if (!studentId) {
      throw new Error('Student ID is required');
    }
    const response = await api.get(`/student/${studentId}`);
    return response.data;
  },
};

export default studentService;

