import React, { memo } from "react";
import styled from "styled-components";
import { FiMonitor, FiMapPin, FiActivity } from "react-icons/fi";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.bg};
  border-radius: 16px; padding: 24px;
  display: flex; align-items: center; gap: 20px;
  border: 1px solid ${({ theme }) => theme.bg3}44;
  position: relative; overflow: hidden;
  &::after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 4px;
    background: ${({ $color }) => $color}; opacity: 0.6;
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 54px; height: 54px; border-radius: 14px;
  background: ${({ $color }) => $color}15; color: ${({ $color }) => $color};
  display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
`;

const StatContent = styled.div`
  h3 { margin: 0; font-size: 1.8rem; font-weight: 800; line-height: 1; }
  p { margin: 4px 0 0; font-size: 0.82rem; opacity: 0.6; font-weight: 600; }
`;

interface EstacionStatsProps {
    total: number;
    sucursalesCount: number;
    activas: number;
}

const EstacionStats: React.FC<EstacionStatsProps> = memo(({ total, sucursalesCount, activas }) => {
    return (
        <StatsGrid>
            <StatCard $color="#FCA311">
                <StatIcon $color="#FCA311"><FiMonitor /></StatIcon>
                <StatContent>
                    <h3>{total}</h3>
                    <p>Total Terminales</p>
                </StatContent>
            </StatCard>
            <StatCard $color="#3B82F6">
                <StatIcon $color="#3B82F6"><FiMapPin /></StatIcon>
                <StatContent>
                    <h3>{sucursalesCount}</h3>
                    <p>Sucursales Cubiertas</p>
                </StatContent>
            </StatCard>
            <StatCard $color="#10B981">
                <StatIcon $color="#10B981"><FiActivity /></StatIcon>
                <StatContent>
                    <h3>{activas}</h3>
                    <p>Estaciones Activas</p>
                </StatContent>
            </StatCard>
        </StatsGrid>
    );
});

export default EstacionStats;
