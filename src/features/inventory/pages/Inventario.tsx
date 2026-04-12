import React, { useState, useMemo } from "react";
import { 
    FiSearch, FiRefreshCw, FiEdit,
    FiX, FiSave, FiPackage, FiFilter
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
    ModalHeader, Button, Grid, StockIndicator
} from "../../../shared/components/UI";

// Hooks & Services
import { useInventoryItems, useRegisterMovement } from "../hooks/useInventoryQuery";
import { type InventoryItem } from "../services/InventoryService";

const columnHelper = createColumnHelper<any>();

const Inventario: React.FC = () => {
    // 1. Data Fetching with React Query
    const { data: items = [], isLoading, refetch, isFetching } = useInventoryItems();
    const { mutateAsync: adjustStock, isPending: isSaving } = useRegisterMovement();

    // 2. Local State for Filters & UI
    const [globalFilter, setGlobalFilter] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

    // 3. Memoized Data for Filters
    const categories = useMemo(() => 
        ["all", ...new Set(items.map(i => (i as any).producto?.categoria?.nombre).filter(Boolean))], 
    [items]);

    const filteredData = useMemo(() => {
        if (catFilter === "all") return items;
        return items.filter(item => (item as any).producto?.categoria?.nombre === catFilter);
    }, [items, catFilter]);

    // 4. TanStack Table Configuration
    const columns = useMemo(() => [
        columnHelper.accessor("producto.nombre", {
            header: "Producto",
            cell: info => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {info.row.original.producto?.imagen ? (
                        <img src={info.row.original.producto.imagen} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiPackage opacity={0.3} />
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: 700 }}>{info.getValue() || "Sin nombre"}</div>
                        <code style={{ fontSize: '0.75rem', opacity: 0.5 }}>{info.row.original.id_producto}</code>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor("producto.categoria.nombre", {
            header: "Categoría",
            cell: info => info.getValue() || "General"
        }),
        columnHelper.accessor("stock_actual", {
            header: () => <div style={{ textAlign: 'right' }}>Estado Stock</div>,
            cell: info => (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <StockIndicator 
                        actual={info.getValue()} 
                        min={info.row.original.stock_minimo} 
                        max={info.row.original.stock_minimo * 3 || 100}
                        unit={info.row.original.producto?.unidad?.nombre}
                    />
                </div>
            )
        }),
        columnHelper.accessor("precio_venta", {
            header: () => <div style={{ textAlign: 'right' }}>Precio Venta</div>,
            cell: info => (
                <div style={{ textAlign: "right", fontWeight: 800, color: '#22C55E' }}>
                    ${info.getValue()}
                </div>
            )
        }),
        columnHelper.display({
            id: "actions",
            header: () => <div style={{ textAlign: 'right' }}>Acciones</div>,
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
        initialState: {
            pagination: { pageSize: 10 }
        }
    });

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiPackage color="#FCA311" /> Gestión de Inventario</h1>
                    <p>Control de existencias físicas, niveles críticos y ajustes de stock.</p>
                </HeaderTitle>

                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar producto o ID..."
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                        />
                    </SearchBox>
                    <ActionBtn onClick={() => refetch()} title="Actualizar">
                        <FiRefreshCw className={isFetching ? "spin" : ""} />
                    </ActionBtn>
                </Toolbar>
            </PageHeader>

            {/* Filters Row */}
            <div style={{ marginBottom: 20, display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormGroup style={{ marginBottom: 0, width: 250 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, fontSize: '0.8rem', opacity: 0.6 }}>
                        <FiFilter size={12}/> <span>CATEGORÍA</span>
                    </div>
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                        {categories.map(c => (
                            <option key={c} value={c}>
                                {c === "all" ? "Todas las categorías" : c}
                            </option>
                        ))}
                    </select>
                </FormGroup>
                
                <div style={{ flex: 1 }} />
                
                <span style={{ opacity: 0.5, fontSize: '0.9rem', fontWeight: 600 }}>
                    {table.getFilteredRowModel().rows.length} registros encontrados
                </span>
            </div>

            <TableCard>
                {isLoading ? (
                    <div style={{ padding: 100, display: "flex", flexDirection: 'column', alignItems: "center", gap: 20 }}>
                        <ClimbingBoxLoader color="#FCA311" />
                        <p style={{ opacity: 0.5 }}>Cargando datos de inventario...</p>
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
                                            No se encontraron registros de inventario
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
                                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </span>
                        </div>
                    </>
                )}
            </TableCard>

            {/* Adjust Modal */}
            {adjustItem && (
                <AdjustModal 
                    item={adjustItem}
                    saving={isSaving}
                    onClose={() => setAdjustItem(null)}
                    onSave={adjustStock}
                />
            )}
        </PageContainer>
    );
};

/* ── Modal Component ── */
const AdjustModal = ({ item, saving, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo,
        motivo: ""
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'motivo' ? value : Number(value) }));
    };

    const handleConfirm = async () => {
        try {
            const { motivo, ...payload } = formData;
            await onSave({ id: item.id, payload, motivo, original: item });
            onClose();
        } catch (err) {
            // Error handling is inside the mutation hook with Swal
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2>Ajustar Stock</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                <p style={{ marginBottom: 20 }}>
                    Ajustando existencias para: <strong>{item.producto?.nombre}</strong>
                </p>

                <Grid style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <FormGroup>
                        <label>Stock Actual</label>
                        <input name="stock_actual" type="number" value={formData.stock_actual} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Mínimo</label>
                        <input name="stock_minimo" type="number" value={formData.stock_minimo} onChange={handleChange} />
                    </FormGroup>
                </Grid>

                <FormGroup>
                    <label>Motivo del Ajuste (Opcional)</label>
                    <textarea name="motivo" value={formData.motivo} onChange={handleChange} placeholder="Ej: Conteo físico, merma, etc." />
                </FormGroup>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                    <Button $variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiSave /> Guardar Ajuste</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

export default Inventario;