const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://localhost:7244/api');

const api = {
  get: async (url, config = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      },
      ...config,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    

    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
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
  },

  post: async (url, body, config = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      },
      body: JSON.stringify(body),
      ...config,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    
    if (!response.ok) {
      // Try to parse error JSON response
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorJson = JSON.parse(text);
          if (errorJson.error?.details) {
            const error = new Error(errorJson.error.details);
            error.response = { data: errorJson, status: response.status };
            throw error;
          } else if (errorJson.error?.title) {
            const error = new Error(errorJson.error.title);
            error.response = { data: errorJson, status: response.status };
            throw error;
          }
        } catch (e) {
          // If parsing fails, use original text
        }
      }
      const error = new Error(text || `HTTP error! status: ${response.status}`);
      error.response = { status: response.status };
      throw error;
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
  },

  put: async (url, body, config = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      },
      body: JSON.stringify(body),
      ...config,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
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
  },

  delete: async (url, config = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      },
      ...config,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
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
  },

  upload: async (url, formData, config = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      },
      body: formData,
      ...config,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
      throw new Error('Unauthorized');
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
  },
};

export default api;
