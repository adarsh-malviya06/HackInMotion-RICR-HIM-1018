// Centralized API Client with credentials (HttpOnly Cookie support)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Essential for sending & receiving HttpOnly cookies
    ...options
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred during API request');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkErr = new Error('Backend server is unreachable. Please ensure http://localhost:5000 is running.');
      networkErr.status = 503;
      throw networkErr;
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),

  // Financial API Methods (User-Scoped)
  transactions: {
    getAll: () => request('/api/transactions', { method: 'GET' }),
    getById: (id) => request(`/api/transactions/${id}`, { method: 'GET' }),
    create: (data) => request('/api/transactions', { method: 'POST', body: data }),
    import: (itemsPayload) => request('/api/transactions/import', { 
      method: 'POST', 
      body: Array.isArray(itemsPayload) ? { items: itemsPayload } : itemsPayload 
    }),
    update: (id, data) => request(`/api/transactions/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' })
  },

  budgets: {
    getAll: () => request('/api/budgets', { method: 'GET' }),
    save: (data) => request('/api/budgets', { method: 'POST', body: data })
  },

  goals: {
    getAll: () => request('/api/goals', { method: 'GET' }),
    create: (data) => request('/api/goals', { method: 'POST', body: data }),
    deposit: (id, amount) => request(`/api/goals/${id}/deposit`, { method: 'POST', body: { amount } })
  }
};
