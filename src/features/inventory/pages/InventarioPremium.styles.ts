import styled from "styled-components";

export const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

export const StatCard = styled.div<{ $color: string }>`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}11;
    padding: 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.04);
        border-color: ${props => props.$color}44;
    }

    .icon {
        width: 52px; height: 52px;
        border-radius: 10px;
        background: ${props => props.$color}15;
        color: ${props => props.$color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
    }

    h3 { font-size: 1.75rem; margin: 0; font-weight: 800; color: ${({ theme }) => theme.text}; }
    p { margin: 4px 0 0; opacity: 0.5; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
`;

export const FilterRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 8px 0;
`;

export const FilterChip = styled.button<{ $active: boolean }>`
    padding: 8px 20px;
    border-radius: 100px;
    border: 1px solid ${props => props.$active ? props.theme.primary : props.theme.bg3 + '22'};
    background: ${props => props.$active ? props.theme.primary + '15' : 'transparent'};
    color: ${props => props.$active ? props.theme.primary : props.theme.textsecondary};
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 700;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        border-color: ${props => props.theme.primary};
        background: ${props => props.theme.primary}08;
    }
`;

export const ValMethodBtn = styled.button<{ $active: boolean }>`
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid ${props => props.$active ? '#10b981' : props.theme.bg3 + '22'};
    background: ${props => props.$active ? '#10b98115' : 'transparent'};
    color: ${props => props.$active ? '#10b981' : props.theme.texttertiary};
    cursor: pointer;
    font-size: 0.65rem;
    font-weight: 800;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &:hover {
        background: #10b98110;
    }
`;

export const StockContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
    width: 140px;
    margin-left: auto;

    .label {
        font-weight: 800;
        font-size: 1rem;
        display: flex;
        align-items: baseline;
        gap: 4px;
        
        .ok { color: #10b981; }
        .low { color: #f59e0b; }
        .out { color: #ef4444; }
        
        small { font-size: 0.7rem; opacity: 0.5; font-weight: 700; text-transform: uppercase; }
    }
`;

export const ProgressBar = styled.div`
    width: 100%;
    height: 4px;
    background: ${({ theme }) => theme.bg2}44;
    border-radius: 10px;
    overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number, $status: 'success' | 'warning' | 'critical' }>`
    width: ${props => props.$percent}%;
    height: 100%;
    background: ${props => 
        props.$status === 'critical' ? '#ef4444' : 
        props.$status === 'warning' ? '#f59e0b' : '#10b981'};
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const LoaderContainer = styled.div`
    padding: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    opacity: 0.8;
`;
