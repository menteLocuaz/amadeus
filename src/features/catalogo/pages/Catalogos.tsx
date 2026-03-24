import React, { useState } from "react";
import { FiSearch, FiEye, FiRefreshCw, FiAlertTriangle, FiShoppingBag } from "react-icons/fi";
import styled from "styled-components";

// UI Components
import {
    PageContainer, TableCard, Table, ActionBtn, Badge,
    PageHeader, HeaderTitle, Toolbar, SearchBox,
    FormGroup, Thumbnail, Button
} from "../../../shared/components/UI";
import { ClimbingBoxLoader } from "react-spinners";

// Hook & Components
import { useCatalogo } from "../hooks/useCatalogo";
import { type Product } from "../../products/services/ProductService";
import { CatalogoModal } from "../components/CatalogoModal";

/* ----------------------------- Local Styled Components ----------------------------- */
const PriceText = styled.span`
  font-weight: 800;
  color: ${({ theme }) => theme.primary};
`;

const StatusIndicator = styled.div<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${({ $active }) => ($active ? "#22C55E15" : "#EF444415")};
  color: ${({ $active }) => ($active ? "#22C55E" : "#EF4444")};
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

const InventarioCatalogo: React.FC = () => {
    const {
        products, categories, sucursales, loading,
        search, setSearch,
        selectedCat, setSelectedCat,
        selectedSuc, setSelectedSuc,
        stockFilter, setStockFilter,
        loadData, getStatusLabel
    } = useCatalogo();

    const [viewProduct, setViewProduct] = useState<Product | null>(null);

    // Helpers for badge colors
    const getStockColor = (qty: number, min: number = 5) => {
        if (qty <= 0) return "#EF444422";
        if (qty <= min) return "#FCA31122";
        return "#10B98122";
    };

    const getStockTextColor = (qty: number, min: number = 5) => {
        if (qty <= 0) return "#EF4444";
        if (qty <= min) return "#FCA311";
        return "#10B981";
    };

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiShoppingBag color="#FCA311" /> Inventario & Catalogo</h1>
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
                    <Button onClick={loadData} $variant="secondary">
                        <FiRefreshCw className={loading ? "spin" : ""} /> Actualizar
                    </Button>
                </Toolbar>
            </PageHeader>

            <TableCard>
                <div style={{ padding: "20px", display: "flex", flexWrap: "wrap", gap: "15px", borderBottom: `1px solid rgba(0,0,0,0.05)`, background: `rgba(0,0,0,0.01)` }}>
                    <FormGroup style={{ width: "220px", marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5 }}>Categoria</label>
                        <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
                            <option value="all">Todas las Categorias</option>
                            {categories.map(c => {
                                const id = c.id_categoria || (c as any).id;
                                return <option key={id} value={id}>{c.nombre}</option>;
                            })}
                        </select>
                    </FormGroup>

                    <FormGroup style={{ width: "220px", marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5 }}>Sucursal</label>
                        <select value={selectedSuc} onChange={(e) => setSelectedSuc(e.target.value)}>
                            <option value="all">Todas las Sucursales</option>
                            {sucursales.map(s => {
                                const id = s.id || (s as any).id_sucursal;
                                return <option key={id} value={id}>{s.nombre}</option>;
                            })}
                        </select>
                    </FormGroup>

                    <FormGroup style={{ width: "200px", marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5 }}>Nivel de Stock</label>
                        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                            <option value="all">Todos los niveles</option>
                            <option value="low">Stock Bajo (5)</option>
                            <option value="out">Agotados (0)</option>
                        </select>
                    </FormGroup>
                </div>

                {loading ? (
                    <div style={{ padding: "100px", display: "flex", flexDirection: 'column', alignItems: "center", gap: 20 }}>
                        <ClimbingBoxLoader color="#FCA311" />
                        <p style={{ opacity: 0.5, fontWeight: 600 }}>Sincronizando inventario...</p>
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>SKU</th>
                                <th>Categoria</th>
                                <th>Precio Venta</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th style={{ textAlign: "right" }}>Ver</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "60px", opacity: 0.5 }}>
                                        No hay productos que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id || p.id_producto}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                <Thumbnail src={p.imagen || "https://placehold.co/50x50?text=No+Img"} />
                                                <div style={{ fontWeight: 700 }}>{p.nombre}</div>
                                            </div>
                                        </td>
                                        <td><Badge>{p.id_producto || "N/A"}</Badge></td>
                                        <td>{p.categoria?.nombre || "General"}</td>
                                        <td>
                                            <PriceText>
                                                {p.moneda?.nombre || "$"} {(p.precio_venta || 0).toFixed(2)}
                                            </PriceText>
                                        </td>
                                        <td>
                                            <Badge
                                                $color={getStockColor(p.stock || 0)}
                                                style={{ color: getStockTextColor(p.stock || 0), display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                            >
                                                {p.stock} {p.unidad?.nombre || "u"}
                                                {(p.stock || 0) <= 5 && <FiAlertTriangle size={12} />}
                                            </Badge>
                                        </td>
                                        <td>
                                            <StatusIndicator $active={p.id_status === "activo" || getStatusLabel(p) === "Disponible" || getStatusLabel(p) === "Activo"}>
                                                <span className="dot" />
                                                {getStatusLabel(p)}
                                            </StatusIndicator>
                                        </td>
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