import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Readings API
export const readingsAPI = {
  create: (data) => api.post('/readings', data),
  getAll: (params) => api.get('/readings', { params }),
  getOne: (id) => api.get(`/readings/${id}`),
  update: (id, data) => api.put(`/readings/${id}`, data),
  delete: (id) => api.delete(`/readings/${id}`),
};

// Reports API
export const reportsAPI = {
  daily: (date) => api.get('/reports/daily', { params: { date } }),
  monthToDate: (date) => api.get('/reports/month-to-date', { params: { date } }),
  monthly: (date) => api.get('/reports/monthly', { params: { date } }),
};

export default api;
