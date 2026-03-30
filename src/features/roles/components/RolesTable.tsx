// ─── Roles Feature — RolesTable Component ─────────────────────────────────────
// Tabla de roles con badges de estado y botones de acción por fila.
// Responsabilidad única: renderizar la lista; no sabe nada de APIs.

import React from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiEdit, FiTrash2 } from "react-icons/fi";

import { Table, ActionBtn, Badge } from "../../../shared/components/UI";
import { isEstatusActivo } from "../services/estatusHelpers";
import type { RolItem } from "../../auth/services/AuthService";
import type { EstatusItem } from "../types";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface RolesTableProps {
    roles:             RolItem[];
    isDeletingId:      string | null;
    isBusy:            boolean;             // bloquea botones si hay op. en curso
    getSucursalNombre: (id: string) => string;
    getEstatus:        (id: string) => EstatusItem | undefined;
    onEdit:            (rol: RolItem) => void;
    onDelete:          (id: string)  => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const RolesTable: React.FC<RolesTableProps> = ({
    roles,
    isDeletingId,
    isBusy,
    getSucursalNombre,
    getEstatus,
    onEdit,
    onDelete,
}) => (
    <Table>
        <thead>
            <tr>
                <th>Nombre del Rol</th>
                <th>Sucursal</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {roles.length === 0 ? (
                // ── Estado vacío ──
                <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 60, opacity: 0.5 }}>
                        No hay roles registrados.
                    </td>
                </tr>
            ) : (
                roles.map(rol => {
                    const deletingMe = isDeletingId === rol.id_rol;

                    return (

                        <tr key={rol.id_rol}>
                            {/* Nombre */}
                            <td style={{ fontWeight: 700 }}>{rol.nombre_rol}</td>

                            {/* Sucursal */}
                            <td>{getSucursalNombre(String(rol.id_sucursal))}</td>

                            {/* Estado — badge verde/rojo según estatus */}
                            <td>
                                {(() => {
                                    // Búsqueda del estatus en el catálogo normalizado usando el ID real
                                    const statusId = String(rol.id_status || "");
                                    const estatus = getEstatus(statusId);
                                    
                                    // Prioridad: 1. Descripción del catálogo, 2. Descripción del backend, 3. Fallback visual
                                    const label = estatus?.descripcion || 
                                                 rol.std_descripcion || 
                                                 (statusId ? `ID: ${statusId}` : "Sin estado");
                                                 
                                    const activo = isEstatusActivo(estatus?.descripcion || rol.std_descripcion);
                                    
                                    return (
                                        <Badge $color={activo ? "#22C55E" : (statusId ? "#EF4444" : "#888")}>
                                            {label}
                                        </Badge>
                                    );
                                })()}
                            </td>



                            {/* Acciones */}
                            <td>
                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                    <ActionBtn
                                        onClick={() => onEdit(rol)}
                                        disabled={isBusy}
                                        title="Editar"
                                    >
                                        <FiEdit />
                                    </ActionBtn>

                                    <ActionBtn
                                        $variant="delete"
                                        onClick={() => onDelete(rol.id_rol)}
                                        disabled={isBusy}
                                        title="Eliminar"
                                    >
                                        {/* Loader solo en la fila que se está eliminando */}
                                        {deletingMe
                                            ? <ClimbingBoxLoader color="#EF4444" size={5} />
                                            : <FiTrash2 />
                                        }
                                    </ActionBtn>
                                </div>
                            </td>
                        </tr>
                    );
                })
            )}
        </tbody>
    </Table>
);