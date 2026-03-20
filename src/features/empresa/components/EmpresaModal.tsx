import React, { memo } from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { 
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup 
} from "../../../shared/components/UI";
import { type UseFormRegister, type FieldErrors, type UseFormHandleSubmit } from "react-hook-form";
import { type EmpresaForm } from "../constants/empresas";
import { type EmpresaAPI } from "../services/EmpresaService";

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

interface EmpresaModalProps {
    isOpen: boolean;
    isSaving: boolean;
    editingItem: EmpresaAPI | null;
    apiError: string | null;
    statusList: any[];
    register: UseFormRegister<EmpresaForm>;
    errors: FieldErrors<EmpresaForm>;
    onClose: () => void;
    onSubmit: UseFormHandleSubmit<EmpresaForm>;
    onSave: (data: EmpresaForm) => void;
}

const EmpresaModal: React.FC<EmpresaModalProps> = memo(({
    isOpen,
    isSaving,
    editingItem,
    apiError,
    statusList,
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
                    <h2>{editingItem ? "Editar Empresa" : "Nueva Empresa"}</h2>
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
                        <label>Nombre / Razón Social</label>
                        <input {...register("nombre")} placeholder="Mi Empresa S.A." disabled={isSaving} />
                        {errors.nombre && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.nombre.message}</p>}
                    </FormGroup>

                    <FormGroup>
                        <label>RUT / Identificador Fiscal</label>
                        <div style={{ position: 'relative' }}>
                            <FiInfo style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input {...register("rut")} placeholder="12.345.678-9" style={{ paddingLeft: 35 }} disabled={isSaving} />
                        </div>
                        {errors.rut && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.rut.message}</p>}
                    </FormGroup>

                    <FormGroup>
                        <label>Estatus</label>
                        <select {...register("id_status")} disabled={isSaving}>
                            <option value="">Seleccione un estado...</option>
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
                            : <><FiCheckCircle /> {editingItem ? "Actualizar Empresa" : "Guardar Registro"}</>
                        }
                    </SubmitBtn>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
});

export default EmpresaModal;
