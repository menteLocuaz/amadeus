import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import Swal from "sweetalert2";
import { ROUTES } from "../../../core/constants/routes";
import { FiPlus, FiShoppingBag, FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiRefreshCw } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

// UI Components
import {
    PageContainer, TableCard, Table, ActionBtn, Badge,
    PageHeader, HeaderTitle, Toolbar, SearchBox, Button
} from "../../../shared/components/UI";


// Hooks & Services
import {
    useOrdersData,
    useCreateOrder,
    useReceiveOrder
} from "../hooks/useComprasQuery";
import {
    useStatuses,
    useSucursales,
    useMonedas,
    useProducts
} from "../../proveedor/hooks/useCommonQueries";
import { useProveedoresData } from "../../proveedor/hooks/useProveedoresQuery";
import { CompraModal } from "../components/CompraModal";
import { RecepcionModal } from "../components/RecepcionModal";
import { type Compra } from "../services/PurchaseService";

const columnHelper = createColumnHelper<Compra>();

import styled, { keyframes } from "styled-components";

// --- Frontend Design Animations & Components ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StaggeredRow = styled.tr<{ $index?: number }>`
  animation: ${fadeInUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${({ $index }) => ($index || 0) * 0.05}s;
  opacity: 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary}08 !important;
    transform: scale(1.002) translateX(4px);
    box-shadow: -4px 0 0 ${({ theme }) => theme.primary};
  }
`;

const BoldHeader = styled(HeaderTitle)`
  h1 {
    font-family: 'Outfit', 'Space Grotesk', system-ui, sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.05em;
    background: linear-gradient(135deg, ${({ theme }) => theme.text}, ${({ theme }) => theme.primary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    font-weight: 500;
    opacity: 0.7;
    margin-top: 8px;
    font-size: 1.05rem;
  }
`;

const Compras: React.FC = () => {
    const theme = useTheme();
    // 1. Data Fetching
    const { data: orders = [], isLoading, isFetching, refetch } = useOrdersData();
    const { data: suppliers = [] } = useProveedoresData();
    const { data: products = [] } = useProducts();
    const { data: sucursales = [] } = useSucursales();
    const { data: monedas = [] } = useMonedas();
    const { data: statuses = [] } = useStatuses(6); // Modulo Compras (ID 6)
    const navigate = useNavigate();

    // 2. Mutations
    const createMutation = useCreateOrder();
    const receiveMutation = useReceiveOrder();

    // 3. UI State
    const [globalFilter, setGlobalFilter] = useState("");
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Compra | null>(null);

    // 4. Helpers
    const getStatusLabel = (order: Compra) => {
        // Priorizamos std_descripcion sobre nombre, ya que suele contener la descripción completa
        const nestedStatus = (order.status as any)?.std_descripcion || order.status?.nombre;
        if (nestedStatus) return nestedStatus;

        const found = statuses.find((s: any) => String(s.id_status) === String(order.id_status));
        return found?.std_descripcion || found?.nombre || String(order.id_status || "N/A");
    };

    const getProviderName = (order: Compra) => {
        if (order.proveedor?.nombre) return order.proveedor.nombre;
        const found = suppliers.find((s: any) => (s.id || s.id_proveedor) === order.id_proveedor);
        return found?.nombre || (found as any)?.nombre_proveedor || "Desconocido";
    };

    const getSucursalName = (order: Compra) => {
        if (order.sucursal?.nombre) return order.sucursal.nombre;
        const found = sucursales.find((s: any) => (s.id || s.id_sucursal) === order.id_sucursal);
        return found?.nombre || (found as any)?.nombre_sucursal || "Central";
    };

    const getStatusInfo = (order: Compra, theme: any) => {
        const label = getStatusLabel(order).toLowerCase();
        if (label.includes("recib")) return { color: theme.success, icon: <FiCheckCircle /> };
        if (label.includes("solic") || label.includes("pend")) return { color: theme.warning, icon: <FiClock /> };
        if (label.includes("canc")) return { color: theme.danger, icon: <FiXCircle /> };
        return { color: theme.gray500, icon: <FiPackage /> };
    };

    const handleCreateOrder = (data: any) => {
        createMutation.mutate(data, {
            onSuccess: () => setOpenCreate(false)
        });
    };

    const handleConfirmReception = (payload: any) => {
        receiveMutation.mutate(payload, {
            onSuccess: () => {
                setSelectedOrder(null);
                Swal.fire({
                    icon: 'success',
                    title: 'Inventario actualizado correctamente',
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => {
                    navigate(ROUTES.INVENTARIO);
                });
            }
        });
    };

    // 5. TanStack Table
    const columns = useMemo(() => [
        columnHelper.accessor("numero_orden", {
            header: "N\u00ba de Orden",
            cell: info => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'JetBrains Mono', fontWeight: 600, color: theme.primary, background: `${theme.primary}15`, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em', width: 'fit-content' }}>
                    <FiShoppingBag opacity={0.8} />
                    <strong>{info.getValue()}</strong>
                </div>
            )
        }),
        columnHelper.accessor("id_proveedor", {
            header: "Proveedor",
            cell: info => getProviderName(info.row.original)
        }),
        columnHelper.accessor("id_sucursal", {
            header: "Sucursal",
            cell: info => getSucursalName(info.row.original)
        }),
        columnHelper.accessor("fecha_creacion", {
            header: "Fecha",
            cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "N/A"
        }),
        columnHelper.accessor("total", {
            header: "Total",
            cell: info => (
                <div style={{ fontWeight: 800, fontSize: '1.1rem', fontFamily: 'JetBrains Mono', color: theme.text }}>
                    ${(info.getValue() || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            )
        }),
        columnHelper.accessor(row => getStatusLabel(row), {
            id: "estado",
            header: "Estado",
            cell: info => {
                const { color, icon } = getStatusInfo(info.row.original, theme);
                return (
                    <Badge $color={color} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {icon} {info.getValue()}
                    </Badge>
                );
            }
        }),
        columnHelper.display({
            id: "acciones",
            header: () => <div style={{ textAlign: "right" }}>Acciones</div>,
            cell: info => {
                const isReceived = (info.row.original.status?.nombre || "").toLowerCase().includes("recib");
                return (
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        {!isReceived && (
                            <Button
                                $variant="primary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                onClick={() => setSelectedOrder(info.row.original)}
                            >
                                <FiTruck /> Recibir
                            </Button>
                        )}
                        <ActionBtn title="Detalles" onClick={() => { }} style={{boxShadow: `0 4px 12px ${theme.primary}33`}}>
                            <FiPackage />
                        </ActionBtn>
                    </div>
                );
            }
        })
    ], [statuses]);

    const table = useReactTable({
        data: orders,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10 }
        }
    });

    return (
        <PageContainer>
            <PageHeader style={{ paddingBottom: '2rem' }}>
                <BoldHeader>
                    <h1><FiShoppingBag color={theme.primary} /> Logística & Compras</h1>
                    <p>Ledger operacional de órdenes entrantes y recepciones</p>
                </BoldHeader>

                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar por Numero de orden..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                    </SearchBox>
                    <ActionBtn onClick={() => refetch()} title="Actualizar">
                        <FiRefreshCw className={isFetching ? "spin" : ""} />
                    </ActionBtn>
                    <Button onClick={() => setOpenCreate(true)}>
                        <FiPlus /> Nueva Orden
                    </Button>
                </Toolbar>
            </PageHeader>

            <TableCard style={{ borderRadius: '16px', boxShadow: '0 8px 32px rgba(252, 163, 17, 0.08)', border: '1px solid rgba(252, 163, 17, 0.2)', background: theme.bg + 'F0', backdropFilter: 'blur(10px)' }}>
                {isLoading ? (
                    <div style={{ padding: 100, display: "flex", flexDirection: 'column', alignItems: "center", gap: 20 }}>
                        <ClimbingBoxLoader color={theme.primary} />
                        <p style={{ opacity: 0.5 }}>Cargando ordenes...</p>
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
                                            No se encontraron ordenes de compra
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
                                Pagina {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </span>
                        </div>
                    </>
                )}
            </TableCard>

            {/* Modals */}
            <CompraModal
                open={openCreate}
                suppliers={suppliers}
                products={products}
                sucursales={sucursales}
                monedas={monedas}
                statuses={statuses}
                saving={createMutation.isPending}
                onClose={() => setOpenCreate(false)}
                onSave={handleCreateOrder}
            />

            <RecepcionModal
                open={!!selectedOrder}
                order={selectedOrder}
                products={products}
                statuses={statuses}
                receiving={receiveMutation.isPending}
                onClose={() => setSelectedOrder(null)}
                onConfirm={handleConfirmReception}
            />
        </PageContainer>
    );
};

export default Compras;