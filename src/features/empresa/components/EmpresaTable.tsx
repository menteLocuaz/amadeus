import React, { memo } from "react";
import { FiEdit2, FiTrash2, FiBriefcase } from "react-icons/fi";
import { TableCard, Table, ActionBtn, Badge } from "../../../shared/components/UI";
import { type EmpresaAPI } from "../services/EmpresaService";

interface EmpresaTableProps {
    empresas: EmpresaAPI[];
    statusMap: Record<string, string>;
    onEdit: (item: EmpresaAPI) => void;
    onDelete: (id: string) => void;
}

const EmpresaTable: React.FC<EmpresaTableProps> = memo(({ 
    empresas, 
    statusMap,
    onEdit, 
    onDelete 
}) => {
    return (
        <TableCard>
            <Table>
                <thead>
                    <tr>
                        <th>Nombre / Razón Social</th>
                        <th>RUT / Identificador</th>
                        <th>Estado Operativo</th>
                        <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empresas.map(e => (
                        <tr key={e.id}>
                            <td style={{ fontWeight: 800 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FiBriefcase opacity={0.5} />
                                    {e.nombre}
                                </div>
                            </td>
                            <td><Badge $variant="outline">{e.rut}</Badge></td>
                            <td>
                                <Badge style={{ 
                                    background: !e.deleted_at ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: !e.deleted_at ? '#10B981' : '#EF4444'
                                }}>
                                    {e.deleted_at ? "ELIMINADO" : (statusMap[e.id_status] || "ACTIVO")}
                                </Badge>
                            </td>
                            <td style={{ textAlign: "right" }}>
                                <ActionBtn $variant="edit" onClick={() => onEdit(e)}><FiEdit2 /></ActionBtn>
                                <ActionBtn $variant="delete" onClick={() => onDelete(e.id)}><FiTrash2 /></ActionBtn>
                            </td>
                        </tr>
                    ))}
                    {empresas.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                No se encontraron empresas registradas
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </TableCard>
    );
});

export default EmpresaTable;
