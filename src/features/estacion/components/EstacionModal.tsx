import React, { memo } from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiX, FiCheckCircle, FiAlertCircle, FiGlobe } from "react-icons/fi";
import { 
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup 
} from "../../../shared/components/UI";
import { type UseFormRegister, type FieldErrors, type UseFormHandleSubmit } from "react-hook-form";
import { type EstacionForm } from "../constants/estaciones";
import { type EstacionAPI } from "../services/EstacionService";

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

interface EstacionModalProps {
    isOpen: boolean;
    isSaving: boolean;
    editingItem: EstacionAPI | null;
    apiError: string | null;
    sucursales: any[];
    activeStatusList: any[];
    register: UseFormRegister<EstacionForm>;
    errors: FieldErrors<EstacionForm>;
    onClose: () => void;
    onSubmit: UseFormHandleSubmit<EstacionForm>;
    onSave: (data: EstacionForm) => void;
}

const EstacionModal: React.FC<EstacionModalProps> = memo(({
    isOpen,
    isSaving,
    editingItem,
    apiError,
    sucursales,
    activeStatusList,
    register,
    errors,
    onClose,
    onSubmit,
    onSave
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 550 }}>
                <ModalHeader>
                    <h2>{editingItem ? "Editar Terminal" : "Registrar Terminal POS"}</h2>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 15 }}>
                        <FormGroup>
                            <label>Código</label>
                            <input {...register("codigo")} placeholder="POS-01" disabled={isSaving} />
                            {errors.codigo && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.codigo.message}</p>}
                        </FormGroup>
                        <FormGroup>
                            <label>Nombre Comercial / Ubicación</label>
                            <input {...register("nombre")} placeholder="Caja Principal Pasillo A" disabled={isSaving} />
                            {errors.nombre && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.nombre.message}</p>}
                        </FormGroup>
                    </div>

                    <FormGroup>
                        <label>Dirección IP Fija</label>
                        <div style={{ position: 'relative' }}>
                            <FiGlobe style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input {...register("ip")} placeholder="192.168.1.10" style={{ paddingLeft: 35 }} disabled={isSaving} />
                        </div>
                        {errors.ip && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.ip.message}</p>}
                    </FormGroup>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <FormGroup>
                            <label>Sucursal</label>
                            <select {...register("id_sucursal")} disabled={isSaving}>
                                <option value="">Seleccione...</option>
                                {sucursales.map(s => (
                                    <option key={s.id || s.id_sucursal} value={s.id || s.id_sucursal}>{s.nombre}</option>
                                ))}
                            </select>
                            {errors.id_sucursal && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.id_sucursal.message}</p>}
                        </FormGroup>
                        <FormGroup>
                            <label>Estatus Inicial</label>
                            <select {...register("id_status")} disabled={isSaving}>
                                <option value="">Seleccione...</option>
                                {activeStatusList.map(s => (
                                    <option key={s.id_status} value={s.id_status}>{s.std_descripcion}</option>
                                ))}
                            </select>
                            {errors.id_status && <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.id_status.message}</p>}
                        </FormGroup>
                    </div>

                    <SubmitBtn type="submit" disabled={isSaving}>
                        {isSaving 
                            ? <BeatLoader size={8} color="#000" /> 
                            : <><FiCheckCircle /> {editingItem ? "Actualizar Estación" : "Crear Estación"}</>
                        }
                    </SubmitBtn>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
});

export default EstacionModal;
