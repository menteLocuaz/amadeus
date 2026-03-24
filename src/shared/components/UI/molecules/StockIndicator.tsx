import React from 'react';
import styled, { useTheme } from 'styled-components';
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

const LEVEL_CONFIG = (theme: any): Record<StockLevel, { label: string; color: string; bg: string; Icon: React.ElementType }> => ({
    critico: { label: "Crítico", color: theme.danger, bg: `${theme.danger}18`, Icon: FiAlertCircle },
    reabastecer: { label: "Reabastecer", color: theme.warning, bg: `${theme.warning}18`, Icon: FiAlertTriangle },
    optimo: { label: "Óptimo", color: theme.success, bg: `${theme.success}18`, Icon: FiCheckCircle },
    sobrestock: { label: "Sobre-stock", color: theme.info, bg: `${theme.info}18`, Icon: FiTrendingUp },
});

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
  background: ${({ $level, theme }) => LEVEL_CONFIG(theme)[$level].bg};
  color:      ${({ $level, theme }) => LEVEL_CONFIG(theme)[$level].color};
`;

const ProgressBar = styled.div<{ $pct: number; $level: StockLevel }>`
  width: 100%;
  height: 6px;
  border-radius: 99px;
  background: ${({ theme }) => theme.bg2};
  opacity: 0.8;
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => Math.min($pct, 100)}%;
    border-radius: 99px;
    background: ${({ $level, theme }) => LEVEL_CONFIG(theme)[$level].color};
    transition: width 0.4s ease;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  .actual { font-weight: 800; font-size: 1rem; }
  .limits { font-size: 0.75rem; opacity: 0.5; font-weight: 600; color: ${({ theme }) => theme.text}; }
`;

export const StockIndicator: React.FC<Props> = ({ actual, min, max, unit }) => {
    const theme = useTheme();
    const level = getStockLevel(actual, min, max);
    const cfg = LEVEL_CONFIG(theme)[level];
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
