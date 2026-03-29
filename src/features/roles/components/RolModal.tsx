// ─── Roles Feature — RolModal Component ───────────────────────────────────────
// Modal reutilizable para crear y editar roles.
// Recibe todo su estado desde el hook useRoles — no tiene estado propio.

import React from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";

import {
    ActionBtn,
    Button,
    FormGroup,
    ModalContent,
    ModalOverlay,
} from "../../../shared/components/UI";

import type { EstatusItem, RolFormData, RolFormErrors } from "../types";
import type { SucursalItem } from "../../auth/services/AuthService";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface RolModalProps {
    open:        boolean;
    isEditing:   boolean;
    isSaving:    boolean;
    form:        RolFormData;
    errors:      RolFormErrors;
    sucursales:  SucursalItem[];
    estatusList: EstatusItem[];
    onClose:     () => void;
    onSave:      () => void;
    setField:    <K extends keyof RolFormData>(key: K, value: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const RolModal: React.FC<RolModalProps> = ({
    open,
    isEditing,
    isSaving,
    form,
    errors,
    sucursales,
    estatusList,
    onClose,
    onSave,
    setField,
}) => {
    if (!open) return null;

    return (
        // Clic en el overlay cierra el modal
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>

                {/* ── Cabecera ── */}
                <div style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    marginBottom:   28,
                }}>
                    <h2 style={{
                        margin:     0,
                        fontSize:   "1.2rem",
                        display:    "flex",
                        alignItems: "center",
                        gap:        8,
                    }}>
                        {isEditing ? <><FiEdit /> Editar Rol</> : <><FiPlus /> Nuevo Rol</>}
                    </h2>

                    <ActionBtn onClick={onClose} disabled={isSaving} title="Cerrar">
                        <FiX />
                    </ActionBtn>
                </div>

                {/* ── Nombre del rol ── */}
                <FormGroup>
                    <label>Nombre del Rol</label>
                    <input
                        value={form.nombre_rol}
                        onChange={e => setField("nombre_rol", e.target.value)}
                        placeholder="Ej: Administrador, Vendedor..."
                        disabled={isSaving}
                    />
                    {errors.nombre_rol && (
                        <span className="error">{errors.nombre_rol}</span>
                    )}
                </FormGroup>

                {/* ── Sucursal ── */}
                <FormGroup>
                    <label>Sucursal</label>
                    <select
                        value={form.id_sucursal}
                        onChange={e => setField("id_sucursal", e.target.value)}
                        disabled={isSaving}
                    >
                        <option value="">Seleccione una sucursal</option>
                        {sucursales.map(s => (
                            <option key={s.id_sucursal} value={String(s.id_sucursal)}>
                                {s.nombre_sucursal}
                            </option>
                        ))}
                    </select>
                    {errors.id_sucursal && (
                        <span className="error">{errors.id_sucursal}</span>
                    )}
                </FormGroup>

                {/* ── Estado ── */}
                <FormGroup>
                    <label>Estado</label>
                    <select
                        value={form.id_status}
                        onChange={e => setField("id_status", e.target.value)}
                        disabled={isSaving}
                    >
                        <option value="">Seleccione un estado</option>
                        {estatusList.map(est => (
                            <option key={est.id} value={est.id}>
                                {est.descripcion}
                            </option>
                        ))}
                    </select>
                    {errors.id_status && (
                        <span className="error">{errors.id_status}</span>
                    )}
                </FormGroup>

                {/* ── Botones de acción ── */}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        style={{ flex: 1, justifyContent: "center" }}
                    >
                        {isSaving
                            ? <ClimbingBoxLoader color="#000" size={6} />
                            : isEditing
                                ? <><FiCheck /> Actualizar</>
                                : <><FiPlus /> Crear Rol</>
                        }
                    </Button>

                    <ActionBtn onClick={onClose} disabled={isSaving} title="Cancelar">
                        <FiX />
                    </ActionBtn>
                </div>

            </ModalContent>
        </ModalOverlay>
    );
};

// FiEdit no fue importado arriba — lo agregamos aquí para evitar mover la importación
import { FiEdit } from "react-icons/fi";