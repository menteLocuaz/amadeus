/**
 * RotacionABCPanel.tsx
 * Visualización del análisis de rotación ABC (Pareto 80/15/5).
 *
 * Firma de diseño: barra Pareto horizontal de "líquido" que muestra la
 * concentración real de valor en A/B/C — no un pie chart genérico.
 * Cada clase tiene su columna de productos con chip de clasificación.
 */

import React, { useMemo, useState } from "react";
import { FiRefreshCw, FiPackage, FiAlertCircle } from "react-icons/fi";
import { useInventoryRotation, useInventoryRotacionDetalle } from "../hooks/usePremiumInventory";
import { ABC_CONFIG, type ClaseABC } from "../constants/abcConfig";
import {
    PanelWrapper, PanelHeader, RefreshBtn,
    ParetoSection, ParetoBar, ParetoSegment, ParetoLegend, LegendItem,
    ClassGrid, ClassColumn, ClassHeader, ClassRule,
    ProductList, ProductRow, ShowMoreBtn, EmptyClass,
    LoaderGrid, CardSkeleton, EmptyState,
} from "./RotacionABCPanel.styles";

// ── Constantes ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;
const CLASES: ClaseABC[] = ['A', 'B', 'C'];

// ── Subcomponente: lista de productos con paginación interna ───────────────────
// Aislado para que showAll de una clase no re-renderice las otras dos.
const ClassProductList: React.FC<{
    ids: string[];
    color: string;
    nombreMap: Map<string, string>;
    rotIndexMap: Map<string, number>;
}> = ({ ids, color, nombreMap, rotIndexMap }) => {
    const [showAll, setShowAll] = useState(false);
    const visibles = showAll ? ids : ids.slice(0, PAGE_SIZE);

    return (
        <ProductList>
            {ids.length === 0 ? (
                <EmptyClass>Sin productos en esta clase</EmptyClass>
            ) : (
                <>
                    {visibles.map(id => {
                        const nombre = nombreMap.get(id) ?? id.slice(0, 8) + '…';
                        const rotIdx = rotIndexMap.get(id);
                        return (
                            <ProductRow key={id} $color={color}>
                                <div className="icon"><FiPackage size={12} /></div>
                                <div className="nombre">{nombre}</div>
                                {rotIdx !== undefined && (
                                    <div className="rotidx" title="Índice de rotación">
                                        {rotIdx.toFixed(1)}×
                                    </div>
                                )}
                            </ProductRow>
                        );
                    })}
                    {ids.length > PAGE_SIZE && (
                        <ShowMoreBtn
                            $color={color}
                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowAll(v => !v); }}
                        >
                            {showAll ? 'Ver menos' : `Ver ${ids.length - PAGE_SIZE} más…`}
                        </ShowMoreBtn>
                    )}
                </>
            )}
        </ProductList>
    );
};

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
    /** Map id_producto → nombre proveniente del caché del padre (evita fetch duplicado) */
    nombreMap: Map<string, string>;
}

// ── Panel principal ────────────────────────────────────────────────────────────
export const RotacionABCPanel: React.FC<Props> = ({ nombreMap }) => {
    const [activeClass, setActiveClass] = useState<ClaseABC | null>(null);

    const { data: rotData, isLoading: loadingRot, refetch: refetchRot } = useInventoryRotation();
    const { data: detData, isLoading: loadingDet, refetch: refetchDet } = useInventoryRotacionDetalle();

    const isLoading = loadingRot || loadingDet;

    // Fusiona nombres del prop con los que traiga detData (si el backend los incluye)
    const resolvedNombreMap = useMemo(() => {
        const map = new Map(nombreMap);
        (detData?.data ?? []).forEach(d => {
            if (d.nombre && !map.has(d.id_producto)) map.set(d.id_producto, d.nombre);
        });
        return map;
    }, [nombreMap, detData]);

    // Mapa de índice de rotación por producto
    const rotIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        (detData?.data ?? []).forEach(d => map.set(d.id_producto, d.indice_rotacion));
        return map;
    }, [detData]);

    const abcData = rotData?.data;

    const { counts, total } = useMemo(() => {
        const c = {
            A: abcData?.A?.length ?? 0,
            B: abcData?.B?.length ?? 0,
            C: abcData?.C?.length ?? 0,
        };
        return { counts: c, total: c.A + c.B + c.C };
    }, [abcData]);

    // Porcentaje real — parseFloat+toFixed evita 99% por redondeo acumulado
    const realPct = (c: ClaseABC) =>
        total > 0 ? parseFloat(((counts[c] / total) * 100).toFixed(1)) : 0;

    const handleRefetch = () => { refetchRot(); refetchDet(); };

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
                        {CLASES.map(c => {
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
                        {CLASES.map(c => (
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
                    {CLASES.map(c => {
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
                                <ClassHeader $color={cfg.color}>
                                    <div className="badge">{c}</div>
                                    <div className="info">
                                        <div className="label">{cfg.label}</div>
                                        <div className="desc">{cfg.descripcion}</div>
                                    </div>
                                    <div className="count">{ids.length}</div>
                                </ClassHeader>

                                <ClassRule $color={cfg.color}>{cfg.regla}</ClassRule>

                                <ClassProductList
                                    ids={ids}
                                    color={cfg.color}
                                    nombreMap={resolvedNombreMap}
                                    rotIndexMap={rotIndexMap}
                                />
                            </ClassColumn>
                        );
                    })}
                </ClassGrid>
            )}
        </PanelWrapper>
    );
};
