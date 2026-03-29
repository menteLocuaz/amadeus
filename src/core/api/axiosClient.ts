import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

// PATRÓN SINGLETON: Instancia única para la API PRUNUS
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // URL de la API PRUNUS desde variables de entorno
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: Añade el token Bearer automáticamente
axiosClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState(); // Recupera el token del store persistido
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
      
      // Usamos clearSession (solo limpia estado local, sin llamada a la API)
      // para evitar disparar otro request desde dentro del interceptor
      const { clearSession } = useAuthStore.getState();
      clearSession();

      // Forzamos el salto al login si no estamos ya allí
      if (window.location.pathname !== '/') {
        window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
