const extractODataValue = (data) => {
  if (data && typeof data === 'object') {
    if (Array.isArray(data.value)) {
      return data.value;
    }
    if (data.value && typeof data.value === 'object') {
      return data.value;
    }
  }
  return data;
};

// OData base URL - OData endpoints are directly under /odata, not /api/odata
const ODATA_BASE_URL = import.meta.env.DEV ? '/odata' : (import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://localhost:7244/odata');

// Helper function to call OData endpoints
const odataGet = async (url) => {
  const token = localStorage.getItem('token');
  const fullUrl = `${ODATA_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (response.status === 401) {
    const error = new Error('Unauthorized');
    error.response = { status: 401 };
    throw error;
  }
  
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  if (!response.ok) {
    throw new Error(text || `HTTP error! status: ${response.status}`);
  }
  
  if (!text || text.trim() === '') {
    return { data: null };
  }
  
  if (contentType && contentType.includes('application/json')) {
    try {
      const data = JSON.parse(text);
      return { data };
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text}`);
    }
  }
  
  return { data: text };
};

export const dashboardService = {
  // Get overview statistics
  getOverviewStats: async () => {
    const response = await odataGet('/dashboard/getoverviewstats');
    return extractODataValue(response.data);
  },

  // Get exams by month
  getExamsByMonth: async (year = 2024) => {
    const response = await odataGet(`/dashboard/getexamsbymonth?year=${year}`);
    return extractODataValue(response.data);
  },

  // Get top lecturers by assignments
  getTopLecturersByAssignments: async (top = 10) => {
    const response = await odataGet(`/dashboard/gettoplecturersbyassignments?top=${top}`);
    return extractODataValue(response.data);
  },

  // Get score statistics by exam
  getScoreStatsByExam: async (examId) => {
    const response = await odataGet(`/dashboard/getscorestatsbyexam?examId=${examId}`);
    return extractODataValue(response.data);
  },
};

export default dashboardService;

