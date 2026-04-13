import React from "react";
import styled from "styled-components";
import { useFormContext } from "react-hook-form";
import { BeatLoader } from "react-spinners";
import { FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

// UI Shared
import { 
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup 
} from "../../../shared/components/UI";

// Tipos y Validaciones
import type { DispositivoForm } from "../constants/validations";

/**
 * DeviceModal - Refactorizado con useFormContext
 * 
 * Ahora consume el estado del formulario directamente desde FormProvider.
 * Esto elimina el prop-drilling de register, errors y handleSubmit.
 */
interface DeviceModalProps {
    isOpen: boolean;
    editingItem: any;
    isSaving: boolean;
    apiError?: string | null;
    estaciones: any[];
    statusList: any[];
    onClose: () => void;
    onSave: (data: any) => void; // Este onSave ya viene envuelto en handleSubmit
}

const DeviceModal: React.FC<DeviceModalProps> = ({
    isOpen, editingItem, isSaving, apiError, estaciones, statusList, onClose, onSave,
}) => {
    // Obtenemos las herramientas de RHF desde el contexto
    const { register, formState: { errors } } = useFormContext<DispositivoForm>();

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 620 }}>
                <ModalHeader>
                    <h2>{editingItem ? "Editar Dispositivo" : "Registrar Dispositivo"}</h2>
                    <ActionBtn $variant="close" onClick={onClose} disabled={isSaving}>
                        <FiX />
                    </ActionBtn>
                </ModalHeader>

                {apiError && (
                    <ApiErrorWrap>
                        <FiAlertCircle /> {apiError}
                    </ApiErrorWrap>
                )}

                <form onSubmit={onSave}>
                    {/* Nombre */}
                    <FormGroup>
                        <label>Nombre del Dispositivo</label>
                        <input
                            {...register("nombre")}
                            placeholder="Ej: Impresora Cocina"
                            disabled={isSaving}
                        />
                        {errors.nombre && (
                            <ErrorText><FiAlertCircle /> {errors.nombre.message}</ErrorText>
                        )}
                    </FormGroup>

                    <FormGrid>
                        {/* Tipo */}
                        <FormGroup>
                            <label>Tipo de Hardware</label>
                            <select {...register("tipo")} disabled={isSaving}>
                                <option value="IMPRESORA">🖨️ Impresora</option>
                                <option value="DATAFONO">💳 Datáfono</option>
                                <option value="KIOSKO">🖥️ Kiosko de Autoservicio</option>
                                <option value="MONITOR">📺 Monitor de Cocina</option>
                                <option value="SCANNER">🔍 Scanner</option>
                                <option value="BASCULA">⚖️ Báscula</option>
                                <option value="VISOR">🏷️ Visor de Precios</option>
                            </select>
                            {errors.tipo && (
                                <ErrorText><FiAlertCircle /> {errors.tipo.message}</ErrorText>
                            )}
                        </FormGroup>

                        {/* IP */}
                        <FormGroup>
                            <label>Dirección IP</label>
                            <input
                                {...register("ip")}
                                placeholder="192.168.1.50"
                                disabled={isSaving}
                            />
                            {errors.ip && (
                                <ErrorText><FiAlertCircle /> {errors.ip.message}</ErrorText>
                            )}
                        </FormGroup>
                    </FormGrid>

                    <FormGrid>
                        {/* Estación */}
                        <FormGroup>
                            <label>Estación POS Vinculada</label>
                            <select {...register("id_estacion")} disabled={isSaving}>
                                <option value="">Seleccione Estación...</option>
                                {estaciones.map(e => (
                                    <option key={e.id_estacion} value={e.id_estacion}>
                                        {e.nombre} ({e.codigo})
                                    </option>
                                ))}
                            </select>
                            {errors.id_estacion && (
                                <ErrorText><FiAlertCircle /> {errors.id_estacion.message}</ErrorText>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <label>Estado Operativo</label>
                            <select {...register("id_status")} disabled={isSaving}>
                                <option value="">Seleccione estado...</option>
                                {statusList.map(s => (
                                    <option key={s.id_status} value={s.id_status}>
                                        {s.std_descripcion || s.nombre || 'Estatus desconocido'}
                                    </option>
                                ))}
                            </select>
                            {errors.id_status && (
                                <ErrorText><FiAlertCircle /> {errors.id_status.message}</ErrorText>
                            )}
                        </FormGroup>
                    </FormGrid>

                    <InfoBanner>
                        💡 Usa una <strong>IP fija</strong> en la red local para garantizar la conectividad.
                    </InfoBanner>

                    <SubmitBtn type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <BeatLoader color="#000" size={8} />
                        ) : (
                            <><FiCheckCircle /> {editingItem ? "Guardar Cambios" : "Registrar Dispositivo"}</>
                        )}
                    </SubmitBtn>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};

// --- Styled Components Locales ---
const FormGrid = styled.div`
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
`;

const ErrorText = styled.span`
    color: #ef4444; font-size: 0.75rem; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
`;

const ApiErrorWrap = styled.div`
    margin-bottom: 16px; padding: 12px 16px; border-radius: 12px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444; font-size: 0.88rem; display: flex; align-items: center; gap: 8px;
`;

const InfoBanner = styled.div`
    background: rgba(252,163,17,0.06); border: 1px solid rgba(252,163,17,0.2);
    border-radius: 12px; padding: 12px 16px; font-size: 0.82rem; margin-bottom: 10px; opacity: 0.85;
`;

const SubmitBtn = styled.button`
    width: 100%; padding: 14px; border-radius: 12px; border: none;
    background: ${({ theme }) => theme.bg4}; color: #000; font-weight: 800; font-size: 1rem;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 16px ${({ theme }) => theme.bg4}44; }
`;

export default DeviceModal;
