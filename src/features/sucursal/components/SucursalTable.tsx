import React, { memo } from "react";
import { FiEdit2, FiTrash2, FiMapPin, FiBriefcase } from "react-icons/fi";
import { TableCard, Table, ActionBtn, Badge } from "../../../shared/components/UI";
import { type SucursalAPI } from "../services/SucursalService";

interface SucursalTableProps {
    sucursales: SucursalAPI[];
    empresaMap: Record<string, string>;
    statusMap: Record<string, string>;
    onEdit: (item: SucursalAPI) => void;
    onDelete: (id: string) => void;
}

const SucursalTable: React.FC<SucursalTableProps> = memo(({ 
    sucursales, 
    empresaMap,
    statusMap,
    onEdit, 
    onDelete 
}) => {
    return (
        <TableCard>
            <Table>
                <thead>
                    <tr>
                        <th>Nombre de Sucursal</th>
                        <th>Empresa</th>
                        <th>Estado</th>
                        <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {sucursales.map(s => (
                        <tr key={s.id_sucursal}>
                            <td style={{ fontWeight: 800 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FiMapPin opacity={0.5} />
                                    {s.nombre_sucursal}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FiBriefcase size={12} opacity={0.4} />
                                    {empresaMap[s.id_empresa] || "N/A"}
                                </div>
                            </td>
                            <td>
                                <Badge style={{ 
                                    background: !s.deleted_at ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: !s.deleted_at ? '#10B981' : '#EF4444'
                                }}>
                                    {s.deleted_at ? "ELIMINADO" : (statusMap[s.id_status] || "ACTIVO")}
                                </Badge>
                            </td>
                            <td style={{ textAlign: "right" }}>
                                <ActionBtn $variant="edit" onClick={() => onEdit(s)}><FiEdit2 /></ActionBtn>
                                <ActionBtn $variant="delete" onClick={() => onDelete(s.id_sucursal)}><FiTrash2 /></ActionBtn>
                            </td>
                        </tr>
                    ))}
                    {sucursales.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                No se encontraron sucursales registradas
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </TableCard>
    );
});

export default SucursalTable;
