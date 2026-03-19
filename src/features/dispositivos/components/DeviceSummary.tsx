import React from "react";
import styled from "styled-components";

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
`;

const SummaryCard = styled.div<{ $accent: string }>`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ $accent }) => $accent}33;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: box-shadow 0.2s;
    &:hover { box-shadow: 0 4px 16px ${({ $accent }) => $accent}22; }
`;

const SummaryIcon = styled.div<{ $color: string }>`
    width: 48px; height: 48px;
    border-radius: 12px;
    background: ${({ $color }) => $color}15;
    color: ${({ $color }) => $color};
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; flex-shrink: 0;
`;

const SummaryInfo = styled.div`
    h3 { margin: 0; font-size: 1.6rem; font-weight: 900; }
    p  { margin: 2px 0 0; font-size: 0.78rem; opacity: 0.6; }
`;

interface StatItem {
    tipo: string;
    label: string;
    count: number;
    online: number;
    color: string;
    Icon: React.ElementType;
}

interface DeviceSummaryProps {
    stats: StatItem[];
}

const DeviceSummary: React.FC<DeviceSummaryProps> = ({ stats }) => {
    return (
        <SummaryGrid>
            {stats.map(s => (
                <SummaryCard key={s.tipo} $accent={s.color}>
                    <SummaryIcon $color={s.color}><s.Icon /></SummaryIcon>
                    <SummaryInfo>
                        <h3>{s.count}</h3>
                        <p>{s.label}{s.count !== 1 && "s"} · {s.online} en línea</p>
                    </SummaryInfo>
                </SummaryCard>
            ))}
        </SummaryGrid>
    );
};

export default DeviceSummary;
