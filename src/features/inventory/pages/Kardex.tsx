import React, { useState, useMemo } from 'react';
import { FiBox, FiSearch, FiArrowDownLeft, FiArrowUpRight, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { ClimbingBoxLoader } from 'react-spinners';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

// Hooks & Services
import { useKardexData } from '../hooks/useKardexQuery';
import { useInventoryItems } from '../hooks/useInventoryQuery'; // Reusing to get products list
import { formatDate } from '../../../utils/dateUtils';
import { type MovimientoKardex } from '../services/KardexService';

// UI Components
import {
    PageContainer, TableCard, Table, Badge,
    PageHeader, HeaderTitle, FormGroup
} from '../../../shared/components/UI';
import { Button, Grid } from '../../../shared/components/UI/atoms';

const columnHelper = createColumnHelper<MovimientoKardex>();

const Kardex: React.FC = () => {
    // 1. Local State for Filters
    const [selectedProduct, setSelectedProduct] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // 2. Data Fetching
    const { data: inventory = [], isLoading: loadingProducts } = useInventoryItems();
    
    // We only fetch kardex when a product is selected and user clicks search (or initially if we want)
    // For TanStack Query, we can just use the state. 
    // To make it "on button click", we can use a separate state for the query params.
    const [queryParams, setQueryParams] = useState({ id: "", start: "", end: "" });

    const { data: movimientos = [], isFetching: isSearching } = useKardexData(
        queryParams.id, 
        queryParams.start, 
        queryParams.end
    );

    const handleSearch = () => {
        if (!selectedProduct) return;
        setQueryParams({ id: selectedProduct, start: startDate, end: endDate });
    };

    // 3. TanStack Table Columns
    const columns = useMemo(() => [
        columnHelper.accessor(row => row.fecha || row.created_at, {
            id: 'fecha',
            header: "Fecha",
            cell: info => formatDate(info.getValue())
        }),
        columnHelper.accessor("tipo", {
            header: "Tipo",
            cell: info => {
                const tipo = info.getValue()?.toUpperCase();
                switch (tipo) {
                    case 'ENTRADA':
                    case 'COMPRA':
                        return <Badge $color="#22C55E"><FiArrowDownLeft /> {tipo === 'COMPRA' ? 'Compra' : 'Entrada'}</Badge>;
                    case 'SALIDA':
                    case 'VENTA':
                        return <Badge $color="#EF4444"><FiArrowUpRight /> {tipo === 'VENTA' ? 'Venta' : 'Salida'}</Badge>;
                    case 'AJUSTE':
                        return <Badge $color="#FCA311"><FiRefreshCw /> Ajuste</Badge>;
                    default:
                        return <Badge>{tipo}</Badge>;
                }
            }
        }),
        columnHelper.accessor("referencia", {
            header: "Referencia / Doc",
            cell: info => <span style={{ fontFamily: "monospace", opacity: 0.8 }}>{info.getValue() || '-'}</span>
        }),
        columnHelper.accessor("cantidad", {
            header: () => <div style={{ textAlign: "right" }}>Cantidad</div>,
            cell: info => {
                const tipo = info.row.original.tipo?.toUpperCase();
                const isPositive = tipo === 'ENTRADA' || tipo === 'COMPRA';
                const isNegative = tipo === 'SALIDA' || tipo === 'VENTA';
                return (
                    <div style={{ 
                        textAlign: "right", 
                        fontWeight: 700, 
                        color: isPositive ? '#22C55E' : isNegative ? '#EF4444' : 'inherit' 
                    }}>
                        {isPositive ? '+' : isNegative ? '-' : ''}{info.getValue()}
                    </div>
                );
            }
        }),
        columnHelper.accessor(row => row.saldo_calculado ?? row.saldo_resultante ?? '-', {
            id: 'saldo',
            header: () => <div style={{ textAlign: "right" }}>Saldo Resultante</div>,
            cell: info => (
                <div style={{ textAlign: "right", fontWeight: 800 }}>
                    {info.getValue()}
                </div>
            )
        })
    ], []);

    const table = useReactTable({
        data: movimientos,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiBox color="#FCA311" /> Reporte de Kardex</h1>
                    <p>Consulta el historial de movimientos y flujo de inventario por producto.</p>
                </HeaderTitle>
            </PageHeader>

            {/* Filters Section */}
            <TableCard style={{ marginBottom: 20, padding: '25px' }}>
                <Grid style={{ alignItems: 'end', gap: '20px' }}>
                    <FormGroup style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiBox size={14}/> PRODUCTO *
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            disabled={loadingProducts}
                        >
                            <option value="">-- Seleccione un producto --</option>
                            {inventory.map((item) => (
                                <option key={item.id_producto} value={item.id_producto}>
                                    {item.producto?.nombre} ({item.id_producto})
                                </option>
                            ))}
                        </select>
                    </FormGroup>

                    <FormGroup style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiCalendar size={14}/> DESDE
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </FormGroup>

                    <FormGroup style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiCalendar size={14}/> HASTA
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </FormGroup>

                    <Button 
                        onClick={handleSearch} 
                        disabled={isSearching || !selectedProduct}
                        style={{ height: '45px', padding: '0 30px' }}
                    >
                        {isSearching ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiSearch /> Generar Reporte</>}
                    </Button>
                </Grid>
            </TableCard>

            {/* Results Section */}
            <TableCard>
                {isSearching ? (
                    <div style={{ padding: 100, display: "flex", flexDirection: 'column', alignItems: "center", gap: 20 }}>
                        <ClimbingBoxLoader color="#FCA311" />
                        <p style={{ opacity: 0.5 }}>Generando historial de movimientos...</p>
                    </div>
                ) : (
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
                            {!queryParams.id ? (
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: "center", padding: 80, opacity: 0.4 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                            <FiSearch size={40} opacity={0.2} />
                                            <span>Seleccione un producto y presione "Generar Reporte" para ver el Kardex.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : movimientos.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: "center", padding: 80, opacity: 0.5 }}>
                                        No se encontraron movimientos para los criterios seleccionados.
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
                )}
            </TableCard>
        </PageContainer>
    );
};

export default Kardex;
