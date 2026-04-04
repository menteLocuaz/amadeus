import React from "react";
import { FiEdit2, FiTrash2, FiMapPin } from "react-icons/fi";
import { USER_COLORS as C, getAvatarColor, getInitials, getStatusStyle, getRolStyle } from "../constants/usuarios";
import { TableContainer, Table, UserInfo, Badge, ActionBtn } from "../styles/UserStyles";

interface UserTableProps {
  usuarios: any[];
  rolMap: Record<string, string>;
  statusMap: Record<string, string>;
  sucursalMap: Record<string, string>;
  onEdit: (user: any) => void;
  onDelete: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  usuarios, rolMap, statusMap, sucursalMap, onEdit, onDelete 
}) => {
  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Username</th>
            <th>Rol & Permisos</th>
            <th>Ubicación</th>
            <th>Estatus</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => {
            const roleName = rolMap[u.id_rol] || "User";
            const stName = statusMap[u.id_status] || "Unknown";
            const stStyle = getStatusStyle(stName);
            const rlStyle = getRolStyle(roleName);
            return (
              <tr key={u.id_usuario}>
                <td>
                  <UserInfo>
                    <div className="avatar" style={{ background: getAvatarColor(u.nombre) }}>
                      {getInitials(u.nombre)}
                    </div>
                    <div className="text">
                      <span className="name">{u.nombre}</span>
                      <span className="sub">{u.email || u.correo}</span>
                    </div>
                  </UserInfo>
                </td>
                <td><code style={{ color: C.accent, fontWeight: 700 }}>@{u.username}</code></td>
                <td>
                  <Badge $bg={rlStyle.bg} $color={rlStyle.color}>{roleName}</Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textMuted, fontSize: 13 }}>
                    <FiMapPin size={14} /> {sucursalMap[u.id_sucursal] || "Base"}
                  </div>
                </td>
                <td>
                  <Badge $bg={stStyle.bg} $color={stStyle.color}>
                    <div className="dot" /> {stName}
                  </Badge>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <ActionBtn style={{ padding: 8 }} onClick={() => onEdit(u)}><FiEdit2 size={16} /></ActionBtn>
                    <ActionBtn style={{ padding: 8 }} $variant="danger" onClick={() => onDelete(u.id_usuario)}><FiTrash2 size={16} /></ActionBtn>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
