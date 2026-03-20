import React, { memo } from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiX, FiCheckCircle, FiAlertCircle, FiBriefcase } from "react-icons/fi";
import { 
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup 
} from "../../../shared/components/UI";
import { type UseFormRegister, type FieldErrors, type UseFormHandleSubmit } from "react-hook-form";
import { type SucursalForm } from "../constants/sucursales";
import { type SucursalAPI } from "../services/SucursalService";
import { type EmpresaAPI } from "../../empresa/services/EmpresaService";

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

interface SucursalModalProps {
    isOpen: boolean;
    isSaving: boolean;
    editingItem: SucursalAPI | null;
    apiError: string | null;
    statusList: any[];
    empresas: EmpresaAPI[];
    register: UseFormRegister<SucursalForm>;
    errors: FieldErrors<SucursalForm>;
    onClose: () => void;
    onSubmit: UseFormHandleSubmit<SucursalForm>;
    onSave: (data: SucursalForm) => void;
}

const SucursalModal: React.FC<SucursalModalProps> = memo(({
    isOpen,
    isSaving,
    editingItem,
    apiError,
    statusList,
    empresas,
    register,
    errors,
    onClose,
    onSubmit,
    onSave
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 500 }}>
                <ModalHeader>
                    <h2>{editingItem ? "Editar Sucursal" : "Nueva Sucursal"}</h2>
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
                    <FormGroup>
                        <label>Empresa Perteneciente</label>
                        <div style={{ position: 'relative' }}>
                            <FiBriefcase style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <select {...register("id_empresa")} style={{ paddingLeft: 35 }} disabled={isSaving}>
                                <option value="">Seleccione empresa...</option>
                                {(Array.isArray(empresas) ? empresas : []).map(e => (
                                    <option key={e.id} value={e.id}>{e.nombre}</option>
                                ))}
                            </select>
                        </div>
                        {errors.id_empresa && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.id_empresa.message}</p>}
                    </FormGroup>

                    <FormGroup>
                        <label>Nombre de la Sucursal</label>
                        <input {...register("nombre_sucursal")} placeholder="Sucursal Norte" disabled={isSaving} />
                        {errors.nombre_sucursal && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.nombre_sucursal.message}</p>}
                    </FormGroup>

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
                        {errors.id_status && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.id_status.message}</p>}
                    </FormGroup>

                    <SubmitBtn type="submit" disabled={isSaving}>
                        {isSaving 
                            ? <BeatLoader size={8} color="#000" /> 
                            : <><FiCheckCircle /> {editingItem ? "Actualizar Sucursal" : "Crear Sucursal"}</>
                        }
                    </SubmitBtn>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
});

export default SucursalModal;
