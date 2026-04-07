import React, { useState, useMemo } from "react";
import { 
    FiSearch, FiRefreshCw, FiEdit, FiPackage, 
    FiAlertTriangle, FiTrendingUp, 
    FiX, FiActivity
} from "react-icons/fi";
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
    PageContainer, TableCard, Table, ActionBtn,
    PageHeader, HeaderTitle, Toolbar, SearchBox,
    Badge, Button
} from "../../../shared/components/UI";
import { ProductCell } from "../../../shared/components/UI/molecules/ProductCell";

// Hooks
import { 
    usePremiumInventory, 
    useInitializeInventory, 
    useUpdateInventory, 
    useCreateMovement, 
    useInventoryValuation,
    useInventoryRotation,
    type MergedInventoryItem 
} from "../hooks/usePremiumInventory";

// Modals
import {
    InitInventoryModal, UpdateInventoryModal, MovementModal,
    type InitPayload, type UpdatePayload, type MovementPayload,
} from "../components/InventoryModals";

// Styles
import {
    StatsGrid, StatCard, FilterRow, FilterChip, ValMethodBtn,
    StockContainer, ProgressBar, ProgressFill, LoaderContainer
} from "./InventarioPremium.styles";

const columnHelper = createColumnHelper<MergedInventoryItem>();

type ActionType = 'init' | 'update' | 'movement';

/**
 * InventarioPremium Component
 * Advanced inventory management with ABC rotation analysis and valuation methods.
 */
const InventarioPremium: React.FC = () => {
    // 1. Data Fetching
    const { data: items = [], isLoading, isFetching, refetch } = usePremiumInventory();
    const initMutation = useInitializeInventory();
    const updateMutation = useUpdateInventory();
    const moveMutation = useCreateMovement();

    // Analysis Queries
    const [valMethod, setValMethod] = useState<'peps' | 'ueps' | 'promedio'>('promedio');
    const { data: valuationData } = useInventoryValuation(valMethod);
    const { data: rotationData } = useInventoryRotation();

    // 2. UI State
    const [globalFilter, setGlobalFilter] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [actionState, setActionState] = useState<{ type: ActionType, item: MergedInventoryItem } | null>(null);

    // 3. Stats Calculation
    const stats = useMemo(() => {
        const totalProducts = items.length;
        const lowStock = items.filter(i => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length;
        const outOfStock = items.filter(i => i.stock_actual <= 0).length;
        const totalValue = valuationData?.data?.total_valor || items.reduce((acc, curr) => acc + (curr.stock_actual * curr.precio_compra), 0);

        return { totalProducts, lowStock, outOfStock, totalValue };
    }, [items, valuationData]);

    // Lookup table for rotation class
    const rotationMap = useMemo<Map<string, 'A' | 'B' | 'C'>>(() => {
        const map = new Map<string, 'A' | 'B' | 'C'>();
        const d = rotationData?.data;
        if (!d) return map;
        (d.A ?? []).forEach(id => map.set(id, 'A'));
        (d.B ?? []).forEach(id => map.set(id, 'B'));
        (d.C ?? []).forEach(id => map.set(id, 'C'));
        return map;
    }, [rotationData]);

    const getRotationClass = (id: string) => rotationMap.get(id) ?? null;

    // 4. Memoized Data for Filters
    const categories = useMemo(() => 
        ["all", ...new Set(items.map(i => i.categoria_nombre).filter(Boolean))], 
    [items]);

    const filteredData = useMemo(() => {
        let data = items;
        if (catFilter !== "all") {
            data = data.filter(item => item.categoria_nombre === catFilter);
        }
        return data;
    }, [items, catFilter]);

    // 5. TanStack Table Columns
    const columns = useMemo(() => [
        columnHelper.accessor("nombre", {
            header: "Producto",
            cell: info => {
                const rotation = getRotationClass(info.row.original.id_producto);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ProductCell 
                            nombre={info.getValue()} 
                            sku={info.row.original.id_producto} 
                            imagen={info.row.original.imagen}
                            placeholderIcon={FiPackage}
                        />
                        {rotation && (
                            <Badge 
                                $color={rotation === 'A' ? '#ef444422' : rotation === 'B' ? '#f59e0b22' : '#10b98122'} 
                                style={{ 
                                    color: rotation === 'A' ? '#ef4444' : rotation === 'B' ? '#f59e0b' : '#10b981', 
                                    fontSize: '0.65rem', 
                                    padding: '1px 5px',
                                    alignSelf: 'center',
                                    marginTop: -15
                                }}
                            >
                                Clase {rotation}
                            </Badge>
                        )}
                    </div>
                );
            }
        }),
        columnHelper.accessor("categoria_nombre", {
            header: "Categoría",
            cell: info => <Badge $color="#6366f122" style={{color: '#6366f1'}}>{info.getValue()}</Badge>
        }),
        columnHelper.accessor("stock_actual", {
            header: () => <div style={{textAlign: 'right'}}>Existencias</div>,
            cell: info => {
                const val = info.getValue() ?? 0;
                const min = info.row.original.stock_minimo;
                const isLow = val <= min && val > 0;
                const isOut = val <= 0;
                
                return (
                    <StockContainer>
                        <div className="label">
                            <span className={isOut ? "out" : isLow ? "low" : "ok"} style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                                {val}
                            </span>
                            <small style={{ fontSize: '0.75rem', opacity: 0.5, marginLeft: 4, fontWeight: 600 }}>
                                {info.row.original.unidad_nombre}
                            </small>
                        </div>
                        <ProgressBar>
                            <ProgressFill 
                                $percent={Math.min((val / (info.row.original.stock_maximo || 100)) * 100, 100)} 
                                $status={isOut ? "critical" : isLow ? "warning" : "success"}
                            />
                        </ProgressBar>
                    </StockContainer>
                );
            }
        }),
        columnHelper.accessor("precio_venta", {
            header: () => <div style={{textAlign: 'right'}}>Precio Venta</div>,
            cell: info => (
                <div style={{ textAlign: "right", fontWeight: 700 }}>
                    ${(info.getValue() || 0).toFixed(2)}
                </div>
            )
        }),
        columnHelper.display({
            id: "actions",
            header: () => <div style={{ textAlign: 'right' }}>Acciones</div>,
            cell: info => {
                const item = info.row.original;
                return (
                    <div style={{ textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {!item.id_inventario ? (
                            <Button style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={() => setActionState({ type: 'init', item })}>
                                Inicializar
                            </Button>
                        ) : (
                            <>
                                <ActionBtn onClick={() => setActionState({ type: 'movement', item })} title="Registrar Movimiento">
                                    <FiActivity />
                                </ActionBtn>
                                <ActionBtn onClick={() => setActionState({ type: 'update', item })} title="Editar Límites / Precios">
                                    <FiEdit />
                                </ActionBtn>
                            </>
                        )}
                    </div>
                );
            }
        })
    ], [rotationMap]);


    const table = useReactTable({
        data: filteredData,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleInit     = async (payload: InitPayload)     => { await initMutation.mutateAsync(payload);   setActionState(null); };
    const handleUpdate   = async (payload: UpdatePayload)   => { await updateMutation.mutateAsync(payload); setActionState(null); };
    const handleMovement = async (payload: MovementPayload) => { await moveMutation.mutateAsync(payload);   setActionState(null); };

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiPackage color="#FCA311" /> Control de Inventario</h1>
                    <p>Visión global de existencias y niveles críticos</p>
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
                    <ActionBtn onClick={() => refetch()} title="Sincronizar">
                        <FiRefreshCw className={isFetching ? "spin" : ""} />
                    </ActionBtn>
                </Toolbar>
            </PageHeader>

            <StatsGrid>
                <StatCard $color="#3b82f6">
                    <div className="icon"><FiPackage /></div>
                    <div className="content">
                        <h3>{stats.totalProducts}</h3>
                        <p>Productos Totales</p>
                    </div>
                </StatCard>
                <StatCard $color="#f59e0b">
                    <div className="icon"><FiAlertTriangle /></div>
                    <div className="content">
                        <h3>{stats.lowStock}</h3>
                        <p>Stock Bajo</p>
                    </div>
                </StatCard>
                <StatCard $color="#ef4444">
                    <div className="icon"><FiX /></div>
                    <div className="content">
                        <h3>{stats.outOfStock}</h3>
                        <p>Agotados</p>
                    </div>
                </StatCard>
                <StatCard $color="#10b981">
                    <div className="icon"><FiTrendingUp /></div>
                    <div className="content">
                        <h3>${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                            {(['promedio', 'peps', 'ueps'] as const).map(m => (
                                <ValMethodBtn 
                                    key={m} 
                                    $active={valMethod === m}
                                    onClick={() => setValMethod(m)}
                                >
                                    {m.toUpperCase()}
                                </ValMethodBtn>
                            ))}
                        </div>
                    </div>
                </StatCard>
            </StatsGrid>

            {/* Quick Filter */}
            <FilterRow>
                <div style={{ display: 'flex', gap: 10 }}>
                    {categories.map(c => (
                        <FilterChip 
                            key={c} 
                            $active={catFilter === c} 
                            onClick={() => setCatFilter(c)}
                        >
                            {c === 'all' ? 'Todos' : c}
                        </FilterChip>
                    ))}
                </div>
                <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>
                    Mostrando {table.getRowModel().rows.length} de {items.length} productos
                </div>
            </FilterRow>

            <TableCard>
                {isLoading ? (
                    <LoaderContainer>
                        <ClimbingBoxLoader color="#FCA311" />
                        <p>Procesando inventario...</p>
                    </LoaderContainer>
                ) : (
                    <Table>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </TableCard>

            {actionState?.type === 'init' && (
                <InitInventoryModal 
                    item={actionState.item}
                    onClose={() => setActionState(null)}
                    onSave={handleInit}
                    saving={initMutation.isPending}
                />
            )}
            {actionState?.type === 'update' && (
                <UpdateInventoryModal
                    item={actionState.item}
                    onClose={() => setActionState(null)}
                    onSave={handleUpdate}
                    saving={updateMutation.isPending}
                />
            )}
            {actionState?.type === 'movement' && (
                <MovementModal
                    item={actionState.item}
                    onClose={() => setActionState(null)}
                    onSave={handleMovement}
                    saving={moveMutation.isPending}
                />
            )}
        </PageContainer>
    );
};

export default InventarioPremium;
