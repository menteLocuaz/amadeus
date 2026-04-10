/**
 * ValuacionPanel.tsx
 * Compara el valor contable del inventario según los tres métodos de costeo:
 * PEPS (FIFO), UEPS (LIFO) y Promedio Ponderado.
 *
 * Diseño: tres columnas comparativas con indicadores de delta entre métodos.
 * El método activo se resalta; los otros muestran la diferencia en % respecto al promedio.
 */

import React, { useState } from "react";
import styled from "styled-components";
import { FiTrendingUp, FiTrendingDown, FiMinus, FiRefreshCw, FiInfo } from "react-icons/fi";
import { useInventoryValuation } from "../hooks/usePremiumInventory";

// ── Tipos ──────────────────────────────────────────────────────────────────────
type MetodoValuacion = 'peps' | 'ueps' | 'promedio';

interface MetodoConfig {
    key: MetodoValuacion;
    label: string;
    sigla: string;
    descripcion: string;
    color: string;
}

const METODOS: MetodoConfig[] = [
    {
        key: 'peps',
        label: 'PEPS',
        sigla: 'FIFO',
        descripcion: 'Primeras entradas, primeras salidas. Valúa con los lotes más antiguos.',
        color: '#3b82f6',
    },
    {
        key: 'ueps',
        label: 'UEPS',
        sigla: 'LIFO',
        descripcion: 'Últimas entradas, primeras salidas. Refleja costos de reposición actuales.',
        color: '#8b5cf6',
    },
    {
        key: 'promedio',
        label: 'Promedio',
        sigla: 'WAC',
        descripcion: 'Costo promedio ponderado. Distribuye variaciones de precio entre todas las unidades.',
        color: '#10b981',
    },
];

// ── Subcomponente: card de un método ─────────────────────────────────────────
interface ValMethodCardProps {
    config: MetodoConfig;
    isActive: boolean;
    valor: number | null;
    isLoading: boolean;
    delta: number | null;    // % vs promedio base (Promedio WAC)
    onSelect: () => void;
}

const ValMethodCard: React.FC<ValMethodCardProps> = ({
    config, isActive, valor, isLoading, delta, onSelect
}) => {
    const DeltaIcon = delta === null ? FiMinus
        : delta > 0 ? FiTrendingUp : FiTrendingDown;
    const deltaColor = delta === null ? 'inherit'
        : delta > 0 ? '#f59e0b' : '#10b981';

    return (
        <MethodCard $color={config.color} $active={isActive} onClick={onSelect}>
            <div className="header">
                <div className="labels">
                    <span className="sigla">{config.sigla}</span>
                    <span className="nombre">{config.label}</span>
                </div>
                {isActive && <ActiveDot $color={config.color} />}
            </div>

            <div className="valor">
                {isLoading ? (
                    <Skeleton />
                ) : valor !== null ? (
                    <>
                        <span className="currency">$</span>
                        {valor.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </>
                ) : (
                    <span className="na">—</span>
                )}
            </div>

            {delta !== null && (
                <div className="delta" style={{ color: deltaColor }}>
                    <DeltaIcon size={12} />
                    <span>{delta > 0 ? '+' : ''}{delta.toFixed(1)}% vs. Promedio</span>
                </div>
            )}

            <p className="descripcion">{config.descripcion}</p>
        </MethodCard>
    );
};

// ── Panel principal ────────────────────────────────────────────────────────────
export const ValuacionPanel: React.FC = () => {
    const [activeMethod, setActiveMethod] = useState<MetodoValuacion>('promedio');

    const { data: dataPeps,     isLoading: loadingPeps,     refetch: refetchPeps }     = useInventoryValuation('peps');
    const { data: dataUeps,     isLoading: loadingUeps,     refetch: refetchUeps }     = useInventoryValuation('ueps');
    const { data: dataPromedio, isLoading: loadingPromedio, refetch: refetchPromedio } = useInventoryValuation('promedio');

    const valorPeps     = dataPeps?.data?.total_valor     ?? null;
    const valorUeps     = dataUeps?.data?.total_valor     ?? null;
    const valorPromedio = dataPromedio?.data?.total_valor ?? null;

    const calcDelta = (valor: number | null): number | null => {
        if (valor === null || valorPromedio === null || valorPromedio === 0) return null;
        return ((valor - valorPromedio) / valorPromedio) * 100;
    };

    const handleRefetch = () => {
        refetchPeps();
        refetchUeps();
        refetchPromedio();
    };

    // Valor del método activo para el hero
    const heroValor = activeMethod === 'peps' ? valorPeps
        : activeMethod === 'ueps' ? valorUeps
        : valorPromedio;
    const heroConfig = METODOS.find(m => m.key === activeMethod)!;
    const isHeroLoading = activeMethod === 'peps' ? loadingPeps
        : activeMethod === 'ueps' ? loadingUeps
        : loadingPromedio;

    return (
        <PanelWrapper>
            <PanelHeader>
                <div>
                    <h2>Valuación de Inventario</h2>
                    <p>Valor contable según método de costeo. Cada método refleja una realidad contable distinta.</p>
                </div>
                <RefreshBtn onClick={handleRefetch} title="Actualizar valuaciones">
                    <FiRefreshCw size={14} />
                </RefreshBtn>
            </PanelHeader>

            {/* Hero: método seleccionado */}
            <HeroCard $color={heroConfig.color}>
                <div className="label">Valor según {heroConfig.label} ({heroConfig.sigla})</div>
                <div className="amount">
                    {isHeroLoading ? (
                        <HeroSkeleton />
                    ) : heroValor !== null ? (
                        <>$&nbsp;{heroValor.toLocaleString('es', { minimumFractionDigits: 2 })}</>
                    ) : '—'}
                </div>
                <div className="note">
                    <FiInfo size={12} /> {heroConfig.descripcion}
                </div>
            </HeroCard>

            {/* Comparativa de los tres métodos */}
            <ComparisonGrid>
                {METODOS.map(m => (
                    <ValMethodCard
                        key={m.key}
                        config={m}
                        isActive={activeMethod === m.key}
                        valor={m.key === 'peps' ? valorPeps : m.key === 'ueps' ? valorUeps : valorPromedio}
                        isLoading={m.key === 'peps' ? loadingPeps : m.key === 'ueps' ? loadingUeps : loadingPromedio}
                        delta={m.key === 'promedio' ? null : calcDelta(m.key === 'peps' ? valorPeps : valorUeps)}
                        onSelect={() => setActiveMethod(m.key)}
                    />
                ))}
            </ComparisonGrid>

            {/* Leyenda visual de comparación */}
            {valorPeps !== null && valorUeps !== null && valorPromedio !== null && (
                <ComparativeBar>
                    <div className="title">Distribución comparativa</div>
                    <div className="bars">
                        {METODOS.map(m => {
                            const v = m.key === 'peps' ? valorPeps : m.key === 'ueps' ? valorUeps : valorPromedio;
                            const max = Math.max(valorPeps, valorUeps, valorPromedio);
                            const pct = max > 0 ? (v / max) * 100 : 0;
                            return (
                                <div className="bar-row" key={m.key}>
                                    <span className="bar-label">{m.sigla}</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{ width: `${pct}%`, background: m.color }}
                                        />
                                    </div>
                                    <span className="bar-value">
                                        ${v.toLocaleString('es', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </ComparativeBar>
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

const HeroCard = styled.div<{ $color: string }>`
    background: ${({ $color }) => $color}12;
    border: 1px solid ${({ $color }) => $color}30;
    border-radius: 16px;
    padding: 32px 36px;

    .label {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.6;
        margin-bottom: 8px;
    }

    .amount {
        font-size: 2.6rem;
        font-weight: 800;
        color: ${({ $color }) => $color};
        letter-spacing: -0.03em;
        line-height: 1;
        margin-bottom: 12px;
        font-variant-numeric: tabular-nums;
    }

    .note {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        opacity: 0.55;
    }
`;

const HeroSkeleton = styled.div`
    height: 42px;
    width: 240px;
    border-radius: 8px;
    background: rgba(255,255,255,0.08);
    animation: shimmer 1.5s ease infinite;

    @keyframes shimmer {
        0%, 100% { opacity: 0.4; }
        50%       { opacity: 0.8; }
    }
`;

const ComparisonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const MethodCard = styled.div<{ $color: string; $active: boolean }>`
    background: ${({ theme, $active, $color }) =>
        $active ? `${$color}10` : theme.bg};
    border: 1px solid ${({ $active, $color, theme }) =>
        $active ? `${$color}40` : `${theme.bg3}22`};
    border-radius: 14px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;

    &:hover {
        border-color: ${({ $color }) => $color}44;
        background: ${({ $color }) => $color}08;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
    }

    .labels {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .sigla {
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: ${({ $color }) => $color};
        opacity: 0.8;
    }

    .nombre {
        font-size: 1rem;
        font-weight: 700;
        color: ${({ theme }) => theme.text};
    }

    .valor {
        font-size: 1.4rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        color: ${({ theme }) => theme.text};
        margin-bottom: 6px;
        display: flex;
        align-items: baseline;
        gap: 2px;

        .currency {
            font-size: 0.85rem;
            opacity: 0.6;
        }

        .na { opacity: 0.3; }
    }

    .delta {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 10px;
    }

    .descripcion {
        margin: 0;
        font-size: 0.75rem;
        opacity: 0.45;
        line-height: 1.5;
    }
`;

const ActiveDot = styled.div<{ $color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    box-shadow: 0 0 0 3px ${({ $color }) => $color}30;
`;

const Skeleton = styled.div`
    height: 24px;
    width: 100px;
    border-radius: 6px;
    background: rgba(255,255,255,0.08);
    animation: shimmer 1.5s ease infinite;

    @keyframes shimmer {
        0%, 100% { opacity: 0.4; }
        50%       { opacity: 0.8; }
    }
`;

const ComparativeBar = styled.div`
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
        margin-bottom: 16px;
    }

    .bars {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .bar-row {
        display: grid;
        grid-template-columns: 40px 1fr 100px;
        align-items: center;
        gap: 12px;
    }

    .bar-label {
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.6;
    }

    .bar-track {
        height: 8px;
        background: rgba(255,255,255,0.06);
        border-radius: 10px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0.8;
    }

    .bar-value {
        font-size: 0.78rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        text-align: right;
        opacity: 0.7;
    }
`;
