// ─── Estatus Feature — EstatusStats ───────────────────────────────────────────
// Fila de tarjetas de resumen: muestra cuántos estatus hay de cada tipo.
// Responsabilidad única: renderizar stats, no conoce APIs ni estado global.

import React from "react";
import styled from "styled-components";
import { getTipoColor } from "../constants";

// ─── Styled ────────────────────────────────────────────────────────────────────

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px;
    margin-bottom: 28px;
`;

const StatCard = styled.div<{ $color: string }>`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ $color }) => $color}33;
    border-left: 4px solid ${({ $color }) => $color};
    border-radius: 14px;
    padding: 16px 20px;
    h3 { margin: 0; font-size: 1.8rem; font-weight: 900; color: ${({ $color }) => $color}; }
    p  { margin: 4px 0 0; font-size: 0.78rem; opacity: 0.6; text-transform: uppercase; }
`;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface EstatusStatsProps {
    /** Pares [tipo, cantidad] ya ordenados por el hook */
    stats: [string, number][];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const EstatusStats: React.FC<EstatusStatsProps> = ({ stats }) => {
    if (stats.length === 0) return null;

    return (
        <StatsRow>
            {stats.map(([tipo, count]) => (
                <StatCard key={tipo} $color={getTipoColor(tipo)}>
                    <h3>{count}</h3>
                    <p>{tipo}</p>
                </StatCard>
            ))}
        </StatsRow>
    );
};