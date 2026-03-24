import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiImage, FiPackage, FiRefreshCw } from "react-icons/fi";
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
    PageHeader, HeaderTitle, Toolbar, SearchBox, Button
} from "../../../shared/components/UI";

const columnHelper = createColumnHelper<Product>();

/* --- Styled Components --- */
const ProductCell = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ProductImg = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    background: ${({ theme }) => theme.bgCard || "#eee"};
`;

const ProductImgPlaceholder = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${({ theme }) => theme.bg3}22;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.texttertiary};
    font-size: 1.2rem;
`;

const ProductName = styled.div`
    font-weight: 700;
    color: ${({ theme }) => theme.text};
`;

const ProductSku = styled.div`
    font-size: 0.75rem;
    opacity: 0.5;
    font-family: monospace;
`;

const PriceText = styled.div`
    color: #22C55E;
    font-weight: 700;
    text-align: right;
`;

const Productos: React.FC = () => {
    // 1. Data Fetching
    const {
        products, categories, units, currencies, estatusList,
        isLoading, isDeletingId, user, refresh, deleteProduct
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
                <ProductCell>
                    {info.row.original.imagen ? (
                        <ProductImg src={info.row.original.imagen} alt="" />
                    ) : (
                        <ProductImgPlaceholder><FiImage /></ProductImgPlaceholder>
                    )}
                    <div>
                        <ProductName>{info.getValue()}</ProductName>
                        <ProductSku>{info.row.original.id_producto || "ID: ---"}</ProductSku>
                    </div>
                </ProductCell>
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
                return (
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: val > 0 ? (isLow ? "#f59e0b" : "#10b981") : "#ef4444" }}>
                            {val}
                        </div>
                        <Badge $color={val > 0 ? (isLow ? "#f59e0b22" : "#10b98122") : "#ef444422"} style={{ fontSize: '0.65rem', padding: '2px 6px', marginTop: 4 }}>
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
    ], [isDeletingId]);

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
            <PageHeader>
                <HeaderTitle>
                    <h1>
                        <FiPackage color="#FCA311" /> Productos
                    </h1>
                    <p>Administra tu catálogo de artículos y su inventario</p>
                </HeaderTitle>
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

            <TableCard>
                {isLoading ? (
                    <div style={{ padding: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                        <ClimbingBoxLoader color="#FCA311" />
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
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>

                        {/* Pagination */}
                        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
                estatusList={estatusList}
                userIdSucursal={user?.id_sucursal}
                onSuccess={refresh}
            />
        </PageContainer>
    );
};

export default Productos;