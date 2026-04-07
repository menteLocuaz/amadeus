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
  animation: ${fadeIn} 0.4s ease-out;
  position: relative;
`;

export const MainCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}11;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04); 
  overflow: hidden; 
  position: relative;
`;

export const LoaderWrap = styled.div`
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-height: 60vh;
  p { 
    margin-top: 24px; 
    font-weight: 700; 
    color: ${({ theme }) => theme.primary}; 
    letter-spacing: 2px; 
    text-transform: uppercase; 
    font-size: 0.75rem; 
  }
`;

// --- Botones de Acción (Minimal Style) ---
export const ActionBtn = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 24px; 
  border-radius: 10px; 
  border: 1px solid transparent; 
  font-weight: 700; 
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.$variant === 'primary' ? css`
    background: ${({ theme }) => theme.primary}; 
    color: #000;
    &:hover { 
      transform: translateY(-1px); 
      box-shadow: 0 4px 12px ${({ theme }) => theme.primary}33;
    }
  ` : props.$variant === 'danger' ? css`
    background: ${({ theme }) => theme.danger}15; 
    color: ${({ theme }) => theme.danger};
    &:hover { background: ${({ theme }) => theme.danger}; color: white; }
  ` : css`
    background: ${({ theme }) => theme.bg2}44; 
    color: ${({ theme }) => theme.text};
    border-color: ${({ theme }) => theme.bg3}22;
    &:hover { background: ${({ theme }) => theme.bg2}88; border-color: ${({ theme }) => theme.bg3}44; }
  `}
  
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// --- Estilos de Estadísticas ---
export const StatsGrid = styled.div`
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px; 
  margin-bottom: 32px;
`;

export const StatCard = styled.div<{ $color: string }>`
  background: ${({ theme }) => theme.bg}; 
  border: 1px solid ${({ theme }) => theme.bg3}11; 
  border-radius: 12px;
  padding: 24px; 
  display: flex; 
  align-items: center; 
  gap: 20px;
  transition: all 0.3s ease;
  
  &:hover { 
    transform: translateY(-4px); 
    border-color: ${props => props.$color}44; 
    box-shadow: 0 12px 24px rgba(0,0,0,0.04);
  }
  
  .icon-box {
    width: 52px; height: 52px; border-radius: 10px; background: ${props => props.$color}15;
    color: ${props => props.$color}; display: flex; align-items: center; justify-content: center; 
    font-size: 1.4rem;
  }
  
  .info {
    display: flex; flex-direction: column;
    .value { font-size: 1.75rem; font-weight: 800; color: ${({ theme }) => theme.text}; line-height: 1; }
    .label { font-size: 0.7rem; color: ${({ theme }) => theme.texttertiary}; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.1em; }
  }
`;

// --- Estilos de Filtros ---
export const FilterToolbar = styled.div`
  padding: 24px; 
  border-bottom: 1px solid ${({ theme }) => theme.bg3}11; 
  background: ${({ theme }) => theme.bg2}08;
  display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;
`;

export const SearchBox = styled.div`
  position: relative; flex: 1; min-width: 300px;
  input {
    width: 100%; background: ${({ theme }) => theme.bg}; border: 1px solid ${({ theme }) => theme.bg3}22;
    border-radius: 10px; padding: 12px 16px 12px 44px; color: ${({ theme }) => theme.text};
    font-size: 0.95rem; outline: none; transition: all 0.2s;
    &::placeholder { color: ${({ theme }) => theme.texttertiary}88; }
    &:focus { border-color: ${({ theme }) => theme.primary}; box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}11; }
  }
  svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: ${({ theme }) => theme.primary}; font-size: 1.1rem; }
`;

export const FilterSelects = styled.div`display: flex; gap: 12px; flex-wrap: wrap;`;

export const StyledSelect = styled.select`
  background: ${({ theme }) => theme.bg}; border: 1px solid ${({ theme }) => theme.bg3}22; border-radius: 10px;
  padding: 10px 16px; color: ${({ theme }) => theme.text}; font-size: 0.85rem; font-weight: 600; outline: none;
  cursor: pointer; transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.primary}80; }
`;

// --- Estilos de Tabla ---
export const TableContainer = styled.div`overflow-x: auto;`;
export const Table = styled.table`
  width: 100%; border-collapse: separate; border-spacing: 0;
  th {
    padding: 18px 24px; background: ${({ theme }) => theme.bg2}22; text-align: left;
    color: ${({ theme }) => theme.texttertiary}; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; border-bottom: 1px solid ${({ theme }) => theme.bg3}22;
  }
  td { padding: 20px 24px; border-bottom: 1px solid ${({ theme }) => theme.bg3}08; vertical-align: middle; }
  tbody tr:hover td { background: ${({ theme }) => theme.bg2}08; }
`;

export const UserInfo = styled.div`
  display: flex; align-items: center; gap: 14px;
  .avatar {
    width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center;
    justify-content: center; color: white; font-weight: 700; font-size: 14px;
  }
  .text {
    display: flex; flex-direction: column; gap: 2px;
    .name { color: ${({ theme }) => theme.text}; font-weight: 700; font-size: 0.95rem; }
    .sub { color: ${({ theme }) => theme.texttertiary}; font-size: 0.8rem; }
  }
`;

export const Badge = styled.span<{ $bg: string; $color: string }>`
  padding: 4px 12px; border-radius: 100px; font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; background: ${props => props.$bg};
  color: ${props => props.$color}; display: inline-flex; align-items: center; gap: 6px;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
`;

// --- Estilos de Formulario ---
export const FormGrid = styled.div`
  display: grid; grid-template-columns: 1fr 340px; gap: 32px; padding: 32px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

export const Section = styled.div`
  background: ${({ theme }) => theme.bg2}08; border: 1px solid ${({ theme }) => theme.bg3}11; border-radius: 12px;
  padding: 24px; margin-bottom: 24px;
  .title { 
    font-size: 1.1rem; font-weight: 700; color: ${({ theme }) => theme.text}; 
    margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
  }
`;

export const InputGroup = styled.div<{ $error?: boolean }>`
  margin-bottom: 20px;
  label { 
    display: block; font-size: 0.75rem; font-weight: 700; 
    color: ${({ theme }) => theme.texttertiary}; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;
  }
  .input-wrap {
    position: relative;
    input, select {
      width: 100%; background: ${({ theme }) => theme.bg}; border: 1px solid ${props => props.$error ? props.theme.danger : props.theme.bg3 + '22'};
      border-radius: 10px; padding: 12px 16px; color: ${({ theme }) => theme.text}; font-size: 0.95rem; outline: none;
      transition: all 0.2s;
      &:focus { border-color: ${({ theme }) => theme.primary}; box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}11; }
    }
    .suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: ${({ theme }) => theme.texttertiary}; }
  }
  .err { 
    color: ${({ theme }) => theme.danger}; font-size: 0.75rem; font-weight: 600; margin-top: 6px; display: flex; align-items: center; gap: 4px; 
  }
`;

export const PreviewCard = styled.div`
  background: ${({ theme }) => theme.bg2}15; border: 1px solid ${({ theme }) => theme.bg3}11; border-radius: 16px;
  padding: 32px; text-align: center; position: sticky; top: 32px;
  .avatar-big {
    width: 100px; height: 100px; border-radius: 12px; margin: 0 auto 20px;
    display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: white;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  h3 { font-size: 1.5rem; font-weight: 800; color: ${({ theme }) => theme.text}; margin: 0; }
  p { font-size: 0.9rem; color: ${({ theme }) => theme.texttertiary}; margin-top: 4px; }
`;
