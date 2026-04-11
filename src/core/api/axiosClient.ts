import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

/**
 * Singleton Pattern: Unique instance for PRUNUS API.
 * Centralizes configuration for all HTTP requests.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor: Automatically injects the Bearer token.
 * Retrieves the latest token from the persisted Zustand store.
 */
axiosClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response Interceptor: Centralized error handling.
 * Specifically manages 401 (Unauthorized) and 403 (Forbidden) statuses
 * by clearing the local session and redirecting to the login page.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn(`Auth error (${status}). Clearing session and redirecting...`);
      
      const { clearSession } = useAuthStore.getState();
      clearSession();

      // Use a soft redirect if already on login or home, otherwise force reload to home.
      // This prevents infinite loops if the redirect itself fails or is intercepted.
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/login') {
        window.location.href = '/'; 
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
