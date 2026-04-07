import styled from "styled-components";
import { TableCard } from "../../../shared/components/UI";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, trend, color }) => {
  return (
    <Card $borderColor={color}>
      <div className="icon-container" style={{ background: color ? `${color}15` : undefined, color }}>
        {icon}
      </div>
      <div className="content">
        <span className="label">{label}</span>
        <h3 className="value">{value}</h3>
        {trend && (
          <span className={`trend ${trend.isPositive ? "positive" : "negative"}`}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>
    </Card>
  );
};

const Card = styled(TableCard)<{ $borderColor?: string }>`
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-left: 4px solid ${props => props.$borderColor || props.theme.primary};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  .icon-container {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: ${({ theme }) => theme.primary}15;
    color: ${({ theme }) => theme.primary};
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ theme }) => theme.textsecondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    color: ${({ theme }) => theme.text};
  }

  .trend {
    font-size: 0.8rem;
    font-weight: 700;
    
    &.positive { color: ${({ theme }) => theme.success}; }
    &.negative { color: ${({ theme }) => theme.danger}; }
  }
`;
