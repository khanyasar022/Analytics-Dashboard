import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadAPI = {
  uploadFile: (formData) => api.post('/upload/report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadJSON: (data) => api.post('/upload/json', data),
  getStatus: () => api.get('/upload/status'),
};

export const violationsAPI = {
  getViolations: (params = {}) => api.get('/violations', { params }),
  getFilters: () => api.get('/violations/filters'),
  getMapData: (params = {}) => api.get('/violations/map', { params }),
  searchViolations: (term, params = {}) => api.get(`/violations/search/${term}`, { params }),
  getViolation: (id) => api.get(`/violations/${id}`),
};

export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
  getKPIs: () => api.get('/analytics/kpis'),
  getPieChart: () => api.get('/analytics/charts/pie'),
  getTimeSeries: (params = {}) => api.get('/analytics/charts/timeseries', { params }),
  getDroneChart: () => api.get('/analytics/charts/drones'),
  getLocationChart: () => api.get('/analytics/charts/locations'),
  getSummary: () => api.get('/analytics/summary'),
};

export const boundariesAPI = {
  getBoundaries: () => api.get('/boundaries'),
  getKML: () => api.get('/boundaries/kml'),
};

export const healthAPI = {
  check: () => api.get('/health'),
  seed: () => api.post('/seed'),
};

export default api; 