import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "../pages/Home";
import { Estadisticas } from "../pages/Estadistica";
import { Productos } from "../pages/Producto";
import { Diagramas } from "../pages/Diagramas";
import { Reportes } from "../pages/Reportes";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { PosPage } from "../pages/Pos/PosPage";
import ProtectedRoute from "../components/ProtectedRoute";

export function MyRoutes() {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Rutas Protegidas (Dashboard & Gestión) */}
            <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/pos" element={<PosPage />} />
                <Route path="/estadisticas" element={<Estadisticas />} />
                <Route path="/diagramas" element={<Diagramas />} />
                <Route path="/reportes" element={<Reportes />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
