import React from "react";
import { FiX, FiSave } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import {
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup,
    Button, Divider, Grid
} from "../../../shared/components/UI";
import { type ProveedorCreateRequest } from "../services/ProveedorService";

interface ProveedorModalProps {
    open: boolean;
    editing: any;
    form: Partial<ProveedorCreateRequest>;
    setForm: (val: any) => void;
    errors: Record<string, string>;
    statuses: any[];
    saving: boolean;
    onClose: () => void;
    onSave: () => void;
    getStatusName: (st: any) => string;
}

export const ProveedorModal: React.FC<ProveedorModalProps> = ({
    open, editing, form, setForm, errors,
    statuses, saving, onClose, onSave, getStatusName
}) => {
    if (!open) return null;

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <h2>{editing ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
                    <ActionBtn $variant="close" onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                <Grid>
                    <FormGroup style={{ gridColumn: "1 / 3" }}>
                        <label>Razón Social</label>
                        <input
                            value={form.razon_social ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, razon_social: e.target.value }))}
                            placeholder="Ej: Distribuciones ACME S.A."
                        />
                        {errors.razon_social && <small style={{ color: "#EF4444" }}>{errors.razon_social}</small>}
                    </FormGroup>

                    <FormGroup>
                        <label>NIT / RUT</label>
                        <input
                            value={form.nit_rut ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, nit_rut: e.target.value }))}
                            placeholder="900.123.456-7"
                        />
                        {errors.nit_rut && <small style={{ color: "#EF4444" }}>{errors.nit_rut}</small>}
                    </FormGroup>

                    <FormGroup>
                        <label>Contacto</label>
                        <input
                            value={form.contacto_nombre ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, contacto_nombre: e.target.value }))}
                            placeholder="Nombre de la persona de contacto"
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Teléfono</label>
                        <input
                            value={form.telefono ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, telefono: e.target.value }))}
                            placeholder="+57 300 123 4567"
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Email de Contacto</label>
                        <input
                            type="email"
                            value={form.email ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, email: e.target.value }))}
                            placeholder="proveedor@empresa.com"
                        />
                        {errors.email && <small style={{ color: "#EF4444" }}>{errors.email}</small>}
                    </FormGroup>

                    <FormGroup style={{ gridColumn: "1 / 3" }}>
                        <label>Dirección Fiscal</label>
                        <input
                            value={form.direccion ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, direccion: e.target.value }))}
                            placeholder="Av. Principal 123..."
                        />
                    </FormGroup>

                    <FormGroup>
                        <label>Estado</label>
                        <select
                            value={form.id_status ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, id_status: e.target.value }))}
                        >
                            <option value="">Seleccione Estado</option>
                            {statuses.map(st => (
                                <option key={st.id_status} value={st.id_status}>
                                    {getStatusName(st)}
                                </option>
                            ))}
                        </select>
                        {errors.id_status && <small style={{ color: "#EF4444" }}>{errors.id_status}</small>}
                    </FormGroup>
                </Grid>

                <Divider />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                    <Button $variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={onSave} disabled={saving}>
                        {saving ? (
                            <ClimbingBoxLoader color="#000" size={8} />
                        ) : (
                            <><FiSave /> {editing ? "Actualizar" : "Guardar Proveedor"}</>
                        )}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};
