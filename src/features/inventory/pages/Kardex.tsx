/**
 * Kardex.tsx
 * Vista de reporte de movimientos de inventario (Kardex).
 * Permite consultar el historial de entradas, salidas, compras, ventas y ajustes
 * de un producto específico, con filtros opcionales por rango de fechas.
 *
 * Flujo principal:
 *  1. El usuario selecciona un producto del inventario.
 *  2. Opcionalmente define un rango de fechas (desde / hasta).
 *  3. Al presionar "Generar Reporte", se dispara la consulta al backend.
 *  4. Los resultados se muestran en una tabla gestionada por TanStack Table.
 */

import React, { useState, useMemo } from 'react';
import { FiBox, FiSearch, FiArrowDownLeft, FiArrowUpRight, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { ClimbingBoxLoader } from 'react-spinners';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

// ── Hooks & Services ───────────────────────────────────────────────────────
import { useKardexData } from '../hooks/useKardexQuery';
import { useInventoryItems } from '../hooks/useInventoryQuery'; // Reutilizado para poblar el selector de productos
import { formatDate } from '../../../utils/dateUtils';
import { type MovimientoKardex } from '../services/KardexService';

// ── UI Components (Shared Design System) ──────────────────────────────────
import {
    PageContainer, TableCard, Table, Badge,
    PageHeader, HeaderTitle, FormGroup
} from '../../../shared/components/UI';
import { Button, Grid } from '../../../shared/components/UI';

// Helper de TanStack Table tipado con el modelo de datos MovimientoKardex
const columnHelper = createColumnHelper<MovimientoKardex>();

const Kardex: React.FC = () => {

    // ── 1. Estado local de filtros del formulario ──────────────────────────
    // Estos estados controlan los inputs del formulario antes de ejecutar la búsqueda.
    // No disparan la consulta directamente; se aplican solo al presionar "Generar Reporte".
    const [selectedProduct, setSelectedProduct] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // ── 2. Carga de datos ──────────────────────────────────────────────────

    // Lista de productos del inventario para poblar el <select>.
    // Se reutiliza el hook de inventario en lugar de crear uno exclusivo para el selector.
    const { data: inventory = [], isLoading: loadingProducts } = useInventoryItems();

    /**
     * Parámetros de consulta del Kardex.
     * Se mantienen separados del estado del formulario para implementar el patrón
     * "buscar al hacer clic": la query solo se re-ejecuta cuando el usuario
     * presiona el botón, no en cada cambio de input.
     */
    const [queryParams, setQueryParams] = useState({ id: "", start: "", end: "" });

    // La query de Kardex se activa/refresca cuando cambia queryParams.
    // isFetching (en lugar de isLoading) detecta tanto la carga inicial como los refetches.
    const { data: movimientos = [], isFetching: isSearching } = useKardexData(
        queryParams.id, 
        queryParams.start, 
        queryParams.end
    );

    /**
     * Sincroniza los filtros del formulario con queryParams para disparar la consulta.
     * Requiere que haya un producto seleccionado o la opción "all"; de lo contrario, no hace nada.
     */
    const handleSearch = () => {
        if (!selectedProduct) return;
        setQueryParams({ id: selectedProduct, start: startDate, end: endDate });
    };

    // ── 3. Definición de columnas para TanStack Table ──────────────────────
    // useMemo evita que las columnas se recreen en cada render, optimizando rendimiento.
    const columns = useMemo(() => [
        
        // Columna: Producto (Nombre)
        columnHelper.accessor("id_producto", {
            header: "Producto",
            cell: info => {
                const id = info.getValue();
                const item = inventory.find(i => i.id_producto === id);
                return (
                    <div style={{ fontWeight: 600 }}>
                        {item?.producto?.nombre || "Cargando..."}
                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{id}</div>
                    </div>
                );
            }
        }),

        // Columna: Fecha del movimiento
        // Prioriza `fecha`; si no existe, usa `created_at` como fallback.
        columnHelper.accessor(row => row.fecha || row.created_at, {
            id: 'fecha',
            header: "Fecha",
            cell: info => formatDate(info.getValue())
        }),

        // Columna: Tipo de movimiento con Badge de color semántico
        // Verde → entradas/compras | Rojo → salidas/ventas | Amarillo → ajustes
        columnHelper.accessor(row => row.tipo_movimiento || (row as any).tipo, {
            id: 'tipo',
            header: "Tipo",
            cell: info => {
                const tipo = String(info.getValue() || '').toUpperCase();
                switch (tipo) {
                    case 'ENTRADA':
                    case 'COMPRA':
                        return <Badge $color="#22C55E"><FiArrowDownLeft /> {tipo === 'COMPRA' ? 'Compra' : 'Entrada'}</Badge>;
                    case 'SALIDA':
                    case 'VENTA':
                        return <Badge $color="#EF4444"><FiArrowUpRight /> {tipo === 'VENTA' ? 'Venta' : 'Salida'}</Badge>;
                    case 'AJUSTE':
                    case 'DEVOLUCION':
                    case 'TRASLADO':
                        return <Badge $color="#FCA311"><FiRefreshCw /> {tipo.charAt(0) + tipo.slice(1).toLowerCase()}</Badge>;
                    default:
                        // Tipo desconocido: se muestra sin color especial
                        return <Badge>{tipo || 'N/A'}</Badge>;
                }
            }
        }),

        // Columna: Referencia o número de documento asociado al movimiento
        // Fuente monoespaciada para facilitar lectura de códigos/folios
        columnHelper.accessor("referencia", {
            header: "Referencia / Doc",
            cell: info => <span style={{ fontFamily: "monospace", opacity: 0.8 }}>{info.getValue() || '-'}</span>
        }),

        // Columna: Cantidad del movimiento con signo y color según dirección
        // (+) verde para entradas/compras | (-) rojo para salidas/ventas
        columnHelper.accessor("cantidad", {
            header: () => <div style={{ textAlign: "right" }}>Cantidad</div>,
            cell: info => {
                const tipo = String(info.row.original.tipo_movimiento || (info.row.original as any).tipo || '').toUpperCase();
                const isPositive = ['ENTRADA', 'COMPRA', 'DEVOLUCION'].includes(tipo);
                const isNegative = ['SALIDA', 'VENTA'].includes(tipo);
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

        // Columna: Saldo resultante después del movimiento
        // Intenta `saldo_calculado` primero (campo derivado del frontend/backend);
        // si no existe, usa `saldo_resultante` del backend; como último recurso muestra '-'.
        columnHelper.accessor(row => row.saldo_resultante ?? row.saldo_calculado ?? row.stock_posterior ?? '-', {
            id: 'saldo',
            header: () => <div style={{ textAlign: "right" }}>Saldo Resultante</div>,
            cell: info => (
                <div style={{ textAlign: "right", fontWeight: 800 }}>
                    {info.getValue()}
                </div>
            )
        })
    ], [inventory]);

    // Instancia de la tabla con los datos y columnas definidos
    const table = useReactTable({
        data: movimientos,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <PageContainer>

            {/* ── Encabezado de la página ── */}
            <PageHeader>
                <HeaderTitle>
                    <h1><FiBox color="#FCA311" /> Reporte de Kardex</h1>
                    <p>Consulta el historial de movimientos y flujo de inventario por producto.</p>
                </HeaderTitle>
            </PageHeader>

            {/* ── Panel de filtros ── */}
            <TableCard style={{ marginBottom: 20, padding: '25px' }}>
                <Grid style={{ alignItems: 'end', gap: '20px' }}>

                    {/* Selector de producto: se deshabilita mientras carga el inventario */}
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
                            <option value="all">TODOS LOS PRODUCTOS</option>
                            {inventory.map((item) => (
                                <option key={item.id_producto} value={item.id_producto}>
                                    {item.producto?.nombre || "Sin nombre"} ({item.id_producto})
                                </option>
                            ))}
                        </select>
                    </FormGroup>

                    {/* Filtro de fecha inicial del rango */}
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

                    {/* Filtro de fecha final del rango */}
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

                    {/*
                     * Botón de búsqueda:
                     * - Deshabilitado si no hay producto seleccionado o si ya hay una búsqueda en curso.
                     * - Muestra ClimbingBoxLoader pequeño mientras isSearching es true.
                     */}
                    <Button 
                        onClick={handleSearch} 
                        disabled={isSearching || !selectedProduct}
                        style={{ height: '45px', padding: '0 30px' }}
                    >
                        {isSearching ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiSearch /> Generar Reporte</>}
                    </Button>
                </Grid>
            </TableCard>

            {/* ── Sección de resultados ── */}
            <TableCard>
                {/*
                 * Estados de la tabla (en orden de prioridad):
                 *  1. isSearching → muestra loader centrado mientras se obtienen datos
                 *  2. !queryParams.id → estado inicial: el usuario aún no ha buscado
                 *  3. movimientos.length === 0 → búsqueda sin resultados
                 *  4. Default → renderiza las filas con TanStack Table
                 */}
                {isSearching ? (
                    // Estado de carga: se muestra mientras la query está en vuelo
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
                                            {/* isPlaceholder: columnas de agrupación sin header real */}
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {!queryParams.id ? (
                                // Estado inicial: invita al usuario a realizar su primera búsqueda
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: "center", padding: 80, opacity: 0.4 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                            <FiSearch size={40} opacity={0.2} />
                                            <span>Seleccione un producto y presione "Generar Reporte" para ver el Kardex.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : movimientos.length === 0 ? (
                                // Sin resultados: la búsqueda se ejecutó pero no retornó movimientos
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: "center", padding: 80, opacity: 0.5 }}>
                                        No se encontraron movimientos para los criterios seleccionados.
                                    </td>
                                </tr>
                            ) : (
                                // Renderizado de filas mediante TanStack Table
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