import styled, { keyframes, css } from "styled-components";
import { USER_COLORS as C } from "../constants/usuarios";

// --- Animaciones ---
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); }
`;

export const scaleIn = keyframes`
  from { transform: scale(0.95); opacity: 0; } 
  to { transform: scale(1); opacity: 1; }
`;

// --- Layout Principal ---
export const ContentWrapper = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
`;

export const MainCard = styled.div`
  background: ${C.surface}; 
  border: 1px solid ${C.border}; 
  border-radius: 24px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2); 
  overflow: hidden; 
  animation: ${scaleIn} 0.5s ease-out;
`;

export const LoaderWrap = styled.div`
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-height: 70vh;
  p { 
    margin-top: 30px; 
    font-weight: 800; 
    color: ${C.text}; 
    letter-spacing: 2px; 
    text-transform: uppercase; 
    font-size: 13px; 
  }
`;

// --- Botones de Acción ---
export const ActionBtn = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px; 
  border-radius: 14px; 
  border: none; 
  font-weight: 700; 
  font-size: 14px;
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  transition: all 0.3s;
  
  ${props => props.$variant === 'primary' ? css`
    background: linear-gradient(135deg, ${C.accent}, #a855f7); 
    color: white;
    box-shadow: 0 8px 20px rgba(124,58,237,0.3);
    &:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(124,58,237,0.4); }
  ` : props.$variant === 'danger' ? css`
    background: ${C.danger}15; color: ${C.danger}; border: 1px solid ${C.danger}30;
    &:hover { background: ${C.danger}; color: white; }
  ` : css`
    background: ${C.surface2}; color: ${C.text}; border: 1px solid ${C.border};
    &:hover { background: ${C.border}; }
  `}
  
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

// --- Estilos de Estadísticas ---
export const StatsGrid = styled.div`
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px; 
  margin-bottom: 32px;
`;

export const StatCard = styled.div<{ $color: string }>`
  background: ${C.surface}; 
  border: 1px solid ${C.border}; 
  border-radius: 20px;
  padding: 24px; 
  display: flex; 
  align-items: center; 
  gap: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; 
  overflow: hidden;
  
  &::before {
    content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
    background: ${props => props.$color}; opacity: 0.8;
  }
  
  &:hover { transform: translateY(-5px); border-color: ${props => props.$color}50; box-shadow: 0 15px 35px rgba(0,0,0,0.3); }
  
  .icon-box {
    width: 54px; height: 54px; border-radius: 14px; background: ${props => props.$color}15;
    color: ${props => props.$color}; display: flex; align-items: center; justify-content: center; font-size: 24px;
  }
  
  .info {
    display: flex; flex-direction: column;
    .value { font-size: 28px; font-weight: 800; color: ${C.text}; line-height: 1; }
    .label { font-size: 12px; color: ${C.textMuted}; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.5px; }
  }
`;

// --- Estilos de Filtros ---
export const FilterToolbar = styled.div`
  padding: 24px; border-bottom: 1px solid ${C.border}; background: ${C.surface}80;
  display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;
`;

export const SearchBox = styled.div`
  position: relative; flex: 1; min-width: 300px;
  input {
    width: 100%; background: ${C.surface2}; border: 1px solid ${C.border};
    border-radius: 14px; padding: 12px 16px 12px 42px; color: ${C.text};
    font-size: 14px; outline: none; transition: all 0.2s;
    &:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px ${C.accentSoft}; background: ${C.surface}; }
  }
  svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${C.textMuted}; font-size: 18px; }
`;

export const FilterSelects = styled.div`display: flex; gap: 12px; flex-wrap: wrap;`;

export const StyledSelect = styled.select`
  background: ${C.surface2}; border: 1px solid ${C.border}; border-radius: 12px;
  padding: 10px 16px; color: ${C.text}; font-size: 13px; font-weight: 600; outline: none;
  cursor: pointer; transition: all 0.2s;
  &:hover { border-color: ${C.accent}80; }
  &:focus { border-color: ${C.accent}; }
`;

// --- Estilos de Tabla ---
export const TableContainer = styled.div`overflow-x: auto;`;
export const Table = styled.table`
  width: 100%; border-collapse: collapse; min-width: 1000px;
  th {
    padding: 18px 24px; background: ${C.surface2}50; text-align: left;
    color: ${C.textMuted}; font-size: 11px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 1px; border-bottom: 2px solid ${C.border};
  }
  td { padding: 16px 24px; border-bottom: 1px solid ${C.border}; vertical-align: middle; }
  tbody tr:hover { background: rgba(124,58,237, 0.04); }
`;

export const UserInfo = styled.div`
  display: flex; align-items: center; gap: 14px;
  .avatar {
    width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center;
    justify-content: center; color: white; font-weight: 700; font-size: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .text {
    display: flex; flex-direction: column;
    .name { color: ${C.text}; font-weight: 700; font-size: 14px; }
    .sub { color: ${C.textMuted}; font-size: 12px; }
  }
`;

export const Badge = styled.span<{ $bg: string; $color: string }>`
  padding: 5px 12px; border-radius: 12px; font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.5px; background: ${props => props.$bg};
  color: ${props => props.$color}; display: inline-flex; align-items: center; gap: 6px;
  .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
`;

// --- Estilos de Formulario ---
export const FormGrid = styled.div`
  display: grid; grid-template-columns: 1fr 360px; gap: 32px; padding: 32px;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

export const Section = styled.div`
  background: ${C.surface2}30; border: 1px solid ${C.border}; border-radius: 20px;
  padding: 24px; margin-bottom: 24px;
  .title { font-size: 15px; font-weight: 700; color: ${C.text}; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
`;

export const InputGroup = styled.div<{ $error?: boolean }>`
  margin-bottom: 20px;
  label { display: block; font-size: 11px; font-weight: 700; color: ${C.textMuted}; text-transform: uppercase; margin-bottom: 8px; }
  .input-wrap {
    position: relative;
    input, select {
      width: 100%; background: ${C.surface2}; border: 1px solid ${props => props.$error ? C.danger : C.border};
      border-radius: 12px; padding: 12px 16px; color: ${C.text}; font-size: 14px; outline: none;
      transition: all 0.2s;
      &:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px ${C.accentSoft}; }
    }
    .suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: ${C.textMuted}; }
  }
  .err { color: ${C.danger}; font-size: 11px; font-weight: 600; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
`;

export const PreviewCard = styled.div`
  background: ${C.surface2}50; border: 1px solid ${C.border}; border-radius: 24px;
  padding: 32px; text-align: center;
  .avatar-big {
    width: 100px; height: 100px; border-radius: 30px; margin: 0 auto 20px;
    display: flex; align-items: center; justify-content: center; font-size: 42px; font-weight: 800; color: white;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }
  h3 { font-size: 22px; font-weight: 800; color: ${C.text}; margin: 0; }
  p { color: ${C.textMuted}; font-size: 14px; margin-top: 8px; }
`;
