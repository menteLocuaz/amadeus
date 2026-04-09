import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { useTheme, keyframes } from "styled-components";
import Swal from "sweetalert2";
import { ROUTES } from "../../../core/constants/routes";
import { FiPlus, FiShoppingBag, FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiRefreshCw, FiDollarSign } from "react-icons/fi";
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
    PageContainer, Table, ActionBtn, Badge,
    Toolbar, Button
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

/* ------------------------------ Styled UI ------------------------------- */

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 48px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
  padding-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
`;

const TitleArea = styled.div`
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: ${({ theme }) => theme.text};
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: 'Space Grotesk', sans-serif;

    svg {
      color: ${({ theme }) => theme.primary};
      font-size: 2rem;
    }
  }
  p {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.texttertiary};
    max-width: 600px;
    line-height: 1.6;
    font-weight: 500;
  }
`;

const ActionArea = styled.div`
  display: flex;
  gap: 16px;
`;

const StatsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
`;

const StatItem = styled.div`
  padding: 24px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}11;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.04);
  }

  .label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${({ theme }) => theme.texttertiary};
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg { color: ${({ theme }) => theme.primary}; }
  }

  .value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    color: ${({ theme }) => theme.text};
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 440px;

  svg {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.primary};
    font-size: 1.2rem;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 14px 16px 14px 52px;
    background: ${({ theme }) => theme.bg2}22;
    border: 1px solid ${({ theme }) => theme.bg3}15;
    border-radius: 12px;
    color: ${({ theme }) => theme.text};
    font-size: 1rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
      background: ${({ theme }) => theme.bg};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}11;
    }

    &::placeholder {
      color: ${({ theme }) => theme.texttertiary}88;
    }
  }
`;

const LedgerCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}11;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
`;

const LoadingState = styled.div`
  padding: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  color: ${({ theme }) => theme.primary};

  p {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StaggeredRow = styled.tr<{ $index?: number }>`
  animation: ${fadeInUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${({ $index }) => ($index || 0) * 0.03}s;
  opacity: 0;
  
  &:hover td {
    background: ${({ theme }) => theme.bg2}15;
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
        return { color: theme.texttertiary, icon: <FiPackage /> };
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

    // 5. Stats Calculation
    const stats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter(o => {
            const l = getStatusLabel(o).toLowerCase();
            return l.includes("solic") || l.includes("pend");
        }).length;
        const totalValue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);

        return [
            { label: "Órdenes Totales", value: total, icon: FiShoppingBag },
            { label: "Pendientes", value: pending, icon: FiClock },
            { label: "Valor de Cartera", value: `$${totalValue.toLocaleString()}`, icon: FiDollarSign },
        ];
    }, [orders, statuses]);

    // 6. TanStack Table
    const columns = useMemo(() => [
        columnHelper.accessor("numero_orden", {
            header: "N\u00ba de Orden",
            cell: info => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'JetBrains Mono', fontWeight: 600, color: theme.primary, background: `${theme.primary}10`, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em', width: 'fit-content', fontSize: '0.75rem' }}>
                    <FiShoppingBag opacity={0.8} />
                    <strong>{info.getValue()}</strong>
                </div>
            )
        }),
        columnHelper.accessor("id_proveedor", {
            header: "Proveedor",
            cell: info => <div style={{ fontWeight: 600 }}>{getProviderName(info.row.original)}</div>
        }),
        columnHelper.accessor("id_sucursal", {
            header: "Sucursal",
            cell: info => <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>{getSucursalName(info.row.original)}</div>
        }),
        columnHelper.accessor("fecha_creacion", {
            header: "Fecha",
            cell: info => <div style={{ opacity: 0.7, fontSize: '0.85rem' }}>{info.getValue() ? new Date(info.getValue()).toLocaleDateString() : "N/A"}</div>
        }),
        columnHelper.accessor("total", {
            header: "Total",
            cell: info => (
                <div style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'JetBrains Mono', color: theme.text }}>
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
                    <Badge $color={color} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.7rem' }}>
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
                                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
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
    ], [statuses, theme]);

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
            <Header>
                <TitleArea>
                    <h1><FiShoppingBag /> Logística & Compras</h1>
                    <p>Ledger operacional de órdenes entrantes, recepciones y gestión de proveedores.</p>
                </TitleArea>
                <ActionArea>
                    <Button onClick={() => setOpenCreate(true)}>
                        <FiPlus size={20} />
                        Nueva Orden
                    </Button>
                </ActionArea>
            </Header>

            <StatsStrip>
                {stats.map(stat => (
                    <StatItem key={stat.label}>
                        <div className="label">
                            <stat.icon size={14} />
                            {stat.label}
                        </div>
                        <div className="value">{stat.value}</div>
                    </StatItem>
                ))}
            </StatsStrip>

            <Toolbar style={{ marginBottom: '24px' }}>
                <SearchBox>
                    <FiSearch />
                    <input
                        placeholder="Buscar por número de orden, proveedor..."
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </SearchBox>
                <div style={{ flex: 1 }} />
                <ActionBtn onClick={() => refetch()} title="Actualizar">
                    <FiRefreshCw className={isFetching ? "spin" : ""} />
                </ActionBtn>
            </Toolbar>

            <LedgerCard>
                {isLoading ? (
                    <LoadingState>
                        <ClimbingBoxLoader color={theme.primary} size={20} />
                        <p>Sincronizando Órdenes...</p>
                    </LoadingState>
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
                                        <td colSpan={columns.length} style={{ textAlign: "center", padding: 80, opacity: 0.5 }}>
                                            No se encontraron órdenes de compra registradas.
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
                        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.bg3}11`, background: `${theme.bg2}08` }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <Button
                                    $variant="secondary"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    $variant="secondary"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                                >
                                    Siguiente
                                </Button>
                            </div>
                            <span style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
                                PÁGINA {table.getState().pagination.pageIndex + 1} DE {table.getPageCount()}
                            </span>
                        </div>
                    </>
                )}
            </LedgerCard>

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