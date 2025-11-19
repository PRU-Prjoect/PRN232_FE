import api from './api';

export const examService = {

  getExams: async (params = {}) => {
    const { 
      pageIndex = 1, 
      pageSize = 10, 
      searchTerm = '', 
      subjectCode = '', 
      semester = '', 
      academicYear = '', 
      isActive = null 
    } = params;
    
    const queryParams = new URLSearchParams();
    if (pageIndex) queryParams.append('pageIndex', pageIndex);
    if (pageSize) queryParams.append('pageSize', pageSize);
    if (searchTerm) queryParams.append('searchTerm', searchTerm);
    if (subjectCode) queryParams.append('subjectCode', subjectCode);
    if (semester) queryParams.append('semester', semester);
    if (academicYear) queryParams.append('academicYear', academicYear);
    if (isActive !== null && isActive !== undefined) queryParams.append('isActive', isActive);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/exam?${queryString}` : '/exam';
    const response = await api.get(url);
    return response.data;
  },

  // Get exam by ID
  getExamById: async (examId) => {
    const response = await api.get(`/exam/${examId}`);
    return response.data;
  },

  // Create exam - POST /api/exam
  createExam: async (examData) => {
    const response = await api.post('/exam', examData);
    return response.data;
  },

  // Update exam - PUT /api/exam/{id}
  updateExam: async (examId, examData) => {
    const response = await api.put(`/exam/${examId}`, examData);
    return response.data;
  },

  // Delete exam - DELETE /api/exam/{id}
  deleteExam: async (examId) => {
    const response = await api.delete(`/exam/${examId}`);
    return response.data;
  },

  // Get exam statistics
  getExamStatistics: async (examId) => {
    const response = await api.get(`/exam/${examId}/statistics`);
    return response.data;
  },

  // Export grade sheet
  exportGradeSheet: async (examId) => {
    const response = await api.get(`/exam/${examId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export ZIP with exam ID
  exportZip: async (examId) => {
    const response = await api.get(`/exam/${examId}/export-zip`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Import ZIP for exam - POST /api/exam/{id}/import-zip
  importZip: async (examId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://localhost:7244/api');
    
    const response = await fetch(`${API_URL}/exam/${examId}/import-zip`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    
    // Response is JSON with jobId and other info
    const data = await response.json();
    return data;
  },

  // Get import status for exam - GET /api/exam/{examId}/import-status
  getImportStatus: async (examId) => {
    const response = await api.get(`/exam/${examId}/import-status`);
    return response.data;
  },

  // Get import zip status - GET /api/exam/{id}/import-zip/status/{jobId}
  getImportZipStatus: async (examId, jobId) => {
    const response = await api.get(`/exam/${examId}/import-zip/status/${jobId}`);
    return response.data;
  },

  // Get submissions by exam ID
  getSubmissionsByExam: async (examId) => {
    const response = await api.get(`/exam/${examId}/submissions`);
    return response.data;
  },

  // Get exam statistics and exported info
  getExamExportedInfo: async (examId) => {
    const response = await api.get(`/exam/${examId}/exported-info`);
    return response.data;
  },

  // Run duplicate check for an exam
  runDuplicateCheck: async (examId, payload = { autoGenerateSimilarities: true }) => {
    if (!examId) {
      throw new Error('Exam ID is required to run duplicate check');
    }
    const response = await api.post(`/exams/${examId}/duplicate-check`, payload);
    return response.data;
  },

  // Download exam paper - GET /api/exam/{id}/exam-paper
  downloadExamPaper: async (examId) => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://localhost:7244/api');
    
    const response = await fetch(`${API_URL}/exam/${examId}/exam-paper`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    let filename = null;
    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (utf8Match) {
        try {
          filename = decodeURIComponent(utf8Match[1]);
        } catch (e) {

        }
      }

      if (!filename) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
        }
      }
    }
    
    return { blob, filename };
  },

  // Download marking sheet - GET /api/exam/{id}/marking-sheet
  downloadMarkingSheet: async (examId) => {
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://localhost:7244/api');
    
    const response = await fetch(`${API_URL}/exam/${examId}/marking-sheet`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    let filename = null;
    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (utf8Match) {
        try {
          filename = decodeURIComponent(utf8Match[1]);
        } catch (e) {

        }
      }
      
      if (!filename) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').trim();
        }
      }
    }
    
    return { blob, filename };
  },
};

export default examService;

