import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/Home";
import { Estadisticas } from "../pages/Estadistica";
import { Productos } from "../pages/Producto";
import { Diagramas } from "../pages/Diagramas";
import { Reportes } from "../pages/Reportes";
export function MyRoutes() {
    return (


        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
            <Route path="/diagramas" element={<Diagramas />} />
            <Route path="/reportes" element={<Reportes />} />
        </Routes>

    );
}