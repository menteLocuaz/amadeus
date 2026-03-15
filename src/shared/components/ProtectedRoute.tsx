import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * COMPONENTE DE GUARD (MIDDLEWARE): Protege las rutas que requieren autenticación.
 * Si no existe un token en localStorage, redirige al LoginPage (root).
 */
const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('token');

  // Si no hay token, redirigimos al login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si hay token, permitimos el acceso a las rutas hijas (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
