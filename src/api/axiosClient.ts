import axios from 'axios';

// PATRÓN SINGLETON: Configuración única de Axios para toda la aplicación
const axiosClient = axios.create({
  baseURL: 'https://67bc8205ed4860e07d5778a4.mockapi.io/api/v1', // URL de prueba (puedes cambiarla)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar tokens o errores globales
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
