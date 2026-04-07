import React, { memo } from "react";
import styled from "styled-components";
import { FiEdit2, FiTrash2, FiMapPin, FiBriefcase, FiActivity, FiArrowRight } from "react-icons/fi";
import { type SucursalAPI } from "../services/SucursalService";

interface SucursalTableProps {
    sucursales: SucursalAPI[];
    empresaMap: Record<string, string>;
    statusMap: Record<string, string>;
    onEdit: (item: SucursalAPI) => void;
    onDelete: (id: string) => void;
}

/* ------------------------------ Styled UI ------------------------------- */
const TableContainer = styled.div`
    width: 100%;
    overflow-x: auto;
    background: ${({ theme }) => theme.bg}CC;
    border-radius: 4px;
`;

const TechTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-family: "Inter", sans-serif;

    thead th {
        background: ${({ theme }) => theme.bg2}44;
        padding: 18px 24px;
        text-align: left;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: ${({ theme }) => theme.text}88;
        border-bottom: 2px solid ${({ theme }) => theme.bg3}33;
    }

    tbody tr {
        transition: all 0.2s ease;
        border-bottom: 1px solid ${({ theme }) => theme.bg3}11;

        &:hover {
            background: ${({ theme }) => theme.bg4}05;
            
            .row-arrow {
                opacity: 1;
                transform: translateX(0);
            }
        }
    }

    td {
        padding: 20px 24px;
        color: ${({ theme }) => theme.text};
        font-size: 0.95rem;
    }
`;

const NameCell = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    font-family: "Space Grotesk", sans-serif;
    letter-spacing: -0.5px;

    svg {
        color: ${({ theme }) => theme.bg4};
        opacity: 0.8;
    }
`;

const SubText = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.text}66;
    text-transform: uppercase;
`;

const Indicator = styled.div<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 4px;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    background: ${({ $active, theme }) => ($active ? `${theme.bg4}10` : 'rgba(239,68,68,0.1)')};
    color: ${({ $active, theme }) => ($active ? theme.bg4 : '#EF4444')};
    border: 1px solid currentColor;
    
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
    gap: 10px;
    align-items: center;
`;

const ControlBtn = styled.button<{ $variant?: 'edit' | 'delete' }>`
    all: unset;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 4px;
    background: ${({ theme }) => theme.bg2}80;
    color: ${({ $variant, theme }) => $variant === 'delete' ? '#EF4444' : theme.text}CC;
    border: 1px solid transparent;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: ${({ $variant, theme }) => $variant === 'delete' ? '#EF444420' : theme.bg4};
        color: ${({ $variant, theme }) => $variant === 'delete' ? '#EF4444' : theme.bg};
        border-color: ${({ $variant, theme }) => $variant === 'delete' ? '#EF4444' : theme.bg4};
        transform: translateY(-2px);
    }
`;

const RowArrow = styled(FiArrowRight)`
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
    color: ${({ theme }) => theme.bg4};
`;

const SucursalTable: React.FC<SucursalTableProps> = memo(({ 
    sucursales, 
    empresaMap,
    statusMap,
    onEdit, 
    onDelete 
}) => {
    return (
        <TableContainer>
            <TechTable>
                <thead>
                    <tr>
                        <th>Identificación de Nodo</th>
                        <th>Empresa Matriz</th>
                        <th>Estado de Red</th>
                        <th style={{ textAlign: "right" }}>Operaciones</th>
                    </tr>
                </thead>
                <tbody>
                    {sucursales.map(s => (
                        <tr key={s.id_sucursal}>
                            <td>
                                <NameCell>
                                    <FiMapPin size={18} />
                                    {s.nombre_sucursal}
                                </NameCell>
                            </td>
                            <td>
                                <SubText>
                                    <FiBriefcase size={12} />
                                    {empresaMap[s.id_empresa] || "SYS_DEF_00"}
                                </SubText>
                            </td>
                            <td>
                                <Indicator $active={!s.deleted_at}>
                                    {s.deleted_at ? "TERMINATED" : (statusMap[s.id_status] || "OPERATIONAL")}
                                </Indicator>
                            </td>
                            <td>
                                <ActionGroup>
                                    <RowArrow className="row-arrow" />
                                    <ControlBtn onClick={() => onEdit(s)}>
                                        <FiEdit2 size={16} />
                                    </ControlBtn>
                                    <ControlBtn $variant="delete" onClick={() => onDelete(s.id_sucursal)}>
                                        <FiTrash2 size={16} />
                                    </ControlBtn>
                                </ActionGroup>
                            </td>
                        </tr>
                    ))}
                    {sucursales.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '80px' }}>
                                <SubText style={{ justifyContent: 'center', opacity: 0.4 }}>
                                    <FiActivity /> NO_ACTIVE_NODES_FOUND
                                </SubText>
                            </td>
                        </tr>
                    )}
                </tbody>
            </TechTable>
        </TableContainer>
    );
});

export default SucursalTable;
