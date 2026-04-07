import styled, { keyframes, css } from "styled-components";
import { USER_COLORS as C } from "../constants/usuarios";

// --- Sentinel Keyframes ---
export const fadeIn = keyframes`
  from { opacity: 0; filter: blur(4px); transform: translateY(12px); } 
  to { opacity: 1; filter: blur(0); transform: translateY(0); }
`;

export const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const scanline = keyframes`
  0% { transform: translateY(-100%); opacity: 0.1; }
  50% { opacity: 0.5; }
  100% { transform: translateY(100%); opacity: 0.1; }
`;

// --- Layout Principal ---
export const ContentWrapper = styled.div`
  animation: ${fadeIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
`;

export const MainCard = styled.div`
  background: ${C.surface}E6; 
  border: 1px solid ${C.border}66; 
  border-radius: 12px;
  backdrop-filter: blur(20px);
  box-shadow: 0 40px 100px rgba(0,0,0,0.4); 
  overflow: hidden; 
  position: relative;

  &::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, ${C.accent}, transparent);
    opacity: 0.5;
  }
`;

export const LoaderWrap = styled.div`
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-height: 70vh;
  font-family: 'JetBrains Mono', monospace;
  p { 
    margin-top: 30px; 
    font-weight: 700; 
    color: ${C.accent}; 
    letter-spacing: 4px; 
    text-transform: uppercase; 
    font-size: 11px; 
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
`;

// --- Botones de Acción (Sentinel Style) ---
export const ActionBtn = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px; 
  border-radius: 4px; 
  border: 1px solid transparent; 
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700; 
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  
  ${props => props.$variant === 'primary' ? css`
    background: ${C.accent}; 
    color: white;
    border-color: ${C.accent};
    &:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 0 20px ${C.accent}66;
      filter: brightness(1.1);
    }
  ` : props.$variant === 'danger' ? css`
    background: transparent; color: ${C.danger}; border-color: ${C.danger}40;
    &:hover { background: ${C.danger}; color: white; border-color: ${C.danger}; }
  ` : css`
    background: ${C.surface2}80; color: ${C.text}; border-color: ${C.border};
    &:hover { background: ${C.accent}15; border-color: ${C.accent}80; color: ${C.accent}; }
  `}
  
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

// --- Estilos de Estadísticas ---
export const StatsGrid = styled.div`
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px; 
  margin-bottom: 40px;
`;

export const StatCard = styled.div<{ $color: string }>`
  background: ${C.surface}CC; 
  border: 1px solid ${C.border}44; 
  border-radius: 8px;
  padding: 24px; 
  display: flex; 
  align-items: center; 
  gap: 24px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative; 
  overflow: hidden;
  
  &::after {
    content: ''; position: absolute; bottom: 0; right: 0; width: 60px; height: 60px;
    background: ${props => props.$color}05; border-radius: 50%; transform: translate(30%, 30%);
  }
  
  &:hover { 
    transform: translateY(-8px); 
    border-color: ${props => props.$color}88; 
    background: ${C.surface}FF;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }
  
  .icon-box {
    width: 60px; height: 60px; border-radius: 12px; background: ${C.bg};
    color: ${props => props.$color}; display: flex; align-items: center; justify-content: center; 
    font-size: 26px; border: 1px solid ${props => props.$color}33;
    transition: all 0.3s ease;
  }
  
  &:hover .icon-box { background: ${props => props.$color}; color: white; border-color: ${props => props.$color}; }
  
  .info {
    display: flex; flex-direction: column;
    .value { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 800; color: ${C.text}; line-height: 1; }
    .label { font-size: 11px; color: ${C.textMuted}; font-weight: 700; text-transform: uppercase; margin-top: 8px; letter-spacing: 2px; }
  }
`;

// --- Estilos de Filtros ---
export const FilterToolbar = styled.div`
  padding: 24px 32px; 
  border-bottom: 1px solid ${C.border}44; 
  background: ${C.surface2}20;
  display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between;
`;

export const SearchBox = styled.div`
  position: relative; flex: 1; min-width: 320px;
  input {
    width: 100%; background: ${C.bg}; border: 1px solid ${C.border};
    border-radius: 8px; padding: 14px 16px 14px 48px; color: ${C.text};
    font-size: 14px; outline: none; transition: all 0.3s;
    font-family: 'Inter', sans-serif;
    &::placeholder { color: ${C.textMuted}88; }
    &:focus { border-color: ${C.accent}; box-shadow: 0 0 0 4px ${C.accent}20; }
  }
  svg { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: ${C.accent}; font-size: 20px; }
`;

export const FilterSelects = styled.div`display: flex; gap: 16px; flex-wrap: wrap;`;

export const StyledSelect = styled.select`
  background: ${C.bg}; border: 1px solid ${C.border}; border-radius: 8px;
  padding: 12px 20px; color: ${C.text}; font-size: 13px; font-weight: 600; outline: none;
  cursor: pointer; transition: all 0.3s;
  &:hover { border-color: ${C.accent}80; }
  &:focus { border-color: ${C.accent}; }
`;

// --- Estilos de Tabla ---
export const TableContainer = styled.div`overflow-x: auto;`;
export const Table = styled.table`
  width: 100%; border-collapse: collapse; min-width: 1100px;
  th {
    padding: 20px 32px; background: ${C.surface2}40; text-align: left;
    color: ${C.textMuted}; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 2px; border-bottom: 2px solid ${C.border}66;
  }
  td { padding: 20px 32px; border-bottom: 1px solid ${C.border}22; vertical-align: middle; }
  tbody tr { transition: all 0.2s; }
  tbody tr:hover { background: ${C.accent}08; }
`;

export const UserInfo = styled.div`
  display: flex; align-items: center; gap: 16px;
  .avatar {
    width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center;
    justify-content: center; color: white; font-weight: 700; font-size: 16px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .text {
    display: flex; flex-direction: column; gap: 4px;
    .name { color: ${C.text}; font-weight: 700; font-size: 15px; letter-spacing: -0.2px; }
    .sub { font-family: 'JetBrains Mono', monospace; color: ${C.textMuted}; font-size: 11px; text-transform: uppercase; }
  }
`;

export const Badge = styled.span<{ $bg: string; $color: string }>`
  padding: 6px 14px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1px; background: ${props => props.$bg};
  color: ${props => props.$color}; display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid ${props => props.$color}40;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 8px currentColor; }
`;

// --- Estilos de Formulario ---
export const FormGrid = styled.div`
  display: grid; grid-template-columns: 1fr 380px; gap: 40px; padding: 40px;
  @media (max-width: 1200px) { grid-template-columns: 1fr; }
`;

export const Section = styled.div`
  background: ${C.bg}66; border: 1px solid ${C.border}44; border-radius: 12px;
  padding: 32px; margin-bottom: 32px;
  .title { 
    font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: ${C.text}; 
    margin-bottom: 24px; display: flex; align-items: center; gap: 12px;
    &::after { content: ''; flex: 1; height: 1px; background: ${C.border}; }
  }
`;

export const InputGroup = styled.div<{ $error?: boolean }>`
  margin-bottom: 24px;
  label { 
    display: flex; align-items: center; gap: 8px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; 
    color: ${C.textMuted}; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px;
  }
  .input-wrap {
    position: relative;
    input, select {
      width: 100%; background: ${C.bg}; border: 1px solid ${props => props.$error ? C.danger : C.border};
      border-radius: 8px; padding: 14px 18px; color: ${C.text}; font-size: 14px; outline: none;
      transition: all 0.3s;
      &:focus { border-color: ${C.accent}; background: ${C.bg}; box-shadow: 0 0 20px ${C.accent}15; }
    }
    .suffix { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: ${C.textMuted}; }
  }
  .err { 
    color: ${C.danger}; font-family: 'JetBrains Mono', monospace; font-size: 10px; 
    font-weight: 600; margin-top: 8px; display: flex; align-items: center; gap: 6px; 
  }
`;

export const PreviewCard = styled.div`
  background: ${C.surface}E6; border: 1px solid ${C.border}66; border-radius: 16px;
  padding: 40px; text-align: center; position: sticky; top: 40px;
  .avatar-big {
    width: 120px; height: 120px; border-radius: 16px; margin: 0 auto 24px;
    display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 800; color: white;
    border: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  }
  h3 { font-family: 'Space Grotesk', sans-serif; font-size: 26px; font-weight: 800; color: ${C.text}; margin: 0; }
  .role-tag {
    display: inline-block; margin-top: 12px; padding: 6px 16px; border-radius: 100px;
    background: ${C.accent}20; color: ${C.accent}; font-family: 'JetBrains Mono', monospace;
    font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
  }
  .divider { height: 1px; background: ${C.border}44; margin: 24px 0; }
  .detail {
    display: flex; justify-content: space-between; margin-bottom: 12px;
    span:first-child { color: ${C.textMuted}; font-size: 12px; font-weight: 600; }
    span:last-child { color: ${C.text}; font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  }
`;
