// ─── Estatus Feature — ModuleGroup ────────────────────────────────────────────
// Grupo colapsable que muestra los estatus de un módulo en una tabla.
// Responsabilidad única: renderizar un grupo, no conoce el catálogo completo.

import React, { useState } from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiEdit2, FiTrash2, FiLayers, FiChevronDown, FiChevronUp } from "react-icons/fi";

import { TableCard, Table, ActionBtn, Badge } from "../../../shared/components/UI";
import { getTipoColor } from "../constants";
import type { EstatusResponse } from "../services/EstatusService";

// ─── Styled ────────────────────────────────────────────────────────────────────

const GroupCard = styled.div`
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}22;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
`;

const GroupHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: ${({ theme }) => theme.bg2};
    cursor: pointer;
    user-select: none;
    &:hover { opacity: 0.9; }
`;

const GroupLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 800;
    font-size: 1rem;
    color: ${({ theme }) => theme.text};

    span.count {
        font-size: 0.75rem;
        background: ${({ theme }) => theme.bg4}22;
        color: ${({ theme }) => theme.bg4};
        padding: 2px 10px;
        border-radius: 20px;
        font-weight: 700;
    }
`;

const TipoBadge = styled.span<{ $color: string }>`
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 800;
    background: ${({ $color }) => $color}18;
    color: ${({ $color }) => $color};
    text-transform: uppercase;
    letter-spacing: 0.4px;
`;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ModuleGroupProps {
    modulo: string;
    items: EstatusResponse[];
    deletingId: string | null;
    onEdit: (item: EstatusResponse) => void;
    onDelete: (id: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const ModuleGroup: React.FC<ModuleGroupProps> = ({
    modulo,
    items,
    deletingId,
    onEdit,
    onDelete,
}) => {
    // Cada grupo maneja su propio estado de colapso independientemente
    const [open, setOpen] = useState(true);

    return (
        <GroupCard>
            {/* ── Cabecera colapsable ── */}
            <GroupHeader onClick={() => setOpen(v => !v)}>
                <GroupLabel>
                    <FiLayers />
                    {modulo}
                    <span className="count">{items.length} estados</span>
                </GroupLabel>
                {open ? <FiChevronUp /> : <FiChevronDown />}
            </GroupHeader>

            {/* ── Tabla (solo cuando está abierto) ── */}
            {open && (
                <TableCard style={{ borderRadius: 0, boxShadow: "none", border: "none" }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Tipo / Estado</th>
                                <th>Módulo ID</th>
                                <th>Creado</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id_status}>
                                    <td style={{ fontWeight: 600 }}>
                                        {item.std_descripcion}
                                    </td>

                                    <td>
                                        {/* Badge con color según tipo; tolera stp_tipo_estado nulo */}
                                        <TipoBadge $color={getTipoColor(item.stp_tipo_estado)}>
                                            {item.stp_tipo_estado ?? "Sin tipo"}
                                        </TipoBadge>
                                    </td>

                                    <td>
                                        <Badge>{item.mdl_id}</Badge>
                                    </td>

                                    <td style={{ fontSize: "0.82rem", opacity: 0.6 }}>
                                        {item.created_at.slice(0, 10)}
                                    </td>

                                    <td style={{ textAlign: "right" }}>
                                        <ActionBtn
                                            $variant="edit"
                                            onClick={() => onEdit(item)}
                                            disabled={!!deletingId}
                                            title="Editar"
                                        >
                                            <FiEdit2 />
                                        </ActionBtn>

                                        <ActionBtn
                                            $variant="delete"
                                            onClick={() => onDelete(item.id_status)}
                                            disabled={!!deletingId}
                                            title="Eliminar"
                                        >
                                            {/* Spinner solo en la fila que se está eliminando */}
                                            {deletingId === item.id_status
                                                ? <BeatLoader size={5} color="#ff4d4d" />
                                                : <FiTrash2 />
                                            }
                                        </ActionBtn>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </TableCard>
            )}
        </GroupCard>
    );
};