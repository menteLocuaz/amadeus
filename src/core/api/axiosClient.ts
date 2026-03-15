import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

// PATRÓN SINGLETON: Instancia única para la API PRUNUS
const axiosClient = axios.create({
  baseURL: 'http://localhost:9090/api/v1', // URL de la API PRUNUS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: Añade el token Bearer automáticamente
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Recupera el token guardado
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuestas: Manejo centralizado de errores
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado) o 403 (Prohibido)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Sesión expirada o no autorizada. Limpiando estado...');
      
      // Limpiamos el store globalmente desde fuera del componente
      const { logout } = useAuthStore.getState();
      logout();

      // Forzamos el salto al login si no estamos ya allí
      if (window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
