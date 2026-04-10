/**
 * RotacionABCPanel.tsx
 * Visualización del análisis de rotación ABC (Pareto 80/15/5).
 *
 * Firma de diseño: barra Pareto horizontal de "líquido" que muestra la
 * concentración real de valor en A/B/C — no un pie chart genérico.
 * Cada clase tiene su columna de productos con chip de clasificación.
 */

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { FiRefreshCw, FiPackage, FiAlertCircle } from "react-icons/fi";
import { useInventoryRotation, useInventoryRotacionDetalle, usePremiumInventory } from "../hooks/usePremiumInventory";

// ── Configuración visual de clases ABC ────────────────────────────────────────
const ABC_CONFIG = {
    A: {
        label: 'Clase A',
        descripcion: 'Alto valor · 80% del valor total',
        color: '#ef4444',
        bgColor: '#ef444415',
        borderColor: '#ef444430',
        pct: '~80%',
        regla: 'Máxima atención. Control de stock riguroso.',
    },
    B: {
        label: 'Clase B',
        descripcion: 'Valor medio · 15% del valor total',
        color: '#f59e0b',
        bgColor: '#f59e0b15',
        borderColor: '#f59e0b30',
        pct: '~15%',
        regla: 'Revisión periódica. Gestión estándar.',
    },
    C: {
        label: 'Clase C',
        descripcion: 'Bajo valor · 5% del valor total',
        color: '#10b981',
        bgColor: '#10b98115',
        borderColor: '#10b98130',
        pct: '~5%',
        regla: 'Baja prioridad. Reorden automático.',
    },
} as const;

type ClaseABC = 'A' | 'B' | 'C';

// ── Panel principal ────────────────────────────────────────────────────────────
export const RotacionABCPanel: React.FC = () => {
    const [activeClass, setActiveClass] = useState<ClaseABC | null>(null);

    const { data: rotData,    isLoading: loadingRot,    refetch: refetchRot }    = useInventoryRotation();
    const { data: detData,    isLoading: loadingDet,    refetch: refetchDet }    = useInventoryRotacionDetalle();
    const { data: items = [],                           refetch: refetchItems }  = usePremiumInventory();

    const isLoading = loadingRot || loadingDet;

    // Mapas de nombres: id_producto → nombre
    const nombreMap = useMemo(() => {
        const map = new Map<string, string>();
        items.forEach(i => map.set(i.id_producto, i.nombre));
        // También desde rotacionDetalle si trae nombre
        (detData?.data ?? []).forEach(d => {
            if (d.nombre) map.set(d.id_producto, d.nombre);
        });
        return map;
    }, [items, detData]);

    // Mapa de índice de rotación por producto
    const rotIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        (detData?.data ?? []).forEach(d => map.set(d.id_producto, d.indice_rotacion));
        return map;
    }, [detData]);

    const abcData = rotData?.data;
    const clases: ClaseABC[] = ['A', 'B', 'C'];

    const counts = {
        A: abcData?.A?.length ?? 0,
        B: abcData?.B?.length ?? 0,
        C: abcData?.C?.length ?? 0,
    };
    const total = counts.A + counts.B + counts.C;

    // Porcentaje real de productos en cada clase
    const realPct = (c: ClaseABC) => total > 0 ? Math.round((counts[c] / total) * 100) : 0;

    const handleRefetch = () => {
        refetchRot();
        refetchDet();
        refetchItems();
    };

    return (
        <PanelWrapper>
            <PanelHeader>
                <div>
                    <h2>Análisis de Rotación ABC</h2>
                    <p>Clasificación Pareto de productos por concentración de valor. A≈80% · B≈15% · C≈5% del valor total.</p>
                </div>
                <RefreshBtn onClick={handleRefetch} title="Actualizar análisis">
                    <FiRefreshCw size={14} />
                </RefreshBtn>
            </PanelHeader>

            {/* Barra Pareto — "líquido" horizontal */}
            {!isLoading && total > 0 && (
                <ParetoSection>
                    <div className="title">Distribución de productos por clase</div>
                    <ParetoBar>
                        {clases.map(c => {
                            const pct = realPct(c);
                            const cfg = ABC_CONFIG[c];
                            return (
                                <ParetoSegment
                                    key={c}
                                    $color={cfg.color}
                                    $pct={pct}
                                    $active={activeClass === c}
                                    onClick={() => setActiveClass(activeClass === c ? null : c)}
                                    title={`${cfg.label}: ${counts[c]} productos (${pct}%)`}
                                >
                                    {pct >= 12 && <span>{c} · {pct}%</span>}
                                </ParetoSegment>
                            );
                        })}
                    </ParetoBar>
                    <ParetoLegend>
                        {clases.map(c => (
                            <LegendItem key={c} $color={ABC_CONFIG[c].color}>
                                <div className="dot" />
                                <span>{ABC_CONFIG[c].label}: {counts[c]} productos ({realPct(c)}%)</span>
                            </LegendItem>
                        ))}
                    </ParetoLegend>
                </ParetoSection>
            )}

            {isLoading ? (
                <LoaderGrid>
                    {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
                </LoaderGrid>
            ) : !abcData ? (
                <EmptyState>
                    <FiAlertCircle size={32} />
                    <p>No hay datos de rotación disponibles para esta sucursal.</p>
                </EmptyState>
            ) : (
                <ClassGrid>
                    {clases.map(c => {
                        const cfg = ABC_CONFIG[c];
                        const ids = abcData[c] ?? [];
                        const isFiltered = activeClass !== null && activeClass !== c;

                        return (
                            <ClassColumn
                                key={c}
                                $color={cfg.color}
                                $bgColor={cfg.bgColor}
                                $borderColor={cfg.borderColor}
                                $dimmed={isFiltered}
                                onClick={() => setActiveClass(activeClass === c ? null : c)}
                            >
                                {/* Cabecera de clase */}
                                <ClassHeader $color={cfg.color}>
                                    <div className="badge">{c}</div>
                                    <div className="info">
                                        <div className="label">{cfg.label}</div>
                                        <div className="desc">{cfg.descripcion}</div>
                                    </div>
                                    <div className="count">{ids.length}</div>
                                </ClassHeader>

                                <ClassRule $color={cfg.color}>{cfg.regla}</ClassRule>

                                {/* Lista de productos */}
                                <ProductList>
                                    {ids.length === 0 ? (
                                        <EmptyClass>Sin productos en esta clase</EmptyClass>
                                    ) : (
                                        ids.map(id => {
                                            const nombre = nombreMap.get(id) ?? id.slice(0, 8) + '…';
                                            const rotIdx = rotIndexMap.get(id);
                                            return (
                                                <ProductRow key={id} $color={cfg.color}>
                                                    <div className="icon">
                                                        <FiPackage size={12} />
                                                    </div>
                                                    <div className="nombre">{nombre}</div>
                                                    {rotIdx !== undefined && (
                                                        <div className="rotidx" title="Índice de rotación">
                                                            {rotIdx.toFixed(1)}×
                                                        </div>
                                                    )}
                                                </ProductRow>
                                            );
                                        })
                                    )}
                                </ProductList>
                            </ClassColumn>
                        );
                    })}
                </ClassGrid>
            )}
        </PanelWrapper>
    );
};

// ── Estilos ────────────────────────────────────────────────────────────────────
const PanelWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const PanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    p  { margin: 4px 0 0; opacity: 0.5; font-size: 0.82rem; }
`;

const RefreshBtn = styled.button`
    background: transparent;
    border: 1px solid ${({ theme }) => theme.bg3}33;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    color: ${({ theme }) => theme.text};
    opacity: 0.6;
    transition: opacity 0.15s ease;
    display: flex;
    align-items: center;

    &:hover { opacity: 1; }
`;

const ParetoSection = styled.div`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}22;
    border-radius: 14px;
    padding: 20px 24px;

    .title {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.5;
        margin-bottom: 14px;
    }
`;

const ParetoBar = styled.div`
    display: flex;
    height: 36px;
    border-radius: 10px;
    overflow: hidden;
    gap: 2px;
    margin-bottom: 12px;
`;

const ParetoSegment = styled.div<{ $color: string; $pct: number; $active: boolean }>`
    flex: ${({ $pct }) => $pct};
    background: ${({ $color, $active }) => $active ? $color : `${$color}80`};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: flex 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease;
    min-width: 0;
    border-radius: 6px;

    span {
        font-size: 0.7rem;
        font-weight: 800;
        color: white;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        letter-spacing: 0.04em;
    }

    &:hover {
        background: ${({ $color }) => $color};
        flex: ${({ $pct }) => Math.max($pct + 2, $pct * 1.1)};
    }
`;

const ParetoLegend = styled.div`
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
`;

const LegendItem = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 6px;

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${({ $color }) => $color};
        flex-shrink: 0;
    }

    span {
        font-size: 0.75rem;
        opacity: 0.65;
        font-weight: 500;
    }
`;

const ClassGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    align-items: start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const ClassColumn = styled.div<{
    $color: string; $bgColor: string; $borderColor: string; $dimmed: boolean;
}>`
    background: ${({ $bgColor }) => $bgColor};
    border: 1px solid ${({ $borderColor }) => $borderColor};
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    opacity: ${({ $dimmed }) => $dimmed ? 0.35 : 1};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        opacity: 1;
    }
`;

const ClassHeader = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid ${({ $color }) => $color}20;

    .badge {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: ${({ $color }) => $color}25;
        color: ${({ $color }) => $color};
        font-size: 1.1rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .info { flex: 1; min-width: 0; }

    .label {
        font-size: 0.85rem;
        font-weight: 700;
        color: ${({ $color }) => $color};
    }

    .desc {
        font-size: 0.72rem;
        opacity: 0.55;
        margin-top: 2px;
    }

    .count {
        font-size: 1.4rem;
        font-weight: 900;
        color: ${({ $color }) => $color};
        opacity: 0.7;
        font-variant-numeric: tabular-nums;
    }
`;

const ClassRule = styled.div<{ $color: string }>`
    padding: 8px 20px;
    font-size: 0.72rem;
    color: ${({ $color }) => $color};
    opacity: 0.75;
    font-weight: 600;
    border-bottom: 1px solid ${({ $color }) => $color}15;
`;

const ProductList = styled.div`
    max-height: 320px;
    overflow-y: auto;
    padding: 8px 0;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-thumb {
        background: rgba(150,150,150,0.2);
        border-radius: 3px;
    }
`;

const ProductRow = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 20px;
    transition: background 0.12s ease;

    &:hover { background: ${({ $color }) => $color}08; }

    .icon {
        color: ${({ $color }) => $color};
        opacity: 0.5;
        flex-shrink: 0;
        display: flex;
    }

    .nombre {
        flex: 1;
        font-size: 0.8rem;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0.8;
    }

    .rotidx {
        font-size: 0.7rem;
        font-weight: 700;
        color: ${({ $color }) => $color};
        opacity: 0.65;
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
    }
`;

const EmptyClass = styled.div`
    padding: 20px;
    font-size: 0.78rem;
    opacity: 0.35;
    text-align: center;
`;

const LoaderGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
`;

const CardSkeleton = styled.div`
    height: 300px;
    border-radius: 14px;
    background: rgba(255,255,255,0.04);
    animation: shimmer 1.5s ease infinite;

    @keyframes shimmer {
        0%, 100% { opacity: 0.4; }
        50%       { opacity: 0.7; }
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    opacity: 0.4;

    p { margin: 0; font-size: 0.85rem; }
`;
