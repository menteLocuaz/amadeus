/**
 * InventarioCatalogo.tsx
 * Vista de consulta de inventario y catálogo de productos.
 * Permite filtrar por categoría, sucursal y nivel de stock.
 */

import React, { useState } from "react";
import { FiSearch, FiEye, FiRefreshCw, FiAlertTriangle, FiShoppingBag } from "react-icons/fi";
import styled, { useTheme } from "styled-components";

// Componentes UI compartidos
import {
    PageContainer, TableCard, Table, ActionBtn, Badge,
    PageHeader, HeaderTitle, Toolbar, SearchBox,
    FormGroup, Thumbnail, Button
} from "../../../shared/components/UI";
import { ClimbingBoxLoader } from "react-spinners";

// Hook personalizado que encapsula toda la lógica de datos y filtros del catálogo
import { useCatalogo } from "../hooks/useCatalogo";
// Solo se importa el tipo Product para tipar el estado del modal
import { type Product } from "../../products/services/ProductService";
// Modal que muestra el detalle completo de un producto seleccionado
import { CatalogoModal } from "../components/CatalogoModal";

/** Texto de precio con color primario del tema */
const PriceText = styled.span`
  font-weight: 800;
  color: ${({ theme }) => theme.primary};
`;
/** Indicador visual de estado activo/inactivo con punto animado */
const StatusIndicator = styled.div<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${({ $active, theme }) => ($active ? `${theme.success}15` : `${theme.danger}15`)};
  color: ${({ $active, theme }) => ($active ? theme.success : theme.danger)};
  font-size: 0.8rem;
  font-weight: 700;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }
`;
/** Fila de filtros con separador inferior */
const FilterRow = styled.div`
  padding: 20px; 
  display: flex; 
  flex-wrap: wrap; 
  gap: 15px; 
  border-bottom: 1px solid ${({ theme }) => theme.bg3}22; 
  background: ${({ theme }) => theme.bg}05;
`;
/** Contenedor centrado para el estado de carga */
const LoaderWrap = styled.div`
  padding: 100px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 20px;
  p { opacity: 0.6; font-weight: 600; color: ${({ theme }) => theme.text}; }
`;
/** Mensaje cuando no hay resultados */
const EmptyState = styled.div`
  text-align: center; 
  padding: 80px 20px; 
  opacity: 0.5;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`;

const InventarioCatalogo: React.FC = () => {
    // Acceso al tema de styled-components para usar colores dinámicos fuera de CSS
    const theme = useTheme();

    // Desestructuración del hook: datos ya filtrados + estados de filtro + helpers
    const {
        products,       // Lista de productos filtrada por useMemo en el hook
        categories,     // Categorías para el select de filtro
        sucursales,     // Sucursales para el select de filtro
        loading,        // true mientras se cargan los datos desde la API
        search, setSearch,
        selectedCat, setSelectedCat,
        selectedSuc, setSelectedSuc,
        stockFilter, setStockFilter,
        loadData,           // Recarga manual de datos
        getStatusLabel,     // Resuelve el texto del estado del producto
        getSucursalLabel    // Resuelve el nombre de la sucursal del producto
    } = useCatalogo();

    // Producto seleccionado para mostrar en el modal de detalle; null = modal cerrado
    const [viewProduct, setViewProduct] = useState<Product | null>(null);

    // Helpers for badge colors using theme
    // Devuelve el color de fondo del badge de stock según la cantidad disponible
    // Se añade "22" al hex del color para obtener ~13% de opacidad
    const getStockColor = (qty: number, min: number = 5) => {
        if (qty <= 0) return `${theme.danger}22`;   // Agotado → rojo translúcido
        if (qty <= min) return `${theme.warning}22`; // Stock bajo → amarillo translúcido
        return `${theme.success}22`;                 // Stock normal → verde translúcido
    };

    // Devuelve el color del texto del badge de stock (mismo criterio que getStockColor)
    const getStockTextColor = (qty: number, min: number = 5) => {
        if (qty <= 0) return theme.danger;
        if (qty <= min) return theme.warning;
        return theme.success;
    };

    return (
        <PageContainer>
            {/* ── Encabezado: título + barra de búsqueda + botón de recarga ── */}
            <PageHeader>
                <HeaderTitle>
                    <h1><FiShoppingBag color={theme.primary} /> Inventario & Catálogo</h1>
                    <p>Consulta de existencias, precios y disponibilidad en tiempo real.</p>
                </HeaderTitle>

                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar por nombre o ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </SearchBox>
                    {/* La clase "spin" activa una animación CSS de rotación mientras carga */}
                    <Button onClick={loadData} $variant="secondary">
                        <FiRefreshCw className={loading ? "spin" : ""} /> Actualizar
                    </Button>
                </Toolbar>
            </PageHeader>

            <TableCard>
                {/* ── Fila de filtros: categoría, sucursal y nivel de stock ── */}
                <FilterRow>
                    {/* Filtro por categoría: usa id_categoria o id como fallback de clave */}
                    <FormGroup style={{ width: "220px", marginBottom: 0 }}>
                        <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>Categoría</label>
                        <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                            <option value="all">Todas las Categorías</option>
                            {categories.map(c => {
                                // Compatibilidad con distintas versiones del servicio de categorías
                                const id = c.id_categoria || (c as any).id;
                                return <option key={id} value={id}>{c.nombre}</option>;
                            })}
                        </select>
                    </FormGroup>

                    {/* Filtro por sucursal: usa id_sucursal o id como fallback de clave */}
                    <FormGroup style={{ width: "220px", marginBottom: 0 }}>
                        <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>Sucursal</label>
                        <select value={selectedSuc} onChange={(e) => setSelectedSuc(e.target.value)}>
                            <option value="all">Todas las Sucursales</option>
                            {sucursales.map(s => {
                                // Compatibilidad con distintas versiones del servicio de sucursales
                                const id = s.id_sucursal || s.id;
                                const nombre = s.nombre_sucursal || s.nombre;
                                return <option key={id} value={id}>{nombre}</option>;
                            })}
                        </select>
                    </FormGroup>

                    {/* Filtro por nivel de stock: "all" | "low" (1-5) | "out" (0) */}
                    <FormGroup style={{ width: "200px", marginBottom: 0 }}>
                        <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: 700 }}>Nivel de Stock</label>
                        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                            <option value="all">Todos los niveles</option>
                            <option value="low">Stock Bajo (≤ 5)</option>
                            <option value="out">Agotados (0)</option>
                        </select>
                    </FormGroup>
                </FilterRow>

                {/* ── Contenido principal: loader o tabla de productos ── */}
                {loading ? (
                    // Estado de carga: se muestra mientras se obtienen datos de la API
                    <LoaderWrap>
                        <ClimbingBoxLoader color={theme.primary} />
                        <p>Sincronizando inventario...</p>
                    </LoaderWrap>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>SKU</th>
                                <th>Categoría</th>
                                <th>Sucursal</th>
                                <th>Precio Venta</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th style={{ textAlign: "right" }}>Ver</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                // Estado vacío: ningún producto coincide con los filtros activos
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyState>
                                            No hay productos que coincidan con los filtros aplicados.
                                        </EmptyState>
                                    </td>
                                </tr>
                            ) : (
                                // Renderizado de filas: p.id es el UUID, p.id_producto es el SKU legible
                                products.map((p) => (
                                    <tr key={p.id || p.id_producto}>
                                        {/* Columna Producto: miniatura + nombre */}
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                {/* Imagen del producto; placeholder si no tiene imagen asignada */}
                                                <Thumbnail src={p.imagen || "https://placehold.co/50x50?text=No+Img"} />
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.nombre}</div>
                                            </div>
                                        </td>
                                        {/* Columna SKU: identificador único del producto */}
                                        <td><Badge>{p.id_producto || "N/A"}</Badge></td>
                                        {/* Columna Categoría: relación anidada del backend */}
                                        <td>{p.categoria?.nombre || "General"}</td>
                                        {/* Columna Sucursal: resuelta por el helper del hook */}
                                        <td>{getSucursalLabel(p)}</td>
                                        {/* Columna Precio: moneda + precio formateado a 2 decimales */}
                                        <td>
                                            <PriceText>
                                                {p.moneda?.nombre || "$"} {(p.precio_venta || 0).toFixed(2)}
                                            </PriceText>
                                        </td>
                                        {/* Columna Stock: badge con color dinámico + ícono de alerta si stock ≤ 5 */}
                                        <td>
                                            <Badge
                                                $color={getStockColor(p.stock || 0)}
                                                style={{ color: getStockTextColor(p.stock || 0), display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px' }}
                                            >
                                                {p.stock} {p.unidad?.nombre || "u"}
                                                {/* Ícono de advertencia visible solo cuando el stock es crítico */}
                                                {(p.stock || 0) <= 5 && <FiAlertTriangle size={12} />}
                                            </Badge>
                                        </td>
                                        {/* Columna Estado: indicador verde/rojo según si el producto está activo */}
                                        <td>
                                            {/* $active evalúa tres posibles representaciones del estado activo */}
                                            <StatusIndicator $active={p.id_status === "activo" || getStatusLabel(p) === "Disponible" || getStatusLabel(p) === "Activo"}>
                                                <span className="dot" />
                                                {getStatusLabel(p)}
                                            </StatusIndicator>
                                        </td>
                                        {/* Columna Ver: abre el modal de detalle con el producto seleccionado */}
                                        <td style={{ textAlign: "right" }}>
                                            <ActionBtn onClick={() => setViewProduct(p)} title="Ver detalles">
                                                <FiEye />
                                            </ActionBtn>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </TableCard>

            {/* Modal de Detalle de Producto */}
            {/* Se renderiza condicionalmente; onClose limpia el estado para cerrar el modal */}
            {viewProduct && (
                <CatalogoModal
                    product={viewProduct}
                    onClose={() => setViewProduct(null)}
                    getStatusLabel={getStatusLabel}
                />
            )}
        </PageContainer>
    );
};

export default InventarioCatalogo;