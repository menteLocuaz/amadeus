import React, { useState, useMemo } from "react";
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

const Compras: React.FC = () => {
    // 1. Data Fetching
    const { data: orders = [], isLoading, isFetching, refetch } = useOrdersData();
    const { data: suppliers = [] } = useProveedoresData();
    const { data: products = [] } = useProducts();
    const { data: sucursales = [] } = useSucursales();
    const { data: monedas = [] } = useMonedas();
    const { data: statuses = [] } = useStatuses(7); // Modulo Compras

    // 2. Mutations
    const createMutation = useCreateOrder();
    const receiveMutation = useReceiveOrder();

    // 3. UI State
    const [globalFilter, setGlobalFilter] = useState("");
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Compra | null>(null);

    // 4. Helpers
    const getStatusLabel = (order: Compra) => {
        if (order.status?.nombre) return order.status.nombre;
        const found = statuses.find((s: any) => String(s.id_status) === String(order.id_status));
        return found?.nombre || found?.std_descripcion || String(order.id_status || "N/A");
    };

    const getProviderName = (order: Compra) => {
        if (order.proveedor?.nombre) return order.proveedor.nombre;
        const found = suppliers.find((s: any) => (s.id || s.id_proveedor) === order.id_proveedor);
        return found?.nombre || (found as any)?.nombre_proveedor || "Desconocido";
    };

    const getStatusInfo = (order: Compra) => {
        const label = getStatusLabel(order).toLowerCase();
        if (label.includes("recib")) return { color: "#22C55E", icon: <FiCheckCircle /> };
        if (label.includes("solic") || label.includes("pend")) return { color: "#FCA311", icon: <FiClock /> };
        if (label.includes("canc")) return { color: "#EF4444", icon: <FiXCircle /> };
        return { color: "#64748B", icon: <FiPackage /> };
    };

    const handleCreateOrder = async (data: any) => {
        await createMutation.mutateAsync(data);
        setOpenCreate(false);
    };

    const handleConfirmReception = async (payload: any) => {
        const orderId = (selectedOrder as any)?.id_orden_compra || selectedOrder?.id;
        if (!orderId) return;

        await receiveMutation.mutateAsync({
            ...payload,
            id_orden_compra: orderId
        });
        setSelectedOrder(null);
    };

    // 5. TanStack Table
    const columns = useMemo(() => [
        columnHelper.accessor("numero_orden", {
            header: "N\u00ba de Orden",
            cell: info => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiShoppingBag opacity={0.5} />
                    <strong>{info.getValue()}</strong>
                </div>
            )
        }),
        columnHelper.accessor("id_proveedor", {
            header: "Proveedor",
            cell: info => getProviderName(info.row.original)
        }),
        columnHelper.accessor("fecha_creacion", {
            header: "Fecha",
            cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "N/A"
        }),
        columnHelper.accessor("total", {
            header: "Total",
            cell: info => (
                <div style={{ fontWeight: 800 }}>
                    ${(info.getValue() || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            )
        }),
        columnHelper.display({
            id: "estado",
            header: "Estado",
            cell: info => {
                const { color, icon } = getStatusInfo(info.row.original);
                const label = getStatusLabel(info.row.original);
                return (
                    <Badge $color={color}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            {icon} {label}
                        </div>
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
                        <ActionBtn title="Detalles" onClick={() => { }}>
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
            <PageHeader>
                <HeaderTitle>
                    <h1><FiShoppingBag color="#FCA311" /> Gestionn de Compras</h1>
                    <p>Administra ordenes de compra y recepcion de mercancia</p>
                </HeaderTitle>

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

            <TableCard>
                {isLoading ? (
                    <div style={{ padding: 100, display: "flex", flexDirection: 'column', alignItems: "center", gap: 20 }}>
                        <ClimbingBoxLoader color="#FCA311" />
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
                        <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
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
                statuses={statuses}
                receiving={receiveMutation.isPending}
                onClose={() => setSelectedOrder(null)}
                onConfirm={handleConfirmReception}
            />
        </PageContainer>
    );
};

export default Compras;