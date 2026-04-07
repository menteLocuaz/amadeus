import React, { memo } from "react";
import styled, { keyframes } from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiX, FiCheckCircle, FiAlertCircle, FiBriefcase, FiLayers, FiTerminal } from "react-icons/fi";
import { type UseFormRegister, type FieldErrors, type UseFormHandleSubmit } from "react-hook-form";
import { type SucursalForm } from "../constants/sucursales";
import { type SucursalAPI } from "../services/SucursalService";
import { type EmpresaAPI } from "../../empresa/services/EmpresaService";

/* ------------------------------ Animations ------------------------------ */
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

/* ------------------------------ Styled UI ------------------------------- */
const ConsoleOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
`;

const TerminalContent = styled.div`
    width: 100%;
    max-width: 550px;
    background: ${({ theme }) => theme.bg};
    border: 1px solid ${({ theme }) => theme.bg3}44;
    border-radius: 8px;
    overflow: hidden;
    animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
    position: relative;

    &::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; height: 2px;
        background: ${({ theme }) => theme.bg4};
    }
`;

const TerminalHeader = styled.div`
    padding: 24px 30px;
    background: ${({ theme }) => theme.bg2}30;
    border-bottom: 1px solid ${({ theme }) => theme.bg3}22;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-group {
        display: flex;
        flex-direction: column;
        gap: 4px;

        h2 {
            margin: 0;
            font-family: "Space Grotesk", sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            color: ${({ theme }) => theme.text};
        }

        span {
            font-family: "JetBrains Mono", monospace;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: ${({ theme }) => theme.bg4};
            opacity: 0.7;
        }
    }
`;

const CloseBtn = styled.button`
    all: unset;
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.text}44;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #EF4444;
    }
`;

const FormBody = styled.form`
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const TechFormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
        font-family: "JetBrains Mono", monospace;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: ${({ theme }) => theme.text}88;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    input, select {
        background: ${({ theme }) => theme.bg2}80;
        border: 1px solid ${({ theme }) => theme.bg3}44;
        padding: 14px 16px;
        border-radius: 4px;
        color: ${({ theme }) => theme.text};
        font-family: "Inter", sans-serif;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        outline: none;

        &:focus {
            border-color: ${({ theme }) => theme.bg4};
            background: ${({ theme }) => theme.bg};
            box-shadow: 0 0 15px ${({ theme }) => theme.bg4}15;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    .error-msg {
        font-family: "JetBrains Mono", monospace;
        font-size: 0.65rem;
        color: #EF4444;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 4px;
    }
`;

const DeployBtn = styled.button`
    all: unset;
    cursor: pointer;
    background: ${({ theme }) => theme.bg4};
    color: ${({ theme }) => theme.bg};
    padding: 16px;
    border-radius: 4px;
    font-family: "Space Grotesk", sans-serif;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.95rem;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 10px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px ${({ theme }) => theme.bg4}30;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const StatusBanner = styled.div<{ $type: 'error' | 'info' }>`
    background: ${({ $type }) => $type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(252, 163, 17, 0.1)'};
    padding: 14px 20px;
    border-radius: 4px;
    border-left: 3px solid ${({ $type }) => $type === 'error' ? '#EF4444' : '#FCA311'};
    color: ${({ $type }) => $type === 'error' ? '#EF4444' : '#FCA311'};
    font-family: "JetBrains Mono", monospace;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 12px;
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
        <ConsoleOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
            <TerminalContent>
                <TerminalHeader>
                    <div className="title-group">
                        <span>DATA_ENTRY_NODE_INIT //</span>
                        <h2>{editingItem ? "Modificar Sucursal" : "Configurar Nueva Sucursal"}</h2>
                    </div>
                    <CloseBtn onClick={onClose} disabled={isSaving}>
                        <FiX size={20} />
                    </CloseBtn>
                </TerminalHeader>

                <FormBody onSubmit={onSubmit(onSave)}>
                    {apiError && (
                        <StatusBanner $type="error">
                            <FiAlertCircle size={18} />
                            <div>{apiError}</div>
                        </StatusBanner>
                    )}

                    <TechFormGroup>
                        <label><FiBriefcase size={12} /> ID_EMPRESA_MATRIZ</label>
                        <select {...register("id_empresa")} disabled={isSaving}>
                            <option value="">-- SELECCIONAR_ASIGNACION --</option>
                            {(Array.isArray(empresas) ? empresas : []).map(e => (
                                <option key={e.id} value={e.id}>{e.nombre}</option>
                            ))}
                        </select>
                        {errors.id_empresa && (
                            <p className="error-msg"><FiAlertCircle /> {errors.id_empresa.message}</p>
                        )}
                    </TechFormGroup>

                    <TechFormGroup>
                        <label><FiTerminal size={12} /> NOMBRE_REGISTRO_NODO</label>
                        <input 
                            {...register("nombre_sucursal")} 
                            placeholder="EJ. SEDE_OPERATIVA_ALPHA" 
                            autoComplete="off"
                            disabled={isSaving} 
                        />
                        {errors.nombre_sucursal && (
                            <p className="error-msg"><FiAlertCircle /> {errors.nombre_sucursal.message}</p>
                        )}
                    </TechFormGroup>

                    <TechFormGroup>
                        <label><FiLayers size={12} /> STATUS_OPERATIVO</label>
                        <select {...register("id_status")} disabled={isSaving}>
                            <option value="">-- SELECCIONAR_NIVEL_ACCESO --</option>
                            {(Array.isArray(statusList) ? statusList : []).map(s => (
                                <option key={s.id_status} value={s.id_status}>
                                    {s.std_descripcion || s.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.id_status && (
                            <p className="error-msg"><FiAlertCircle /> {errors.id_status.message}</p>
                        )}
                    </TechFormGroup>

                    <DeployBtn type="submit" disabled={isSaving}>
                        {isSaving 
                            ? <BeatLoader size={8} color="#000" /> 
                            : <><FiCheckCircle size={18} /> {editingItem ? "CONFIRMAR_CAMBIOS" : "DESPLEGAR_NODO"}</>
                        }
                    </DeployBtn>
                </FormBody>
            </TerminalContent>
        </ConsoleOverlay>
    );
});

export default SucursalModal;
