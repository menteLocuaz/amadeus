import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { 
    FiSearch, FiRefreshCw, FiEdit, FiPackage, 
    FiAlertTriangle, FiTrendingUp, 
    FiX, FiSave
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
    FormGroup, ModalOverlay, ModalContent,
    PageHeader, HeaderTitle, Toolbar, SearchBox,
    ModalHeader, Badge
} from "../../../shared/components/UI";
import { Button } from "../../../shared/components/UI/atoms";

// Hooks
import { usePremiumInventory, type MergedInventoryItem } from "../hooks/usePremiumInventory";

const columnHelper = createColumnHelper<MergedInventoryItem>();

const InventarioPremium: React.FC = () => {
    // 1. Data Fetching
    const { data: items = [], isLoading, isFetching, refetch, adjustStock } = usePremiumInventory();

    // 2. UI State
    const [globalFilter, setGlobalFilter] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [adjustItem, setAdjustItem] = useState<MergedInventoryItem | null>(null);

    // 3. Stats Calculation
    const stats = useMemo(() => {
        const totalProducts = items.length;
        const lowStock = items.filter(i => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length;
        const outOfStock = items.filter(i => i.stock_actual <= 0).length;
        const totalValue = items.reduce((acc, curr) => acc + (curr.stock_actual * curr.precio_compra), 0);

        return { totalProducts, lowStock, outOfStock, totalValue };
    }, [items]);

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

    // 5. TanStack Table
    const columns = useMemo(() => [
        columnHelper.accessor("nombre", {
            header: "Producto",
            cell: info => (
                <ProductCell>
                    {info.row.original.imagen ? (
                        <ProductImg src={info.row.original.imagen} alt="" />
                    ) : (
                        <ProductImgPlaceholder><FiPackage /></ProductImgPlaceholder>
                    )}
                    <div>
                        <ProductName>{info.getValue()}</ProductName>
                        <ProductSku>{info.row.original.id_producto}</ProductSku>
                    </div>
                </ProductCell>
            )
        }),
        columnHelper.accessor("categoria_nombre", {
            header: "Categoría",
            cell: info => <Badge $color="#6366f122" style={{color: '#6366f1'}}>{info.getValue()}</Badge>
        }),
        columnHelper.accessor("stock_actual", {
            header: () => <div style={{textAlign: 'right'}}>Existencias</div>,
            cell: info => {
                const val = info.getValue();
                const min = info.row.original.stock_minimo;
                const isLow = val <= min && val > 0;
                const isOut = val <= 0;
                
                return (
                    <StockContainer>
                        <div className="label">
                            <span className={isOut ? "out" : isLow ? "low" : "ok"}>
                                {val} {info.row.original.unidad_nombre}
                            </span>
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
            header: () => <div style={{ textAlign: 'right' }}>Ajustar</div>,
            cell: info => (
                <div style={{ textAlign: "right" }}>
                    <ActionBtn onClick={() => setAdjustItem(info.row.original)} title="Ajustar Stock">
                        <FiEdit />
                    </ActionBtn>
                </div>
            )
        })
    ], []);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleAdjust = async (id_producto: string, payload: any, motivo: string) => {
        await adjustStock.mutateAsync({ id_producto, payload, motivo });
        setAdjustItem(null);
    };

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
                        <p>Valorización</p>
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

            {adjustItem && (
                <AdjustModal 
                    item={adjustItem} 
                    onClose={() => setAdjustItem(null)} 
                    onSave={handleAdjust}
                    saving={adjustStock.isPending}
                />
            )}
        </PageContainer>
    );
};

/* --- Styled Components --- */

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const StatCard = styled.div<{ $color: string }>`
    background: ${({ theme }) => theme.bgCard || "#1a1a1a"};
    border: 1px solid rgba(255,255,255,0.05);
    padding: 24px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 15px;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 4px; height: 100%;
        background: ${props => props.$color};
    }

    .icon {
        width: 48px; height: 48px;
        border-radius: 12px;
        background: ${props => props.$color}11;
        color: ${props => props.$color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }

    h3 { font-size: 1.8rem; margin: 0; }
    p { margin: 0; opacity: 0.6; font-size: 0.9rem; font-weight: 500; }
`;

const FilterRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const FilterChip = styled.button<{ $active: boolean }>`
    padding: 8px 16px;
    border-radius: 30px;
    border: 1px solid ${props => props.$active ? props.theme.primary : 'rgba(255,255,255,0.1)'};
    background: ${props => props.$active ? props.theme.primary + '22' : 'transparent'};
    color: ${props => props.$active ? props.theme.primary : 'inherit'};
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: 0.2s;

    &:hover {
        background: rgba(255,255,255,0.05);
    }
`;

const ProductCell = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ProductImg = styled.img`
    width: 45px; height: 45px;
    border-radius: 8px;
    object-fit: cover;
    background: #222;
`;

const ProductImgPlaceholder = styled.div`
    width: 45px; height: 45px;
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.3;
`;

const ProductName = styled.div`
    font-weight: 700;
`;

const ProductSku = styled.div`
    font-size: 0.75rem;
    opacity: 0.4;
    font-family: monospace;
`;

const StockContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
    width: 150px;
    margin-left: auto;

    .label {
        font-weight: 800;
        font-size: 0.95rem;
        
        .ok { color: #10b981; }
        .low { color: #f59e0b; }
        .out { color: #ef4444; }
    }
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number, $status: 'success' | 'warning' | 'critical' }>`
    width: ${props => props.$percent}%;
    height: 100%;
    background: ${props => 
        props.$status === 'critical' ? '#ef4444' : 
        props.$status === 'warning' ? '#f59e0b' : '#10b981'};
    transition: width 1s ease;
`;

const LoaderContainer = styled.div`
    padding: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    opacity: 0.8;
`;

/* --- Adjustment Modal --- */
const AdjustModal = ({ item, onClose, onSave, saving }: any) => {
    const [val, setVal] = useState(item.stock_actual);
    const [motivo, setMotivo] = useState("");

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{maxWidth: 400}} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><FiEdit /> Ajustar Existencias</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                <div style={{marginBottom: 25}}>
                    <strong style={{fontSize: '1.1rem'}}>{item.nombre}</strong>
                    <div style={{opacity: 0.5, fontSize: '0.8rem'}}>Actual: {item.stock_actual} {item.unidad_nombre}</div>
                </div>

                <FormGroup>
                    <label>Nuevo Stock Físico</label>
                    <input 
                        type="number" 
                        value={val} 
                        onChange={e => setVal(Number(e.target.value))}
                        autoFocus
                    />
                </FormGroup>

                <FormGroup>
                    <label>Motivo del Ajuste</label>
                    <textarea 
                        value={motivo} 
                        onChange={e => setMotivo(e.target.value)}
                        placeholder="Ej: Conteo cíclico, pérdida, etc."
                    />
                </FormGroup>

                <div style={{display: "flex", gap: 10, marginTop: 10}}>
                    <Button $variant="ghost" onClick={onClose} style={{flex: 1}}>Cancelar</Button>
                    <Button 
                        onClick={() => onSave(item.id_producto, { stock_actual: val }, motivo)}
                        style={{flex: 2}}
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : <><FiSave /> Guardar Ajuste</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

export default InventarioPremium;
