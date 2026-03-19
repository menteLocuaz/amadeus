import React from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { 
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup 
} from "../../../shared/components/UI";
import type { UseFormRegister, FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import type { DispositivoForm } from "../hooks/useDispositivos";
import type { Dispositivo } from "../constants/dispositivos";
import type { EstacionAPI } from "../../estacion/services/EstacionService";

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
`;

const SubmitBtn = styled.button`
    width: 100%;
    padding: 14px; border-radius: 12px; border: none;
    background: ${({ theme }) => theme.bg4};
    color: #000; font-weight: 800; font-size: 1rem;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px; margin-top: 12px;
    transition: all 0.2s;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 16px ${({ theme }) => theme.bg4}44; }
`;

const ErrorText = styled.span`
    color: #ff4d4d; font-size: 0.75rem; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
`;

const ApiError = styled.div`
    margin-bottom: 16px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444;
    font-size: 0.88rem;
    display: flex; align-items: center; gap: 8px;
`;

interface DeviceModalProps {
    isOpen: boolean;
    editingItem: Dispositivo | null;
    isSaving: boolean;
    apiError: string | null;
    estaciones: EstacionAPI[];
    register: UseFormRegister<DispositivoForm>;
    errors: FieldErrors<DispositivoForm>;
    onClose: () => void;
    onSubmit: UseFormHandleSubmit<DispositivoForm>;
    onSave: (data: DispositivoForm) => void;
}

const DeviceModal: React.FC<DeviceModalProps> = ({
    isOpen,
    editingItem,
    isSaving,
    apiError,
    estaciones,
    register,
    errors,
    onClose,
    onSubmit,
    onSave
}) => {
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
                    <ApiError>
                        <FiAlertCircle /> {apiError}
                    </ApiError>
                )}

                <form onSubmit={onSubmit(onSave)}>
                    <FormGroup>
                        <label>Nombre del Dispositivo</label>
                        <input {...register("nombre")} placeholder="Ej: Impresora Cocina" disabled={isSaving} />
                        {errors.nombre && <ErrorText><FiAlertCircle /> {errors.nombre.message}</ErrorText>}
                    </FormGroup>

                    <FormGrid>
                        <FormGroup>
                            <label>Tipo de Hardware</label>
                            <select {...register("tipo")} disabled={isSaving}>
                                <option value="IMPRESORA">🖨️ Impresora</option>
                                <option value="DATAFONO">💳 Datáfono</option>
                                <option value="KIOSKO">🖥️ Kiosko de Autoservicio</option>
                                <option value="MONITOR">📺 Monitor de Cocina</option>
                            </select>
                            {errors.tipo && <ErrorText><FiAlertCircle /> {errors.tipo.message}</ErrorText>}
                        </FormGroup>

                        <FormGroup>
                            <label>Dirección IP en Red Local</label>
                            <input {...register("ip")} placeholder="192.168.1.50" disabled={isSaving} />
                            {errors.ip && <ErrorText><FiAlertCircle /> {errors.ip.message}</ErrorText>}
                        </FormGroup>
                    </FormGrid>

                    <FormGrid>
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
                            {errors.id_estacion && <ErrorText><FiAlertCircle /> {errors.id_estacion.message}</ErrorText>}
                        </FormGroup>
                        <FormGroup>
                            <label>Estado Operativo</label>
                            <select disabled={isSaving}>
                                <option value="ACTIVO">✅ En servicio</option>
                                <option value="INACTIVO">⛔ Fuera de servicio</option>
                            </select>
                        </FormGroup>
                    </FormGrid>

                    <div style={{
                        background: "rgba(252,163,17,0.06)",
                        border: "1px solid rgba(252,163,17,0.2)",
                        borderRadius: 12, padding: "12px 16px",
                        fontSize: "0.82rem", marginBottom: 10, opacity: 0.85
                    }}>
                        💡 La <strong>dirección IP</strong> permite al sistema enviar comandos al hardware
                        (impresión, comandas de cocina). Usa una <strong>IP fija</strong> en la red local.
                    </div>

                    <SubmitBtn type="submit" disabled={isSaving}>
                        {isSaving
                            ? <BeatLoader color="#000" size={8} />
                            : <><FiCheckCircle /> {editingItem ? "Guardar Cambios" : "Registrar Dispositivo"}</>
                        }
                    </SubmitBtn>
                </form>
            </ModalContent>
        </ModalOverlay>
    );
};

export default DeviceModal;
