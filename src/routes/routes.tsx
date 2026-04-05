import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import NotFoundPage from "../shared/components/NotFoundPage";
import MainLayout from "../shared/components/Layouts/MainLayout";
import { ROUTES } from "../core/constants/routes";
import { ClimbingBoxLoader } from "react-spinners";

const PageLoader = () => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "100vh", gap: 16, opacity: 0.7,
  }}>
    <ClimbingBoxLoader color="#FCA311" size={14} />
    <span style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: 1 }}>Cargando...</span>
  </div>
);

// --- Lazy load de páginas ---
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const Home = lazy(() => import("../features/stats/pages/Home"));
const Estadisticas = lazy(() => import("../features/stats/pages/Estadistica"));
const Productos = lazy(() => import("../features/products/pages/Productos"));
const PosPage = lazy(() => import("../features/pos/pages/PosPage"));
const Diagramas = lazy(() => import("../features/stats/pages/Diagramas"));
const Reportes = lazy(() => import("../features/stats/pages/Reportes"));
const Configuración = lazy(() => import("../features/stats/pages/Configuración"));
const RolesPage = lazy(() => import("../features/roles/pages/RolesPage"));
const Categoria = lazy(() => import("../features/Categoria/pages/Categoria"));
const Medidas = lazy(() => import("../features/stats/pages/Medidas"));
const Monedas = lazy(() => import("../features/Moneda/pages/Monedas"));
const Catalogos = lazy(() => import("../features/catalogo/pages/Catalogos"));
const Inventario = lazy(() => import("../features/inventory/pages/InventarioPremium"));
const Proveedores = lazy(() => import("../features/proveedor/pages/Proveedores"));
const Compras = lazy(() => import("../features/purchases/pages/Compras"));
const Kardex = lazy(() => import("../features/inventory/pages/Kardex"));
const AperturaCaja = lazy(() => import("../features/pos/pages/AperturaCaja"));
const SelectSystem = lazy(() => import("../features/orion/MecanicaSele"));
const MecanicaManagement = lazy(() => import("../features/orion/MecanicaManagement"));
const DispositivoPage = lazy(() => import("../features/dispositivos/pages/Dispositivo"));
const EstatusPage = lazy(() => import("../features/estatus/pages/Estatuspage"));
const EstacionPage = lazy(() => import("../features/estacion/pages/Estacion"));
const EmpresaPage = lazy(() => import("../features/empresa/pages/Empresa"));
const SucursalPage = lazy(() => import("../features/sucursal/pages/Sucursal"));
const UsuarioPage = lazy(() => import("../features/usuario/pages/Usuariospage"));

/**
 * Sistema de Rutas Centralizado
 * Implementa Carga Perezosa (Lazy Loading) para mejorar el rendimiento inicial.
 * El uso de MainLayout desacopla el diseño de la lógica de App.tsx.
 */
export function MyRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* --- Rutas Públicas (Sin Layout de Dashboard) --- */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* --- Rutas Protegidas --- */}
        <Route element={<ProtectedRoute />}>
          {/* 
            Anidamos las rutas dentro de MainLayout. 
            Todas estas rutas heredarán automáticamente el Sidebar y el Contenedor.
          */}
          <Route element={<MainLayout />}>
            <Route path={ROUTES.HOME} element={<Home />} />
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
            <Route path={ROUTES.CATALOGO} element={<Catalogos />} />
            <Route path={ROUTES.INVENTARIO} element={<Inventario />} />
            <Route path={ROUTES.PROVEEDORES} element={<Proveedores />} />
            <Route path={ROUTES.COMPRAS} element={<Compras />} />
            <Route path={ROUTES.KARDEX} element={<Kardex />} />
            <Route path={ROUTES.POS_APERTURA} element={<AperturaCaja />} />
            <Route path={ROUTES.MECANICAS} element={<MecanicaManagement />} />
            <Route path={ROUTES.DISPOSITIVOS} element={<DispositivoPage />} />
            <Route path={ROUTES.ESTATUS} element={<EstatusPage />} />
            <Route path={ROUTES.ESTACIONES} element={<EstacionPage />} />
            <Route path={ROUTES.EMPRESAS} element={<EmpresaPage />} />
            <Route path={ROUTES.SUCURSALES} element={<SucursalPage />} />
            <Route path={ROUTES.USUARIOS} element={<UsuarioPage />} />
          </Route>

          {/* Ruta de selección de sistema (Public/Private sin Sidebar) */}
          <Route path={ROUTES.SELECT_SYSTEM} element={<SelectSystem />} />
        </Route>

        {/* Error 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}