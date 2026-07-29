import axios from 'axios';
import { APP_CONFIG } from '@/config/app';

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Future authentication token insertion placeholder
    // const token = useAuthStore.getState().token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected API error occurred';
    return Promise.reject(new Error(message));
  }
);
