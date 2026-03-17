import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import NotFoundPage from "../shared/components/NotFoundPage";
import { ROUTES } from "../core/constants/routes";

// Lazy load de páginas
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const Home = lazy(() => import("../features/stats/pages/Home"));
const Estadisticas = lazy(() => import("../features/stats/pages/Estadistica"));
const Productos = lazy(() => import("../features/products/pages/Productos"));
const PosPage = lazy(() => import("../features/pos/pages/PosPage"));
const Diagramas = lazy(() => import("../features/stats/pages/Diagramas"));
const Reportes = lazy(() => import("../features/stats/pages/Reportes"));
const Configuración = lazy(() => import("../features/stats/pages/Configuración"));
const RolesPage = lazy(() => import("../features/auth/pages/RolesPage"));
const Categoria = lazy(() => import("../features/stats/pages/Categoria"));
const Medidas = lazy(() => import("../features/stats/pages/Medidas"));
const Monedas = lazy(() => import("../features/stats/pages/Moneda"));
const Inventario = lazy(()=> import("../features/catalogo/pages/Catalogos"));
const Proveedores = lazy(() => import("../features/proveedor/pages/Proveedores"));
const Compras = lazy(() => import("../features/purchases/pages/Compras"));

export function MyRoutes() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        {/* Rutas Públicas */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Rutas Protegidas (Dashboard & Gestión) */}
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.PRODUCTOS} element={<Productos />} />
          <Route path={ROUTES.POS} element={<PosPage />} />
          <Route path={ROUTES.ESTADISTICAS} element={<Estadisticas />} />
          <Route path={ROUTES.DIAGRAMAS} element={<Diagramas />} />
          <Route path={ROUTES.REPORTES} element={<Reportes />} />
          <Route path={ROUTES.CONFIG} element={<Configuración />} />
          <Route path={ROUTES.ROLES} element={<RolesPage />} />
          <Route path={ROUTES.CATEGORIAS} element={<Categoria />} />
          <Route path={ROUTES.MEDIDAS} element={<Medidas />} />
          <Route path={ROUTES.MONEDAS} element={<Monedas />} />
          <Route path={ROUTES.INVENTARIO} element={<Inventario />} />
          <Route path={ROUTES.PROVEEDORES} element={<Proveedores />} />
          <Route path={ROUTES.COMPRAS} element={<Compras />} />
        </Route>

        {/* Error 404 - Página no encontrada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}