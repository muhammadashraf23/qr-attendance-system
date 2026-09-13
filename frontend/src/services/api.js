import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  // process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Attach JWT automatically ─────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('employee_token') ||
      localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Handle 401 globally ──────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('employee_token');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('employee_data');
      localStorage.removeItem('admin_data');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
