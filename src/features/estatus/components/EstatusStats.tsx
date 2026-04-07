// ─── Estatus Feature — EstatusStats ───────────────────────────────────────────
// Fila de tarjetas de resumen: muestra cuántos estatus hay de cada tipo.
// Responsabilidad única: renderizar stats, no conoce APIs ni estado global.

import React from "react";
import styled from "styled-components";
import { getTipoColor } from "../constants";

// ─── Styled ────────────────────────────────────────────────────────────────────

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
`;

const StatCard = styled.div<{ $color: string }>`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}11;
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.04);
        border-color: ${props => props.$color}44;
    }

    h3 { 
        margin: 0; 
        font-size: 2rem; 
        font-weight: 800; 
        color: ${({ $color }) => $color}; 
        line-height: 1;
    }
    p { 
        margin: 8px 0 0; 
        font-size: 0.7rem; 
        opacity: 0.5; 
        font-weight: 700;
        text-transform: uppercase; 
        letter-spacing: 0.1em;
    }
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