import styled from "styled-components";

export const PanelWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

export const PanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    p  { margin: 4px 0 0; opacity: 0.5; font-size: 0.82rem; }
`;

export const RefreshBtn = styled.button`
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

export const ParetoSection = styled.div`
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
        margin-bottom: 14px;
    }
`;

export const ParetoBar = styled.div`
    display: flex;
    height: 36px;
    border-radius: 10px;
    overflow: hidden;
    gap: 2px;
    margin-bottom: 12px;
`;

export const ParetoSegment = styled.div<{ $color: string; $pct: number; $active: boolean }>`
    flex: ${({ $pct }) => $pct};
    background: ${({ $color, $active }) => $active ? $color : `${$color}80`};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: flex 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease;
    min-width: 0;
    border-radius: 6px;

    span {
        font-size: 0.7rem;
        font-weight: 800;
        color: white;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        letter-spacing: 0.04em;
    }

    &:hover {
        background: ${({ $color }) => $color};
        flex: ${({ $pct }) => Math.max($pct + 2, $pct * 1.1)};
    }
`;

export const ParetoLegend = styled.div`
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
`;

export const LegendItem = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 6px;

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${({ $color }) => $color};
        flex-shrink: 0;
    }

    span {
        font-size: 0.75rem;
        opacity: 0.65;
        font-weight: 500;
    }
`;

export const ClassGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    align-items: start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

export const ClassColumn = styled.div<{
    $color: string; $bgColor: string; $borderColor: string; $dimmed: boolean;
}>`
    background: ${({ $bgColor }) => $bgColor};
    border: 1px solid ${({ $borderColor }) => $borderColor};
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    opacity: ${({ $dimmed }) => $dimmed ? 0.35 : 1};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        opacity: 1;
    }
`;

export const ClassHeader = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid ${({ $color }) => $color}20;

    .badge {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: ${({ $color }) => $color}25;
        color: ${({ $color }) => $color};
        font-size: 1.1rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .info { flex: 1; min-width: 0; }

    .label {
        font-size: 0.85rem;
        font-weight: 700;
        color: ${({ $color }) => $color};
    }

    .desc {
        font-size: 0.72rem;
        opacity: 0.55;
        margin-top: 2px;
    }

    .count {
        font-size: 1.4rem;
        font-weight: 900;
        color: ${({ $color }) => $color};
        opacity: 0.7;
        font-variant-numeric: tabular-nums;
    }
`;

export const ClassRule = styled.div<{ $color: string }>`
    padding: 8px 20px;
    font-size: 0.72rem;
    color: ${({ $color }) => $color};
    opacity: 0.75;
    font-weight: 600;
    border-bottom: 1px solid ${({ $color }) => $color}15;
`;

export const ProductList = styled.div`
    max-height: 320px;
    overflow-y: auto;
    padding: 8px 0;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-thumb {
        background: rgba(150,150,150,0.2);
        border-radius: 3px;
    }
`;

export const ProductRow = styled.div<{ $color: string }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 20px;
    transition: background 0.12s ease;

    &:hover { background: ${({ $color }) => $color}08; }

    .icon {
        color: ${({ $color }) => $color};
        opacity: 0.5;
        flex-shrink: 0;
        display: flex;
    }

    .nombre {
        flex: 1;
        font-size: 0.8rem;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        opacity: 0.8;
    }

    .rotidx {
        font-size: 0.7rem;
        font-weight: 700;
        color: ${({ $color }) => $color};
        opacity: 0.65;
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
    }
`;

export const ShowMoreBtn = styled.button<{ $color: string }>`
    display: block;
    width: 100%;
    padding: 8px 20px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${({ $color }) => $color};
    opacity: 0.6;
    text-align: left;
    transition: opacity 0.12s ease;

    &:hover { opacity: 1; }
`;

export const EmptyClass = styled.div`
    padding: 20px;
    font-size: 0.78rem;
    opacity: 0.35;
    text-align: center;
`;

export const LoaderGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
`;

export const CardSkeleton = styled.div`
    height: 300px;
    border-radius: 14px;
    background: rgba(255,255,255,0.04);
    animation: shimmer 1.5s ease infinite;

    @keyframes shimmer {
        0%, 100% { opacity: 0.4; }
        50%       { opacity: 0.7; }
    }
`;

export const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    opacity: 0.4;

    p { margin: 0; font-size: 0.85rem; }
`;
