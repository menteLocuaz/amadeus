import React from 'react';
import styled from 'styled-components';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export type StockLevel = "critico" | "reabastecer" | "optimo" | "sobrestock";

interface Props {
    actual: number;
    min: number;
    max: number;
    unit?: string;
}

export const getStockLevel = (actual: number, min: number, max: number): StockLevel => {
    if (actual > max) return "sobrestock";
    if (actual <= min) return "critico";
    if (actual <= min * 1.1) return "reabastecer";
    return "optimo";
};

const LEVEL_CONFIG: Record<StockLevel, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    critico: { label: "Crítico", color: "#EF4444", bg: "#EF444418", Icon: FiAlertCircle },
    reabastecer: { label: "Reabastecer", color: "#FCA311", bg: "#FCA31118", Icon: FiAlertTriangle },
    optimo: { label: "Óptimo", color: "#10B981", bg: "#10B98118", Icon: FiCheckCircle },
    sobrestock: { label: "Sobre-stock", color: "#3B82F6", bg: "#3B82F618", Icon: FiTrendingUp },
};

const Container = styled.div`
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Badge = styled.span<{ $level: StockLevel }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  width: fit-content;
  background: ${({ $level }) => LEVEL_CONFIG[$level].bg};
  color:      ${({ $level }) => LEVEL_CONFIG[$level].color};
`;

const ProgressBar = styled.div<{ $pct: number; $level: StockLevel }>`
  width: 100%;
  height: 6px;
  border-radius: 99px;
  background: rgba(0,0,0,0.07);
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => Math.min($pct, 100)}%;
    border-radius: 99px;
    background: ${({ $level }) => LEVEL_CONFIG[$level].color};
    transition: width 0.4s ease;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  .actual { font-weight: 800; font-size: 1rem; }
  .limits { font-size: 0.75rem; opacity: 0.5; font-weight: 600; }
`;

export const StockIndicator: React.FC<Props> = ({ actual, min, max, unit }) => {
    const level = getStockLevel(actual, min, max);
    const cfg = LEVEL_CONFIG[level];
    const Icon = cfg.Icon;
    const pct = max > 0 ? (actual / max) * 100 : 0;

    return (
        <Container>
            <InfoRow>
                <span className="actual" style={{ color: cfg.color }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{actual}</span>
                    <small style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.7, marginLeft: 4 }}>{unit}</small>
                </span>
                <span className="limits">Min: {min} / Max: {max}</span>
            </InfoRow>
            <ProgressBar $pct={pct} $level={level} />
            <Badge $level={level}>
                <Icon size={12} />
                {cfg.label}
            </Badge>
        </Container>
    );
};
