import React, { memo } from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiX, FiCheckCircle, FiAlertCircle, FiUser, FiMail, FiMapPin, FiShield, FiPhone } from "react-icons/fi";
import { 
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup 
} from "../../../shared/components/UI";
import { type UseFormRegister, type FieldErrors, type UseFormHandleSubmit } from "react-hook-form";
import { type UsuarioForm } from "../constants/usuarios";
import { type UsuarioAPI } from "../services/UsuarioService";
import { type SucursalAPI } from "../../sucursal/services/SucursalService";
import { type RolItem } from "../../auth/services/AuthService";

const SubmitBtn = styled.button`
    width: 100%;
    padding: 14px; border-radius: 12px; border: none;
    background: ${({ theme }) => theme.bg4};
    color: #000; font-weight: 800; font-size: 1rem;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px; margin-top: 15px;
    transition: all 0.2s;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }
`;

const MultiColumnRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

interface UsuarioModalProps {
    isOpen: boolean;
    isSaving: boolean;
    editingItem: UsuarioAPI | null;
    apiError: string | null;
    statusList: any[];
    sucursales: SucursalAPI[];
    roles: RolItem[];
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    onClose: () => void;
    onSubmit: UseFormHandleSubmit<UsuarioForm>;
    onSave: (data: UsuarioForm) => void;
}

const UsuarioModal: React.FC<UsuarioModalProps> = memo(({
    isOpen,
    isSaving,
    editingItem,
    apiError,
    statusList,
    sucursales,
    roles,
    register,
    errors,
    onClose,
    onSubmit,
    onSave
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 650 }}>
                <ModalHeader>
                    <h2>{editingItem ? "Editar Usuario" : "Nuevo Usuario"}</h2>
                    <ActionBtn $variant="close" onClick={onClose} disabled={isSaving}>
                        <FiX />
                    </ActionBtn>
                </ModalHeader>

                {apiError && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 10, color: '#EF4444', marginBottom: 15, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiAlertCircle /> {apiError}
                    </div>
                )}

                <form onSubmit={onSubmit(onSave)}>
                    <MultiColumnRow>
                        <FormGroup>
                            <label>Nombre Completo</label>
                            <div style={{ position: 'relative' }}>
                                <FiUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                <input {...register("usu_nombre")} style={{ paddingLeft: 35 }} placeholder="Juan Pérez" disabled={isSaving} />
                            </div>
                            {Boolean(errors.usu_nombre?.message) && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{String(errors.usu_nombre?.message)}</p>}
                        </FormGroup>

                        <FormGroup>
                            <label>Email Corporativo</label>
                            <div style={{ position: 'relative' }}>
                                <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                <input {...register("email")} style={{ paddingLeft: 35 }} placeholder="juan@empresa.com" disabled={isSaving} />
                            </div>
                            {Boolean(errors.email?.message) && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{String(errors.email?.message)}</p>}
                        </FormGroup>
                    </MultiColumnRow>

                    <MultiColumnRow>
                        <FormGroup>
                            <label>DNI / Identificación</label>
                            <input {...register("usu_dni")} placeholder="12345678" disabled={isSaving} />
                            {Boolean(errors.usu_dni?.message) && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{String(errors.usu_dni?.message)}</p>}
                        </FormGroup>

                        <FormGroup>
                            <label>Teléfono (Opcional)</label>
                            <div style={{ position: 'relative' }}>
                                <FiPhone style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                <input {...register("usu_telefono")} style={{ paddingLeft: 35 }} placeholder="987654321" disabled={isSaving} />
                            </div>
                            {Boolean(errors.usu_telefono?.message) && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{String(errors.usu_telefono?.message)}</p>}
                        </FormGroup>
                    </MultiColumnRow>

                    <FormGroup>
                        <label>{editingItem ? "Contraseña (Dejar vacío para mantener)" : "Contraseña"}</label>
                        <input type="password" {...register("password")} placeholder="••••••••" disabled={isSaving} />
                        {Boolean(errors.password?.message) && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{String(errors.password?.message)}</p>}
                    </FormGroup>

                    <MultiColumnRow>
                        <FormGroup>
                            <label>Sucursal</label>
                            <div style={{ position: 'relative' }}>
                                <FiMapPin style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                <select {...register("id_sucursal")} style={{ paddingLeft: 35 }} disabled={isSaving}>
                                    <option value="">Seleccione sucursal...</option>
                                    {(Array.isArray(sucursales) ? sucursales : []).map(s => (
                                        <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre_sucursal}</option>
                                    ))}
                                </select>
                            </div>
                            {Boolean(errors.id_sucursal?.message) && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{String(errors.id_sucursal?.message)}</p>}
                        </FormGroup>

                        <FormGroup>
                            <label>Rol de Usuario</label>
                            <div style={{ position: 'relative' }}>
                                <FiShield style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                <select {...register("id_rol")} style={{ paddingLeft: 35 }} disabled={isSaving}>
                                    <option value="">Seleccione rol...</option>
                                    {(Array.isArray(roles) ? roles : []).map(r => (
                                        <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                                    ))}
                                </select>
                            </div>
                            {Boolean(errors.id_rol?.message) && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{String(errors.id_rol?.message)}</p>}
                        </FormGroup>
                    </MultiColumnRow>

                    <FormGroup>
                        <label>Estatus</label>
                        <select {...register("id_status")} disabled={isSaving}>
                            <option value="">Seleccione estado...</option>
                            {(Array.isArray(statusList) ? statusList : []).map(s => (
                                <option key={s.id_status} value={s.id_status}>
                                    {s.std_descripcion || s.nombre}
                                </option>
                            ))}
                        </select>
                        {Boolean(errors.id_status?.message) && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{String(errors.id_status?.message)}</p>}
                    </FormGroup>

                    <SubmitBtn type="submit" disabled={isSaving}>
                        {isSaving 
                            ? <BeatLoader size={8} color="#000" /> 
                            : <><FiCheckCircle /> {editingItem ? "Actualizar Usuario" : "Crear Usuario"}</>
                        }
                    </SubmitBtn>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
});

export default UsuarioModal;
