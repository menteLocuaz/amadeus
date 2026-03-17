import React, { useEffect } from 'react';
import { FiBox, FiSearch, FiArrowDownLeft, FiArrowUpRight, FiRefreshCw } from 'react-icons/fi';
import { ClimbingBoxLoader } from 'react-spinners';
import { useKardex } from '../hooks/useKardex';
import { formatDate } from '../../../utils/dateUtils';

// UI Components
import {
    PageContainer, TableCard, Table, Badge,
    PageHeader, HeaderTitle, FormGroup
} from '../../../shared/components/UI';
import { Button, Grid } from '../../../shared/components/UI/atoms';

const Kardex: React.FC = () => {
    const {
        products,
        // sucursales,
        movimientos,
        isLoading,
        isSearching,
        selectedProduct,
        setSelectedProduct,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loadInitialData,
        handleSearch
    } = useKardex();

    // Load initial products list when component mounts
    useEffect(() => {
        loadInitialData();
    }, []);

    // Helper to format movement type badge
    const renderTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'ENTRADA':
                return <Badge $color="#22C55E"><FiArrowDownLeft /> Entrada</Badge>;
            case 'SALIDA':
                return <Badge $color="#EF4444"><FiArrowUpRight /> Salida</Badge>;
            case 'AJUSTE':
                return <Badge $color="#FCA311"><FiRefreshCw /> Ajuste</Badge>;
            default:
                return <Badge>{tipo}</Badge>;
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiBox color="#FCA311" /> Reporte de Kardex</h1>
                    <p>Consulta el historial de movimientos y flujo de inventario por producto.</p>
                </HeaderTitle>
            </PageHeader>

            {/* Filters Section */}
            <TableCard style={{ marginBottom: 20, padding: 20 }}>
                <Grid style={{ alignItems: 'end' }}>
                    <FormGroup>
                        <label>Producto *</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">-- Seleccione un producto --</option>
                            {products.map((p) => (
                                <option key={p.id || p.id_producto} value={p.id || p.id_producto}>
                                    {p.nombre}
                                </option>
                            ))}
                        </select>
                    </FormGroup>

                    <FormGroup>
                        <label>Desde (Opcional)</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Hasta (Opcional)</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </FormGroup>

                    <div style={{ marginBottom: 15 }}>
                        <Button onClick={handleSearch} disabled={isSearching || isLoading || !selectedProduct}>
                            {isSearching ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiSearch /> Generar</>}
                        </Button>
                    </div>
                </Grid>
            </TableCard>

            {/* Results Section */}
            <TableCard>
                {isSearching ? (
                    <div style={{ padding: 100, display: "flex", justifyContent: "center" }}>
                        <ClimbingBoxLoader color="#FCA311" />
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Referencia / Doc</th>
                                <th style={{ textAlign: "right" }}>Cantidad</th>
                                <th style={{ textAlign: "right" }}>Saldo Resultante</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!selectedProduct ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                                        Seleccione un producto y presione "Generar" para ver el Kardex.
                                    </td>
                                </tr>
                            ) : movimientos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                                        No se encontraron movimientos para el rango seleccionado.
                                    </td>
                                </tr>
                            ) : (
                                movimientos.map((mov, index) => (
                                    <tr key={mov.id || index}>
                                        <td>{formatDate(mov.fecha || mov.created_at)}</td>
                                        <td>{renderTipoBadge(mov.tipo)}</td>
                                        <td><span style={{ fontFamily: "monospace", opacity: 0.8 }}>{mov.referencia || '-'}</span></td>
                                        <td style={{ textAlign: "right", fontWeight: 700, color: mov.tipo === 'ENTRADA' ? '#22C55E' : mov.tipo === 'SALIDA' ? '#EF4444' : 'inherit' }}>
                                            {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : ''}{mov.cantidad}
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: 800 }}>
                                            {mov.saldo_calculado ?? mov.saldo_resultante ?? '-'}
                                        </td>
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
