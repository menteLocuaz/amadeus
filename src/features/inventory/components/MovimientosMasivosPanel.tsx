/**
 * MovimientosMasivosPanel.tsx
 * Formulario para registrar el mismo tipo de movimiento sobre múltiples
 * productos en una sola operación atómica (función almacenada en BD).
 *
 * Diseño: buscador inline + tabla de líneas dinámica + resumen con total de unidades.
 * Toda la operación se revierte si un solo ítem falla (comportamiento del backend).
 */

import React, { useState, useMemo, useRef } from "react";
import styled from "styled-components";
import {
    FiPlus, FiTrash2, FiSearch, FiAlertTriangle,
    FiCheck, FiPackage, FiSend
} from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { usePremiumInventory, useMovimientoMasivo, type MergedInventoryItem } from "../hooks/usePremiumInventory";
import { type TipoMovimiento } from "../services/InventoryService";
import { FormGroup } from "../../../shared/components/UI";

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface LineaMovimiento {
    id_producto: string;
    nombre: string;
    unidad_nombre: string;
    stock_actual: number;
    cantidad: number;
}

const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string; color: string }[] = [
    { value: 'ENTRADA',    label: 'ENTRADA — Ingreso de mercancía',          color: '#10b981' },
    { value: 'SALIDA',     label: 'SALIDA — Egreso de mercancía',            color: '#ef4444' },
    { value: 'AJUSTE',     label: 'AJUSTE — Corrección por conteo físico',   color: '#f59e0b' },
    { value: 'DEVOLUCION', label: 'DEVOLUCIÓN — De cliente o proveedor',     color: '#3b82f6' },
    { value: 'TRASLADO',   label: 'TRASLADO — Entre sucursales',             color: '#8b5cf6' },
];

// ── Panel principal ────────────────────────────────────────────────────────────
export const MovimientosMasivosPanel: React.FC = () => {
    const { user } = useAuthStore();
    const sucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || '';

    const { data: inventoryItems = [] } = usePremiumInventory();
    const mutation = useMovimientoMasivo();

    // ── Estado del formulario ──────────────────────────────────────────────────
    const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('ENTRADA');
    const [referencia, setReferencia]         = useState('');
    const [busqueda, setBusqueda]             = useState('');
    const [lineas, setLineas]                 = useState<LineaMovimiento[]>([]);
    const [showDropdown, setShowDropdown]     = useState(false);
    const busquedaRef = useRef<HTMLInputElement>(null);

    // ── Productos disponibles (solo los que ya tienen inventario inicializado) ─
    const productosConInventario = useMemo(
        () => inventoryItems.filter(i => !!i.id_inventario),
        [inventoryItems]
    );

    // IDs ya en la lista para no repetir
    const idsEnLineas = useMemo(
        () => new Set(lineas.map(l => l.id_producto)),
        [lineas]
    );

    // Resultados del buscador
    const resultados = useMemo(() => {
        if (!busqueda.trim()) return [];
        const q = busqueda.toLowerCase();
        return productosConInventario
            .filter(p => !idsEnLineas.has(p.id_producto) && (p.nombre ?? '').toLowerCase().includes(q))
            .slice(0, 8);
    }, [busqueda, productosConInventario, idsEnLineas]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const agregarProducto = (item: MergedInventoryItem) => {
        setLineas(prev => [...prev, {
            id_producto:  item.id_producto,
            nombre:       item.nombre,
            unidad_nombre: item.unidad_nombre,
            stock_actual:  item.stock_actual,
            cantidad:      1,
        }]);
        setBusqueda('');
        setShowDropdown(false);
        busquedaRef.current?.focus();
    };

    const actualizarCantidad = (id: string, valor: string) => {
        const n = Math.max(0, parseFloat(valor) || 0);
        setLineas(prev => prev.map(l => l.id_producto === id ? { ...l, cantidad: n } : l));
    };

    const eliminarLinea = (id: string) => {
        setLineas(prev => prev.filter(l => l.id_producto !== id));
    };

    const limpiarForm = () => {
        setLineas([]);
        setReferencia('');
        setBusqueda('');
    };

    const handleSubmit = async () => {
        if (lineas.length === 0) return;
        const lineasValidas = lineas.filter(l => l.cantidad > 0);
        if (lineasValidas.length === 0) return;

        await mutation.mutateAsync({
            id_sucursal:     sucursalId,
            tipo_movimiento: tipoMovimiento,
            referencia:      referencia.trim() || undefined,
            items: lineasValidas.map(l => ({
                id_producto: l.id_producto,
                cantidad:    l.cantidad,
            })),
        });

        limpiarForm();
    };

    // ── Stats del resumen ──────────────────────────────────────────────────────
    const totalLineas   = lineas.filter(l => l.cantidad > 0).length;
    const totalUnidades = lineas.reduce((acc, l) => acc + l.cantidad, 0);
    const tipoConfig    = TIPOS_MOVIMIENTO.find(t => t.value === tipoMovimiento)!;

    return (
        <PanelWrapper>
            <PanelHeader>
                <div>
                    <h2>Movimientos Masivos</h2>
                    <p>Registra el mismo tipo de movimiento para múltiples productos en una operación atómica. Si un producto falla, toda la operación se revierte.</p>
                </div>
            </PanelHeader>

            {/* Configuración global del movimiento */}
            <ConfigCard>
                <ConfigGrid>
                    <FormGroup>
                        <label>Tipo de Movimiento</label>
                        <select
                            value={tipoMovimiento}
                            onChange={e => setTipoMovimiento(e.target.value as TipoMovimiento)}
                        >
                            {TIPOS_MOVIMIENTO.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Referencia (Opcional)</label>
                        <input
                            type="text"
                            value={referencia}
                            onChange={e => setReferencia(e.target.value)}
                            placeholder="Núm. orden de compra, reporte de conteo físico..."
                        />
                    </FormGroup>
                </ConfigGrid>

                <TipoBadge $color={tipoConfig.color}>
                    Tipo activo: <strong>{tipoConfig.value}</strong>
                </TipoBadge>
            </ConfigCard>

            {/* Buscador de productos */}
            <BuscadorSection>
                <BuscadorLabel>Agregar productos</BuscadorLabel>
                <BuscadorWrapper>
                    <SearchIcon><FiSearch size={14} /></SearchIcon>
                    <input
                        ref={busquedaRef}
                        type="text"
                        placeholder="Buscar producto por nombre..."
                        value={busqueda}
                        onChange={e => { setBusqueda(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    />
                    {showDropdown && resultados.length > 0 && (
                        <Dropdown>
                            {resultados.map(item => (
                                <DropdownItem
                                    key={item.id_producto}
                                    onMouseDown={() => agregarProducto(item)}
                                >
                                    <div className="icon"><FiPackage size={12} /></div>
                                    <div className="info">
                                        <div className="nombre">{item.nombre}</div>
                                        <div className="meta">
                                            {item.categoria_nombre} · Stock: {item.stock_actual} {item.unidad_nombre}
                                        </div>
                                    </div>
                                    <div className="add"><FiPlus size={14} /></div>
                                </DropdownItem>
                            ))}
                        </Dropdown>
                    )}
                    {showDropdown && busqueda.trim() && resultados.length === 0 && (
                        <Dropdown>
                            <DropdownEmpty>Sin resultados para "{busqueda}"</DropdownEmpty>
                        </Dropdown>
                    )}
                </BuscadorWrapper>
            </BuscadorSection>

            {/* Tabla de líneas */}
            {lineas.length > 0 ? (
                <LineasSection>
                    <LineasTable>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th style={{ textAlign: 'center' }}>Stock Actual</th>
                                <th style={{ textAlign: 'center' }}>Cantidad</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {lineas.map(linea => {
                                const esInsuficiente =
                                    tipoMovimiento === 'SALIDA' && linea.cantidad > linea.stock_actual;

                                return (
                                    <tr key={linea.id_producto} className={esInsuficiente ? 'warning' : ''}>
                                        <td>
                                            <ProductoCell>
                                                <FiPackage size={12} />
                                                <span>{linea.nombre}</span>
                                            </ProductoCell>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <StockBadge $low={linea.stock_actual <= 0}>
                                                {linea.stock_actual} {linea.unidad_nombre}
                                            </StockBadge>
                                        </td>
                                        <td>
                                            <CantidadInput
                                                type="number"
                                                value={linea.cantidad}
                                                min={0.01}
                                                step="0.01"
                                                onChange={e => actualizarCantidad(linea.id_producto, e.target.value)}
                                                onFocus={e => e.target.select()}
                                                $warning={esInsuficiente}
                                            />
                                        </td>
                                        <td>
                                            <EliminarBtn onClick={() => eliminarLinea(linea.id_producto)}>
                                                <FiTrash2 size={13} />
                                            </EliminarBtn>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </LineasTable>
                </LineasSection>
            ) : (
                <EmptyLineas>
                    <FiPackage size={28} />
                    <p>Busca y agrega productos para crear el movimiento masivo.</p>
                </EmptyLineas>
            )}

            {/* Footer: resumen + acciones */}
            <FooterBar $visible={lineas.length > 0}>
                <ResumenStats>
                    <StatItem>
                        <span className="value">{totalLineas}</span>
                        <span className="label">producto(s)</span>
                    </StatItem>
                    <StatDivider />
                    <StatItem>
                        <span className="value">{totalUnidades.toLocaleString('es', { maximumFractionDigits: 2 })}</span>
                        <span className="label">unidades totales</span>
                    </StatItem>
                    <StatDivider />
                    <StatItem>
                        <span className="value" style={{ color: tipoConfig.color }}>{tipoConfig.value}</span>
                        <span className="label">tipo de mov.</span>
                    </StatItem>
                </ResumenStats>

                <FooterActions>
                    {tipoMovimiento === 'SALIDA' && lineas.some(l => l.cantidad > l.stock_actual) && (
                        <AlertaStock>
                            <FiAlertTriangle size={13} />
                            <span>Hay productos con cantidad mayor al stock disponible</span>
                        </AlertaStock>
                    )}
                    <LimpiarBtn onClick={limpiarForm} disabled={mutation.isPending}>
                        Limpiar
                    </LimpiarBtn>
                    <SubmitBtn
                        onClick={handleSubmit}
                        disabled={mutation.isPending || totalLineas === 0}
                    >
                        {mutation.isPending ? (
                            <ClimbingBoxLoader size={6} color="#14213D" />
                        ) : (
                            <><FiSend size={14} /> Registrar {totalLineas} movimiento(s)</>
                        )}
                    </SubmitBtn>
                </FooterActions>

                <AtomicNote>
                    <FiCheck size={11} /> Operación atómica: si un producto falla, toda la operación se revierte.
                </AtomicNote>
            </FooterBar>
        </PanelWrapper>
    );
};

// ── Estilos ────────────────────────────────────────────────────────────────────
const PanelWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const PanelHeader = styled.div`
    h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    p  { margin: 4px 0 0; opacity: 0.5; font-size: 0.82rem; line-height: 1.5; }
`;

const ConfigCard = styled.div`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}22;
    border-radius: 14px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const ConfigGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const TipoBadge = styled.div<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: ${({ $color }) => $color};
    background: ${({ $color }) => $color}12;
    border: 1px solid ${({ $color }) => $color}30;
    padding: 5px 12px;
    border-radius: 100px;
    width: fit-content;

    strong { font-weight: 800; }
`;

const BuscadorSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const BuscadorLabel = styled.div`
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.5;
`;

const BuscadorWrapper = styled.div`
    position: relative;

    input {
        width: 100%;
        padding: 12px 16px 12px 40px;
        background: ${({ theme }) => theme.bg2 || theme.bg};
        border: 1px solid ${({ theme }) => theme.bg3}33;
        border-radius: 10px;
        color: ${({ theme }) => theme.text};
        font-size: 0.9rem;
        outline: none;
        box-sizing: border-box;

        &:focus { border-color: ${({ theme }) => theme.primary}60; }
        &::placeholder { opacity: 0.4; }
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.4;
    display: flex;
    pointer-events: none;
`;

const Dropdown = styled.div`
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}33;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    z-index: 100;
    overflow: hidden;
`;

const DropdownItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    cursor: pointer;
    transition: background 0.12s ease;

    &:hover { background: ${({ theme }) => theme.bg3}15; }

    .icon { opacity: 0.4; flex-shrink: 0; display: flex; }

    .info { flex: 1; min-width: 0; }

    .nombre {
        font-size: 0.85rem;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .meta {
        font-size: 0.72rem;
        opacity: 0.45;
        margin-top: 2px;
    }

    .add {
        opacity: 0;
        transition: opacity 0.12s;
        color: ${({ theme }) => theme.primary};
        display: flex;
    }

    &:hover .add { opacity: 1; }
`;

const DropdownEmpty = styled.div`
    padding: 16px;
    font-size: 0.82rem;
    opacity: 0.4;
    text-align: center;
`;

const LineasSection = styled.div`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}22;
    border-radius: 14px;
    overflow: hidden;
`;

const LineasTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    thead tr {
        border-bottom: 1px solid ${({ theme }) => theme.bg3}22;
    }

    th {
        padding: 10px 16px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.45;
        text-align: left;
    }

    tbody tr {
        border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
        transition: background 0.12s ease;

        &:last-child { border-bottom: none; }
        &:hover { background: ${({ theme }) => theme.bg3}08; }
        &.warning { background: #ef444408; }
    }

    td { padding: 10px 16px; }
`;

const ProductoCell = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 500;

    svg { opacity: 0.35; flex-shrink: 0; }
`;

const StockBadge = styled.div<{ $low: boolean }>`
    display: inline-flex;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 700;
    color: ${({ $low }) => $low ? '#ef4444' : '#10b981'};
    background: ${({ $low }) => $low ? '#ef444412' : '#10b98112'};
    font-variant-numeric: tabular-nums;
    margin: 0 auto;
`;

const CantidadInput = styled.input<{ $warning: boolean }>`
    width: 90px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid ${({ $warning }) => $warning ? '#ef444440' : 'rgba(150,150,150,0.2)'};
    background: ${({ $warning }) => $warning ? '#ef444408' : 'transparent'};
    color: ${({ $warning, theme }) => $warning ? '#ef4444' : theme.text};
    font-size: 0.85rem;
    font-weight: 700;
    text-align: center;
    outline: none;
    font-variant-numeric: tabular-nums;
    display: block;
    margin: 0 auto;

    &:focus { border-color: ${({ theme }) => theme.primary}60; }
`;

const EliminarBtn = styled.button`
    background: transparent;
    border: none;
    padding: 6px;
    border-radius: 6px;
    cursor: pointer;
    color: #ef4444;
    opacity: 0.4;
    transition: opacity 0.12s, background 0.12s;
    display: flex;

    &:hover { opacity: 1; background: #ef444415; }
`;

const EmptyLineas = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 20px;
    background: ${({ theme }) => theme.bg};
    border: 1px dashed ${({ theme }) => theme.bg3}33;
    border-radius: 14px;
    opacity: 0.4;

    p { margin: 0; font-size: 0.85rem; }
`;

const FooterBar = styled.div<{ $visible: boolean }>`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}22;
    border-radius: 14px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    opacity: ${({ $visible }) => $visible ? 1 : 0.4};
    pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};
    transition: opacity 0.2s ease;
`;

const ResumenStats = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;

    .value {
        font-size: 1.3rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        line-height: 1;
    }

    .label {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.45;
    }
`;

const StatDivider = styled.div`
    width: 1px;
    height: 32px;
    background: ${({ theme }) => theme.bg3}33;
`;

const FooterActions = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

const AlertaStock = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: #ef4444;
    background: #ef444410;
    border: 1px solid #ef444430;
    border-radius: 8px;
    padding: 6px 12px;
    flex: 1;
`;

const LimpiarBtn = styled.button`
    padding: 10px 20px;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.bg3}33;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s;

    &:hover:not(:disabled) { opacity: 1; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

const SubmitBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 10px;
    border: none;
    background: ${({ theme }) => theme.primary || '#FCA311'};
    color: #14213D;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
    min-height: 40px;
    min-width: 200px;
    justify-content: center;

    &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

const AtomicNote = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    opacity: 0.4;
`;
