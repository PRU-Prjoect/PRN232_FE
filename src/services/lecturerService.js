import api from './api';

// Lecturer-related API calls
export const lecturerService = {
  getLecturers: async ({ pageIndex = 1, pageSize = 10, sortDirection = 'asc' } = {}) => {
    const query = `?pageIndex=${pageIndex}&pageSize=${pageSize}&sortDirection=${sortDirection}`;
    const { data } = await api.get(`/lecturer${query}`);
    return data;
  },
  createLecturer: async (payload) => {
    const { data } = await api.post('/lecturer', payload);
    return data;
  },
  getLecturerById: async (id) => {
    const { data } = await api.get(`/lecturer/${id}`);
    return data;
  },
  deleteLecturer: async (id) => {
    const { data } = await api.delete(`/lecturer/${id}`);
    return data;
  },
};

export default lecturerService;


