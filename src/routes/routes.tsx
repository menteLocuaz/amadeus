import { Routes, Route } from "react-router-dom";
import { Home } from "../features/stats/pages/Home";
import { Estadisticas } from "../features/stats/pages/Estadistica";
import Productos from "../features/products/pages/Productos";
import { Diagramas } from "../features/stats/pages/Diagramas";
import { Reportes } from "../features/stats/pages/Reportes";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import { PosPage } from "../features/pos/pages/PosPage";
import { Configuración } from "../features/stats/pages/Configuración";
import RolesPage from "../features/auth/pages/RolesPage";
import Categoria from "../features/stats/pages/Categoria";
import Medidas from "../features/stats/pages/Medidas";
import Monedas from "../features/stats/pages/Moneda";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import NotFoundPage from "../shared/components/NotFoundPage";
import { ROUTES } from "../core/constants/routes";

export function MyRoutes() {
    return (
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
            </Route>

            {/* Error 404 - Página no encontrada */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
