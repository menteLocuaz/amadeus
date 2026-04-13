import styled, { keyframes } from "styled-components";
import { HeaderTitle } from "../../../shared/components/UI";

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Signature: left-edge stock-health accent stripe via inset box-shadow.
// Green = disponible, amber = bajo, red = agotado — readable at a glance like shelf tabs.
export const StaggeredRow = styled.tr<{ $index?: number; $accent?: string }>`
  animation: ${fadeInUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${({ $index }) => ($index || 0) * 0.04}s;
  opacity: 0;
  transition: background 0.15s ease, box-shadow 0.15s ease;
  box-shadow: inset 3px 0 0 ${({ $accent }) => $accent || 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.primary}0A !important;
    box-shadow: inset 4px 0 0 ${({ $accent, theme }) => $accent || theme.primary};
  }

  /* Actions revealed on row hover only — reduces visual noise at rest */
  .row-actions {
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  &:hover .row-actions {
    opacity: 1;
  }
`;

export const BoldHeader = styled(HeaderTitle)`
  h1 {
    font-family: 'Outfit', 'Space Grotesk', system-ui, sans-serif;
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    display: flex;
    align-items: center;
    gap: 12px;
    color: ${({ theme }) => theme.text};
  }
  p {
    font-weight: 500;
    opacity: 0.5;
    margin-top: 6px;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
`;

// Stats strip — 4-column grid showing inventory health at a glance
export const StatsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StatItem = styled.div<{ $accent?: string }>`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}2A;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $accent }) => $accent || 'transparent'};
    opacity: 0.7;
  }
`;

export const StatValue = styled.div`
  font-family: 'JetBrains Mono', 'Space Mono', monospace;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.03em;
  line-height: 1;
`;

export const StatLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.45;
  margin-top: 2px;
`;

// Mini stock health bar — communicates fill level without extra labels
export const StockBar = styled.div<{ $percent: number; $color: string }>`
  width: 56px;
  height: 3px;
  background: ${({ $color }) => $color}22;
  border-radius: 2px;
  margin-top: 5px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${({ $percent }) => $percent}%;
    height: 100%;
    background: ${({ $color }) => $color};
    border-radius: 2px;
  }
`;
