import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

/**
 * COMPONENTE DE GUARD (MIDDLEWARE): Protege las rutas que requieren autenticación.
 * Si no existe un token en useAuthStore, redirige al LoginPage (root).
 */
const ProtectedRoute: React.FC = () => {
  const { token } = useAuthStore();

  // Si no hay token, redirigimos al login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si hay token, permitimos el acceso a las rutas hijas (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
