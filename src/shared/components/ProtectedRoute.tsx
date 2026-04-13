import React, { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { ROUTES } from '../../core/constants/routes';

/**
 * COMPONENTE DE GUARD (MIDDLEWARE): Protege las rutas que requieren autenticación.
 * Valida validación RBAC basándose en la lista de permisos (rutas permitidas) del usuario.
 */
const ProtectedRoute: React.FC = () => {
  const { token, user } = useAuthStore();
  const location = useLocation();

  // Validación de permisos. Memoizamos la respuesta para evitar re-cálculos.
  const isAllowed = useMemo(() => {
    if (!token) return false;

    // Los administradores tienen acceso completo al frontend
    if (user?.rol?.nombre_rol === 'Administrador Global') return true;

    // Rutas base que siempre deberían estar permitidas si hay token
    const whitelist = [ROUTES.HOME, ROUTES.SELECT_SYSTEM, '/'];
    if (whitelist.includes(location.pathname)) return true;

    // Fallback: Si el backend todavía no envía permisos, permitimos
    if (!user?.permisos || !Array.isArray(user.permisos) || user.permisos.length === 0) return true;

    // Validación RBAC: Check de match exacto o rutas dinámicas hijas
    return user.permisos.some(
      (permiso) => location.pathname === permiso || location.pathname.startsWith(permiso + '/')
    );
  }, [token, user?.rol?.nombre_rol, user?.permisos, location.pathname]);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!isAllowed) {
    // Si intenta acceder a una ruta no permitida, lo devolvemos al inicio seguro.
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
