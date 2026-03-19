import React, { memo } from "react";
import styled from "styled-components";
import { FiEdit2, FiTrash2, FiMapPin } from "react-icons/fi";
import { TableCard, Table, ActionBtn, Badge } from "../../../shared/components/UI";
import { type EstacionAPI } from "../services/EstacionService";

const IPChip = styled.code`
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    background: ${({ theme }) => theme.bg2};
    padding: 4px 10px; border-radius: 8px;
    color: ${({ theme }) => theme.text};
    opacity: 0.8;
`;

interface EstacionTableProps {
    estaciones: EstacionAPI[];
    sucursalMap: Record<string, string>;
    onEdit: (item: EstacionAPI) => void;
    onDelete: (id: string) => void;
}

const EstacionTable: React.FC<EstacionTableProps> = memo(({ 
    estaciones, 
    sucursalMap, 
    onEdit, 
    onDelete 
}) => {
    return (
        <TableCard>
            <Table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre de Estación</th>
                        <th>Dirección IP</th>
                        <th>Sucursal</th>
                        <th>Estado</th>
                        <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {estaciones.map(e => (
                        <tr key={e.id_estacion}>
                            <td><Badge $variant="outline">{e.codigo}</Badge></td>
                            <td style={{ fontWeight: 800 }}>{e.nombre}</td>
                            <td><IPChip>{e.ip}</IPChip></td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FiMapPin size={12} opacity={0.5} />
                                    {sucursalMap[e.id_sucursal] || "N/A"}
                                </div>
                            </td>
                            <td>
                                <Badge style={{ 
                                    background: !e.deleted_at ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: !e.deleted_at ? '#10B981' : '#EF4444'
                                }}>
                                    {!e.deleted_at ? "ACTIVO" : "ELIMINADO"}
                                </Badge>
                            </td>
                            <td style={{ textAlign: "right" }}>
                                <ActionBtn $variant="edit" onClick={() => onEdit(e)}><FiEdit2 /></ActionBtn>
                                <ActionBtn $variant="delete" onClick={() => handleDelete(e.id_estacion)}><FiTrash2 /></ActionBtn>
                            </td>
                        </tr>
                    ))}
                    {estaciones.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                No se encontraron estaciones
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </TableCard>
    );
});

export default EstacionTable;
