import styled from "styled-components";

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

export const StatCard = styled.div<{ $color: string }>`
    background: ${({ theme }) => theme.bgCard || "#1a1a1a"};
    border: 1px solid rgba(255,255,255,0.05);
    padding: 24px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 15px;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 4px; height: 100%;
        background: ${props => props.$color};
    }

    .icon {
        width: 48px; height: 48px;
        border-radius: 12px;
        background: ${props => props.$color}11;
        color: ${props => props.$color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }

    h3 { font-size: 1.8rem; margin: 0; }
    p { margin: 0; opacity: 0.6; font-size: 0.9rem; font-weight: 500; }
`;

export const FilterRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

export const FilterChip = styled.button<{ $active: boolean }>`
    padding: 8px 16px;
    border-radius: 30px;
    border: 1px solid ${props => props.$active ? props.theme.primary : 'rgba(255,255,255,0.1)'};
    background: ${props => props.$active ? props.theme.primary + '22' : 'transparent'};
    color: ${props => props.$active ? props.theme.primary : 'inherit'};
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: 0.2s;

    &:hover {
        background: rgba(255,255,255,0.05);
    }
`;

export const ValMethodBtn = styled.button<{ $active: boolean }>`
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid ${props => props.$active ? '#10b981' : 'rgba(255,255,255,0.1)'};
    background: ${props => props.$active ? '#10b98122' : 'transparent'};
    color: ${props => props.$active ? '#10b981' : 'inherit'};
    cursor: pointer;
    font-size: 0.6rem;
    font-weight: 700;
    transition: 0.2s;
    opacity: ${props => props.$active ? 1 : 0.5};

    &:hover {
        opacity: 1;
        background: rgba(255,255,255,0.05);
    }
`;

export const StockContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-end;
    width: 150px;
    margin-left: auto;

    .label {
        font-weight: 800;
        font-size: 0.95rem;
        
        .ok { color: #10b981; }
        .low { color: #f59e0b; }
        .out { color: #ef4444; }
    }
`;

export const ProgressBar = styled.div`
    width: 100%;
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number, $status: 'success' | 'warning' | 'critical' }>`
    width: ${props => props.$percent}%;
    height: 100%;
    background: ${props => 
        props.$status === 'critical' ? '#ef4444' : 
        props.$status === 'warning' ? '#f59e0b' : '#10b981'};
    transition: width 1s ease;
`;

export const LoaderContainer = styled.div`
    padding: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    opacity: 0.8;
`;
