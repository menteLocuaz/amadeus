import React, { useState, useMemo } from "react";
import { useTheme } from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage,
    FiRefreshCw, FiAlertTriangle, FiCalendar
} from "react-icons/fi";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

// Hooks & Services
import { useProducts } from "../hooks/useProducts";
import { ProductModal } from "../components/ProductModal";
import { type Product } from "../services/ProductService";

// UI Components
import {
    PageContainer, TableCard, Table, ActionBtn, Badge,
    PageHeader, Toolbar, SearchBox, Button
} from "../../../shared/components/UI";
import { ProductCell, PriceText } from "../../../shared/components/UI/molecules/ProductCell";

// Styles
import {
    BoldHeader, StaggeredRow,
    StatsStrip, StatItem, StatValue, StatLabel,
    StockBar
} from "./Productos.styles";

const columnHelper = createColumnHelper<Product>();

const STOCK_MAX = 50; // reference max for the mini bar (50 units = 100%)

function getStockColor(theme: ReturnType<typeof useTheme>, val: number): string {
    if (val === 0) return theme.danger;
    if (val <= 5) return theme.warning;
    return theme.success;
}

function getExpiryState(fecha?: string): "expired" | "soon" | "ok" | "none" {
    if (!fecha) return "none";
    const diff = (new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "expired";
    if (diff <= 30) return "soon";
    return "ok";
}

function formatDate(fecha?: string): string {
    if (!fecha) return "---";
    return new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Productos Page — Inventory Central
 * Dense, precise. Every row carries a stock-health accent stripe (left edge).
 * Stats strip surfaces problems before the operator reads a single row.
 */
const Productos: React.FC = () => {
    const theme = useTheme();

    // 1. Data Fetching
    const {
        products, categories, units, currencies, sucursales, estatusList,
        statusMap, isLoading, isDeletingId, user, refresh, deleteProduct
    } = useProducts();

    // 2. UI State
    const [globalFilter, setGlobalFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // 3. Inventory health stats — surfaces problems before scanning rows
    const stats = useMemo(() => {
        const total = products.length;
        const disponibles = products.filter(p => (p.stock ?? 0) > 5).length;
        const bajos = products.filter(p => { const s = p.stock ?? 0; return s > 0 && s <= 5; }).length;
        const agotados = products.filter(p => (p.stock ?? 0) === 0).length;
        return { total, disponibles, bajos, agotados };
    }, [products]);

    // 4. Handlers
    const handleEdit = (p: Product) => { setEditingProduct(p); setIsModalOpen(true); };
    const handleCreate = () => { setEditingProduct(null); setIsModalOpen(true); };

    // 5. TanStack Table Columns
    const columns = useMemo(() => [
        columnHelper.accessor(row => row.pro_nombre || row.nombre, {
            id: "nombre",
            header: "Producto",
            cell: info => (
                <ProductCell
                    nombre={info.getValue() || "Sin nombre"}
                    sku={info.row.original.sku || info.row.original.id_producto || "---"}
                    codigo={info.row.original.pro_codigo || info.row.original.codigo_barras}
                    imagen={info.row.original.imagen}
                    placeholderIcon={FiPackage}
                />
            )
        }),

        columnHelper.accessor("precio_venta", {
            header: () => <div style={{ textAlign: "right" }}>Precio</div>,
            cell: info => (
                <PriceText style={{
                    fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
                    fontSize: "0.95rem",
                    letterSpacing: "-0.02em"
                }}>
                    ${(info.getValue() || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </PriceText>
            )
        }),

        columnHelper.accessor("stock", {
            header: () => <div style={{ textAlign: "right" }}>Stock</div>,
            cell: info => {
                const val = info.getValue() ?? 0;
                const color = getStockColor(theme, val);
                const percent = Math.min(100, (val / STOCK_MAX) * 100);
                return (
                    <div style={{ textAlign: "right" }}>
                        <div style={{
                            fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
                            fontSize: "1rem",
                            fontWeight: 700,
                            color,
                            lineHeight: 1
                        }}>
                            {val}
                        </div>
                        <StockBar $percent={percent} $color={color} style={{ marginLeft: "auto" }} />
                    </div>
                );
            }
        }),

        columnHelper.accessor("fecha_vencimiento", {
            header: () => <div style={{ display: "flex", alignItems: "center", gap: 4 }}><FiCalendar size={12} /> Vence</div>,
            cell: info => {
                const state = getExpiryState(info.getValue());
                if (state === "none") return <span style={{ opacity: 0.3, fontSize: "0.8rem" }}>—</span>;
                const color = state === "expired" ? theme.danger : state === "soon" ? theme.warning : theme.success;
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {state !== "ok" && <FiAlertTriangle size={12} color={color} />}
                        <span style={{
                            fontSize: "0.8rem",
                            fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
                            color: state === "ok" ? undefined : color,
                            opacity: state === "ok" ? 0.6 : 1,
                        }}>
                            {formatDate(info.getValue())}
                        </span>
                    </div>
                );
            }
        }),

        columnHelper.accessor(row => row.categoria?.nombre, {
            id: "categoria_nombre",
            header: "Categoría",
            cell: info => (
                <Badge $color={`${theme.primary}18`} style={{ color: theme.primary, fontSize: "0.75rem" }}>
                    {info.getValue() || "S/C"}
                </Badge>
            )
        }),

        columnHelper.accessor("id_status", {
            header: "Estado",
            cell: info => {
                const name = statusMap[info.getValue()] || "ACTIVO";
                const isInactive = name.toUpperCase().includes("INACTIVO") || name.toUpperCase().includes("CANCELADO");
                return (
                    <Badge
                        $color={isInactive ? `${theme.danger}18` : `${theme.success}18`}
                        style={{ color: isInactive ? theme.danger : theme.success, fontSize: "0.75rem" }}
                    >
                        {name}
                    </Badge>
                );
            }
        }),

        columnHelper.display({
            id: "acciones",
            header: () => <div style={{ textAlign: "right" }}>Acciones</div>,
            cell: info => (
                // .row-actions class triggers opacity reveal on row hover
                <div className="row-actions" style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <ActionBtn onClick={() => handleEdit(info.row.original)} title="Editar">
                        <FiEdit2 size={14} />
                    </ActionBtn>
                    <ActionBtn
                        $variant="delete"
                        onClick={() => deleteProduct(info.row.original.id_producto!)}
                        title="Eliminar"
                    >
                        {isDeletingId === info.row.original.id_producto
                            ? <ClimbingBoxLoader size={6} color="#ef4444" />
                            : <FiTrash2 size={14} />
                        }
                    </ActionBtn>
                </div>
            )
        })
    ], [isDeletingId, theme, statusMap]);

    // 6. Table Instance
    const table = useReactTable({
        data: products,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 15 } }
    });

    return (
        <PageContainer>
            <PageHeader style={{ paddingBottom: "2rem" }}>
                <BoldHeader>
                    <h1><FiPackage color={theme.primary} /> Inventario Central</h1>
                    <p>Catálogo de productos · Gestión de existencias</p>
                </BoldHeader>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar por nombre, SKU o código..."
                            value={globalFilter ?? ""}
                            onChange={e => setGlobalFilter(e.target.value)}
                        />
                    </SearchBox>
                    <ActionBtn onClick={() => refresh()} title="Actualizar">
                        <FiRefreshCw size={14} />
                    </ActionBtn>
                    <Button onClick={handleCreate}>
                        <FiPlus /> Nuevo Producto
                    </Button>
                </Toolbar>
            </PageHeader>

            {/* Stats strip — inventory health at a glance */}
            {!isLoading && (
                <StatsStrip>
                    <StatItem>
                        <StatValue>{stats.total}</StatValue>
                        <StatLabel>Total SKUs</StatLabel>
                    </StatItem>
                    <StatItem $accent={theme.success}>
                        <StatValue style={{ color: theme.success }}>{stats.disponibles}</StatValue>
                        <StatLabel>Disponibles</StatLabel>
                    </StatItem>
                    <StatItem $accent={theme.warning}>
                        <StatValue style={{ color: theme.warning }}>{stats.bajos}</StatValue>
                        <StatLabel>Stock bajo</StatLabel>
                    </StatItem>
                    <StatItem $accent={theme.danger}>
                        <StatValue style={{ color: theme.danger }}>{stats.agotados}</StatValue>
                        <StatLabel>Agotados</StatLabel>
                    </StatItem>
                </StatsStrip>
            )}

            <TableCard style={{
                borderRadius: "12px",
                border: `1px solid ${theme.bg3}2A`,
                background: theme.bg,
                overflow: "hidden"
            }}>
                {isLoading ? (
                    <div style={{ padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                        <ClimbingBoxLoader color={theme.primary} />
                        <p style={{ opacity: 0.4, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Cargando catálogo...
                        </p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} style={{ textAlign: "center", padding: 60, opacity: 0.4 }}>
                                            No se encontraron productos
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map((row, idx) => {
                                        const stock = row.original.stock ?? 0;
                                        const accentColor = getStockColor(theme, stock);
                                        return (
                                            <StaggeredRow key={row.id} $index={idx} $accent={accentColor}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </StaggeredRow>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>

                        {/* Pagination */}
                        <div style={{
                            padding: "12px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: `1px solid ${theme.bg3}1A`
                        }}>
                            <div style={{ display: "flex", gap: 6 }}>
                                <Button
                                    $variant="ghost"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    $variant="ghost"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                                >
                                    Siguiente
                                </Button>
                            </div>
                            <span style={{
                                fontSize: "0.78rem",
                                opacity: 0.4,
                                fontFamily: "'JetBrains Mono', monospace",
                                letterSpacing: "0.02em"
                            }}>
                                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} · {table.getFilteredRowModel().rows.length} productos
                            </span>
                        </div>
                    </>
                )}
            </TableCard>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingProduct={editingProduct}
                categories={categories}
                units={units}
                currencies={currencies}
                sucursales={sucursales}
                estatusList={estatusList}
                userIdSucursal={user?.id_sucursal}
                onSuccess={refresh}
            />
        </PageContainer>
    );
};

export default Productos;
