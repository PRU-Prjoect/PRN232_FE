import api from './api';

export const partService = {
  // Get parts by exam ID
  getParts: async (params = {}) => {
    const { 
      pageIndex = 1, 
      pageSize = 10, 
      sortColumn = '',
      sortDirection = 'asc',
      examId = null
    } = params;
    
    const queryParams = new URLSearchParams();
    if (pageIndex) queryParams.append('pageIndex', pageIndex);
    if (pageSize) queryParams.append('pageSize', pageSize);
    if (sortColumn) queryParams.append('sortColumn', sortColumn);
    if (sortDirection) queryParams.append('sortDirection', sortDirection);
    if (examId) queryParams.append('examId', examId);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/part?${queryString}` : '/part';
    const response = await api.get(url);
    return response.data;
  },

  // Get part by ID
  getPartById: async (partId) => {
    const response = await api.get(`/part/${partId}`);
    return response.data;
  },

  // Create part
  createPart: async (partData) => {
    const response = await api.post('/part', partData);
    return response.data;
  },

  // Update part
  updatePart: async (partId, partData) => {
    const response = await api.put(`/part/${partId}`, partData);
    return response.data;
  },

  // Delete part
  deletePart: async (partId) => {
    const response = await api.delete(`/part/${partId}`);
    return response.data;
  },
};

export default partService;

