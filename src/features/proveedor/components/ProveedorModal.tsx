import React from "react";
import { FiX, FiSave } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import {
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup
} from "../../../shared/components/UI";
import { Button, Divider, Grid } from "../../../shared/components/UI/atoms";

interface ProveedorModalProps {
    open: boolean;
    editing: any;
    form: any;
    setForm: (val: any) => void;
    errors: Record<string, string>;
    statuses: any[];
    sucursales: any[];
    empresas: any[];
    saving: boolean;
    onClose: () => void;
    onSave: () => void;
    getStatusName: (st: any) => string;
}

export const ProveedorModal: React.FC<ProveedorModalProps> = ({
    open,
    editing,
    form,
    setForm,
    errors,
    statuses,
    sucursales,
    empresas,
    saving,
    onClose,
    onSave,
    getStatusName
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
                        <label>Nombre del Proveedor</label>
                        <input
                            value={form.nombre ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, nombre: e.target.value }))}
                            placeholder="Ej: Distribuciones ACME"
                        />
                        {errors.nombre && <small style={{ color: "#EF4444" }}>{errors.nombre}</small>}
                    </FormGroup>

                    <FormGroup>
                        <label>RUC / Documento</label>
                        <input
                            value={form.ruc ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, ruc: e.target.value }))}
                            placeholder="203040..."
                        />
                        {errors.ruc && <small style={{ color: "#EF4444" }}>{errors.ruc}</small>}
                    </FormGroup>

                    <FormGroup>
                        <label>Telefono</label>
                        <input
                            value={form.telefono ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, telefono: e.target.value }))}
                            placeholder="999..."
                        />
                    </FormGroup>

                    <FormGroup style={{ gridColumn: "1 / 3" }}>
                        <label>Direccion Fiscal</label>
                        <input
                            value={form.direccion ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, direccion: e.target.value }))}
                            placeholder="Av. Principal 123..."
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

                    <FormGroup>
                        <label>Sucursal</label>
                        <select
                            value={form.id_sucursal ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, id_sucursal: e.target.value }))}
                        >
                            <option value="">Seleccione Sucursal</option>
                            {sucursales.map((s: any) => {
                                const sid = s.id || s.id_sucursal;
                                return <option key={sid} value={sid}>{s.nombre || s.nombre_sucursal}</option>;
                            })}
                        </select>
                        {errors.id_sucursal && <small style={{ color: "#EF4444" }}>{errors.id_sucursal}</small>}
                    </FormGroup>

                    <FormGroup>
                        <label>Empresa</label>
                        <select
                            value={form.id_empresa ?? ""}
                            onChange={(e) => setForm((s: any) => ({ ...s, id_empresa: e.target.value }))}
                        >
                            <option value="">Seleccione Empresa</option>
                            {empresas.map((e: any) => {
                                const eid = e.id || e.id_empresa;
                                return <option key={eid} value={eid}>{e.nombre || e.nombre_empresa}</option>;
                            })}
                        </select>
                        {errors.id_empresa && <small style={{ color: "#EF4444" }}>{errors.id_empresa}</small>}
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
