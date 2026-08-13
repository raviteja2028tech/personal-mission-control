import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL;
const baseURL = (rawUrl && !rawUrl.includes('your-backend.vercel.app')) 
  ? rawUrl 
  : 'http://localhost:5000/api/v1';


const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});


// Add JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (auto logout)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pmc_token');
      localStorage.removeItem('pmc_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
