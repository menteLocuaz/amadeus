import styled from "styled-components";

/**
 * Componentes UI atómicos reutilizables para toda la app.
 * Exporta: PageContainer, TableCard, Table, ActionBtn, Badge, FormGroup, ModalOverlay, ModalContent, Thumbnail
 */

export const PageContainer = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 28px;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
`;

export const HeaderTitle = styled.div`
  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    margin: 4px 0 0 0;
    opacity: 0.6;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.bg2};
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.bg3}33;
  width: 300px;
  input {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    outline: none;
    width: 100%;
    font-size: 0.9rem;
    &::placeholder { opacity: 0.5; }
  }
  svg {
    opacity: 0.5;
  }
`;

export const TableCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg3}22;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    background: ${({ theme }) => theme.bg2};
    padding: 18px;
    text-align: left;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.bg4};
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }
  td {
    padding: 18px;
    border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
    color: ${({ theme }) => theme.text};
    vertical-align: middle;
  }
`;

/* Botón de acción reutilizable (editar / eliminar / cerrar) */
export const ActionBtn = styled.button<{ $variant?: "edit" | "delete" | "close" }>`
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${({ $variant, theme }) =>
    $variant === "delete" ? "#ff4d4d" : $variant === "close" ? theme.text : theme.bg4};
  border-radius: 8px;
  font-size: 1.2rem;
  transition: all 0.12s;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ $variant }) =>
      $variant === "delete" ? "rgba(255,77,77,0.09)" : "rgba(252,163,17,0.08)"};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* Badge / etiqueta */
export const Badge = styled.span<{ $color?: string }>`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${({ $color }) => $color || "rgba(252, 163, 17, 0.1)"};
  color: ${({ $color, theme }) => ($color ? "#fff" : theme.bg4)};
`;

/* FormGroup estándar */
export const FormGroup = styled.div`
  margin-bottom: 18px;
  label {
    display: block;
    font-weight: 700;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.bg4};
    font-size: 0.9rem;
  }
  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.bg3}33;
    background: ${({ theme }) => theme.bg2};
    outline: none;
    color: ${({ theme }) => theme.text};
    transition: border-color 0.12s;
    &:focus { border-color: ${({ theme }) => theme.bg4}; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
  textarea { min-height: 80px; resize: vertical; }
`;

/* Modal overlay y contenido */
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.bg};
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  border: 1px solid ${({ theme }) => theme.bg3}33;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.bg3}; border-radius: 10px; }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  h2 { margin: 0; font-size: 1.5rem; font-weight: 800; }
`;

/* Thumbnail estándar para listas de items */
export const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg2};
`;