import React, { useState, useMemo } from "react";
import { useTheme } from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage, FiRefreshCw, FiMapPin } from "react-icons/fi";
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
import { BoldHeader, StaggeredRow } from "./Productos.styles";

const columnHelper = createColumnHelper<Product>();

/**
 * Productos Page Component
 * Main view for managing the product catalog.
 * Features: Search, CRUD, Inventory levels, and Sucursal management.
 */
const Productos: React.FC = () => {
    const theme = useTheme();
    
    // 1. Data Fetching
    const {
        products, categories, units, currencies, sucursales, estatusList,
        statusMap, sucursalMap, isLoading, isDeletingId, user, refresh, deleteProduct
    } = useProducts();

    // 2. UI State
    const [globalFilter, setGlobalFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // 3. Handlers
    const handleEdit = (p: Product) => {
        setEditingProduct(p);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    // 4. TanStack Table Columns
    const columns = useMemo(() => [
        columnHelper.accessor("nombre", {
            header: "Producto",
            cell: info => (
                <ProductCell 
                    nombre={info.getValue()} 
                    sku={info.row.original.id_producto || "---"} 
                    imagen={info.row.original.imagen}
                />
            )
        }),
        columnHelper.accessor("precio_venta", {
            header: () => <div style={{ textAlign: "right" }}>Precio</div>,
            cell: info => (
                <PriceText>
                    ${(info.getValue() || 0).toFixed(2)}
                </PriceText>
            )
        }),
        columnHelper.accessor("moneda.nombre", {
            header: "Moneda",
            cell: info => <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>{info.getValue() || "---"}</span>
        }),
        columnHelper.accessor("stock", {
            header: () => <div style={{ textAlign: "right" }}>Stock Actual</div>,
            cell: info => {
                const val = info.getValue() ?? 0;
                const isLow = val <= 5;
                const color = val > 0 ? (isLow ? theme.warning : theme.success) : theme.danger;
                return (
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color }}>
                            {val}
                        </div>
                        <Badge $color={`${color}22`} style={{ fontSize: '0.65rem', padding: '2px 6px', marginTop: 4 }}>
                            {val > 0 ? (isLow ? "Bajo" : "Disponible") : "Agotado"}
                        </Badge>
                    </div>
                );
            }
        }),
        columnHelper.accessor("unidad.nombre", {
            header: "Unidad",
            cell: info => <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>{info.getValue() || "---"}</span>
        }),
        columnHelper.accessor("categoria.nombre", {
            header: "Categoría",
            cell: info => <Badge $color="#6366f122" style={{ color: '#6366f1' }}>{info.getValue() || "S/C"}</Badge>
        }),
        columnHelper.accessor("id_sucursal", {
            header: "Sucursal Origen",
            cell: info => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: "0.85rem", opacity: 0.8 }}>
                    <FiMapPin size={14} color={theme.primary} />
                    {sucursalMap[info.getValue()] || "Sede Central"}
                </div>
            )
        }),
        columnHelper.accessor("id_status", {
            header: "Estado",
            cell: info => {
                const name = statusMap[info.getValue()] || "ACTIVO";
                const isInactive = name.toUpperCase().includes("INACTIVO") || name.toUpperCase().includes("CANCELADO");
                return (
                    <Badge $color={isInactive ? `${theme.danger}22` : `${theme.success}22`} style={{ color: isInactive ? theme.danger : theme.success }}>
                        {name}
                    </Badge>
                );
            }
        }),
        columnHelper.display({
            id: "acciones",
            header: () => <div style={{ textAlign: "right" }}>Acciones</div>,
            cell: info => (
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <ActionBtn onClick={() => handleEdit(info.row.original)} title="Editar">
                        <FiEdit2 />
                    </ActionBtn>
                    <ActionBtn
                        $variant="delete"
                        onClick={() => deleteProduct(info.row.original.id_producto!)}
                        title="Eliminar"
                    >
                        {isDeletingId === info.row.original.id_producto ? (
                            <ClimbingBoxLoader size={8} color="#ef4444" />
                        ) : (
                            <FiTrash2 />
                        )}
                    </ActionBtn>
                </div>
            )
        })
    ], [isDeletingId, theme, statusMap, sucursalMap]);

    // 5. Table Instance
    const table = useReactTable({
        data: products,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 15 }
        }
    });

    return (
        <PageContainer>
            <PageHeader style={{ paddingBottom: '2rem' }}>
                <BoldHeader>
                    <h1>
                        <FiPackage color={theme.primary} /> Inventario Central
                    </h1>
                    <p>Administración Glassmorphic de SKUs y Existencias</p>
                </BoldHeader>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar producto..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                    </SearchBox>
                    <ActionBtn onClick={() => refresh()} title="Actualizar">
                        <FiRefreshCw />
                    </ActionBtn>
                    <Button onClick={handleCreate}>
                        <FiPlus /> Nuevo Producto
                    </Button>
                </Toolbar>
            </PageHeader>

            <TableCard style={{ 
                borderRadius: '16px', 
                boxShadow: `0 8px 32px ${theme.primary}15`, 
                border: `1px solid ${theme.primary}33`, 
                background: theme.bg + 'F0', 
                backdropFilter: 'blur(10px)' 
            }}>
                {isLoading ? (
                    <div style={{ padding: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                        <ClimbingBoxLoader color={theme.primary} />
                        <p style={{ opacity: 0.5 }}>Cargando catálogo...</p>
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
                                        <td colSpan={columns.length} style={{ textAlign: "center", padding: 60, opacity: 0.5 }}>
                                            No se encontraron productos
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map((row, idx) => (
                                        <StaggeredRow key={row.id} $index={idx}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </StaggeredRow>
                                    ))
                                )}
                            </tbody>
                        </Table>

                        {/* Pagination */}
                        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(150,150,150,0.15)' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button
                                    $variant="ghost"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    $variant="ghost"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                >
                                    Siguiente
                                </Button>
                            </div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
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
