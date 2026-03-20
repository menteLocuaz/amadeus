import React, { memo } from "react";
import { FiEdit2, FiTrash2, FiUser, FiMail, FiMapPin, FiShield } from "react-icons/fi";
import { TableCard, Table, ActionBtn, Badge } from "../../../shared/components/UI";
import { type UsuarioAPI } from "../services/UsuarioService";

interface UsuarioTableProps {
    usuarios: UsuarioAPI[];
    sucursalMap: Record<string, string>;
    rolMap: Record<string, string>;
    statusMap: Record<string, string>;
    onEdit: (item: UsuarioAPI) => void;
    onDelete: (id: string) => void;
}

const UsuarioTable: React.FC<UsuarioTableProps> = memo(({ 
    usuarios, 
    sucursalMap,
    rolMap,
    statusMap,
    onEdit, 
    onDelete 
}) => {
    return (
        <TableCard>
            <Table>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Email / DNI</th>
                        <th>Sucursal / Rol</th>
                        <th>Estado</th>
                        <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id_usuario}>
                            <td style={{ fontWeight: 800 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FiUser opacity={0.5} />
                                    {u.usu_nombre}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                                        <FiMail size={12} opacity={0.4} /> {u.email}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: 18 }}>
                                        DNI: {u.usu_dni}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                                        <FiMapPin size={12} opacity={0.4} /> {sucursalMap[u.id_sucursal] || "N/A"}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', opacity: 0.8, color: '#FCA311' }}>
                                        <FiShield size={10} /> {rolMap[u.id_rol] || "N/A"}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <Badge style={{ 
                                    background: !u.deleted_at ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: !u.deleted_at ? '#10B981' : '#EF4444'
                                }}>
                                    {u.deleted_at ? "INACTIVO" : (statusMap[u.id_status] || "ACTIVO")}
                                </Badge>
                            </td>
                            <td style={{ textAlign: "right" }}>
                                <ActionBtn $variant="edit" onClick={() => onEdit(u)}><FiEdit2 /></ActionBtn>
                                <ActionBtn $variant="delete" onClick={() => onDelete(u.id_usuario)}><FiTrash2 /></ActionBtn>
                            </td>
                        </tr>
                    ))}
                    {usuarios.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                No se encontraron usuarios registrados
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </TableCard>
    );
});

export default UsuarioTable;
