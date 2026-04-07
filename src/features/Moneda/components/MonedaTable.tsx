import React, { memo } from "react";
import styled from "styled-components";
import { FiEdit2, FiTrash2, FiTarget, FiActivity } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { type Moneda } from "../services/MonedaService";

/* ------------------------------ Styled UI ------------------------------- */
const TableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 16px 24px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${({ theme }) => theme.texttertiary};
    background: ${({ theme }) => theme.bg2}22;
    border-bottom: 2px solid ${({ theme }) => theme.bg3}33;
  }

  td {
    padding: 16px 24px;
    border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.text};
    vertical-align: middle;
  }
`;

const TableRow = styled.tr`
  transition: background 0.2s ease;
  &:hover {
    background: ${({ theme }) => theme.bg2}44;
  }
`;

const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .name {
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .iso-badge {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${({ theme }) => theme.bg4}15;
    color: ${({ theme }) => theme.bg4};
    border: 1px solid ${({ theme }) => theme.bg4}33;
  }
`;

const NodeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.texttertiary};

  svg {
    opacity: 0.5;
    color: ${({ theme }) => theme.bg4};
  }
`;

const StatusIndicator = styled.div<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ $active, theme }) => ($active ? `${theme.success}15` : `${theme.danger}15`)};
  color: ${({ $active, theme }) => ($active ? theme.success : theme.danger)};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const IconButton = styled.button<{ $variant?: "edit" | "delete" }>`
  all: unset;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  color: ${({ theme, $variant }) => ($variant === "delete" ? theme.danger : theme.texttertiary)};

  &:hover:not(:disabled) {
    background: ${({ theme, $variant }) => ($variant === "delete" ? theme.danger : theme.bg4)};
    color: ${({ theme, $variant }) => ($variant === "delete" ? "white" : theme.bg)};
    border-color: transparent;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

/* ------------------------------- Component ------------------------------- */
interface Props {
  monedas:      Moneda[];
  sucursalMap:  Record<string, string>;
  isDeletingId: string | null;
  isSaving:     boolean;
  onEdit:       (moneda?: Moneda) => void;
  onDelete:     (id: string | undefined) => void;
}

export const MonedaTable: React.FC<Props> = memo(({
  monedas, sucursalMap, isDeletingId, isSaving,
  onEdit, onDelete,
}) => {
  const isBusy = isSaving || isDeletingId !== null;

  const extractIso = (name: string) => {
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  };

  const cleanName = (name: string) => {
    return name.replace(/\s*\([^)]*\)/, "").trim();
  };

  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            <th>Activo Financiero</th>
            <th>Asignación Nodo</th>
            <th>Estado Tesorería</th>
            <th style={{ textAlign: "right" }}>Operaciones</th>
          </tr>
        </thead>
        <tbody>
          {monedas.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: 60 }}>
                <div style={{ opacity: 0.4, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <FiActivity size={32} />
                  <span>Sin registros de divisas sincronizados</span>
                </div>
              </td>
            </tr>
          ) : (
            monedas.map((moneda) => {
              const id = String(moneda.id_moneda);
              const iso = extractIso(moneda.nombre);
              const name = cleanName(moneda.nombre);
              const isDeleting = isDeletingId === id;

              return (
                <TableRow key={id}>
                  <td>
                    <AssetInfo>
                      {iso && <span className="iso-badge">{iso}</span>}
                      <span className="name">{name}</span>
                    </AssetInfo>
                  </td>
                  <td>
                    <NodeLabel title={sucursalMap[moneda.id_sucursal]}>
                      <FiTarget size={14} />
                      {sucursalMap[moneda.id_sucursal] || "SYS_VOID_NODE"}
                    </NodeLabel>
                  </td>
                  <td>
                    <StatusIndicator $active={moneda.id_status === "activo"}>
                      {moneda.id_status === "activo" ? "Activo" : "Inactivo"}
                    </StatusIndicator>
                  </td>
                  <td>
                    <ActionGroup>
                      <IconButton onClick={() => onEdit(moneda)} disabled={isBusy} title="Editar">
                        <FiEdit2 size={14} />
                      </IconButton>
                      <IconButton 
                        $variant="delete" 
                        onClick={() => onDelete(id)} 
                        disabled={isBusy} 
                        title="Eliminar"
                      >
                        {isDeleting ? (
                          <ClimbingBoxLoader color="currentColor" size={8} />
                        ) : (
                          <FiTrash2 size={14} />
                        )}
                      </IconButton>
                    </ActionGroup>
                  </td>
                </TableRow>
              );
            })
          )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
});

export default MonedaTable;
