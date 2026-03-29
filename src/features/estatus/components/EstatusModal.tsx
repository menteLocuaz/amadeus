// ─── Estatus Feature — EstatusModal ───────────────────────────────────────────
// Modal de formulario para crear y editar estatus.
// Recibe el objeto `form` completo del hook para no gestionar estado propio.

import React from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import type { UseFormReturn } from "react-hook-form";
import {
    FiX, FiCheckCircle, FiAlertCircle,
} from "react-icons/fi";

import {
    ActionBtn, FormGroup,
    ModalOverlay, ModalContent, ModalHeader,
} from "../../../shared/components/UI";

import { MODULOS, TIPO_OPTIONS, type EstatusFormValues } from "../constants";
import type { EstatusResponse } from "../services/EstatusService";

// ─── Styled locales ────────────────────────────────────────────────────────────

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
`;

const SubmitBtn = styled.button`
    width: 100%; padding: 14px; border-radius: 12px; border: none;
    background: ${({ theme }) => theme.bg4};
    color: #000; font-weight: 800; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 12px; transition: all 0.2s;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px ${({ theme }) => theme.bg4}44;
    }
`;

const ErrorText = styled.span`
    color: #ff4d4d; font-size: 0.75rem; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
`;

const ApiError = styled.div`
    margin-bottom: 16px; padding: 12px 16px; border-radius: 12px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444; font-size: 0.88rem;
    display: flex; align-items: center; gap: 8px;
`;

const Hint = styled.div`
    background: rgba(252,163,17,0.06);
    border: 1px solid rgba(252,163,17,0.2);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 0.82rem;
    margin-bottom: 8px;
    opacity: 0.85;
`;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface EstatusModalProps {
    open: boolean;
    editingItem: EstatusResponse | null;
    isSaving: boolean;
    apiError: string | null;
    form: UseFormReturn<EstatusFormValues>;
    onClose: () => void;
    onSave: (values: EstatusFormValues) => Promise<void>;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export const EstatusModal: React.FC<EstatusModalProps> = ({
    open,
    editingItem,
    isSaving,
    apiError,
    form,
    onClose,
    onSave,
}) => {
    if (!open) return null;

    const { register, handleSubmit, formState: { errors } } = form;
    const isEditing = !!editingItem;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 560 }}>

                {/* ── Cabecera ── */}
                <ModalHeader>
                    <h2>{isEditing ? "Editar Estatus" : "Nuevo Estatus"}</h2>
                    <ActionBtn $variant="close" onClick={onClose} disabled={isSaving}>
                        <FiX />
                    </ActionBtn>
                </ModalHeader>

                {/* ── Error de API ── */}
                {apiError && (
                    <ApiError><FiAlertCircle /> {apiError}</ApiError>
                )}

                {/* ── Formulario ── */}
                <form onSubmit={handleSubmit(onSave)}>

                    {/* Descripción */}
                    <FormGroup>
                        <label>Descripción del Estado</label>
                        <input
                            {...register("std_descripcion")}
                            placeholder="Ej: Orden Confirmada"
                            disabled={isSaving}
                        />
                        {errors.std_descripcion && (
                            <ErrorText>
                                <FiAlertCircle /> {errors.std_descripcion.message}
                            </ErrorText>
                        )}
                    </FormGroup>

                    {/* Tipo + Módulo en grid de 2 columnas */}
                    <FormGrid>
                        <FormGroup>
                            <label>Tipo de Estado</label>
                            <select {...register("stp_tipo_estado")} disabled={isSaving}>
                                <option value="">Seleccionar tipo...</option>
                                {TIPO_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {errors.stp_tipo_estado && (
                                <ErrorText>
                                    <FiAlertCircle /> {errors.stp_tipo_estado.message}
                                </ErrorText>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <label>Módulo del Sistema</label>
                            <select {...register("mdl_id")} disabled={isSaving}>
                                <option value="">Seleccionar módulo...</option>
                                {MODULOS.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                            </select>
                            {errors.mdl_id && (
                                <ErrorText>
                                    <FiAlertCircle /> {errors.mdl_id.message}
                                </ErrorText>
                            )}
                        </FormGroup>
                    </FormGrid>

                    {/* Hint informativo */}
                    <Hint>
                        💡 El <strong>Tipo de Estado</strong> define el comportamiento visual
                        y lógico en toda la plataforma. Usa <strong>ACTIVO</strong> para estados
                        operativos.
                    </Hint>

                    {/* Botón de submit */}
                    <SubmitBtn type="submit" disabled={isSaving}>
                        {isSaving
                            ? <BeatLoader color="#000" size={8} />
                            : <><FiCheckCircle /> {isEditing ? "Guardar Cambios" : "Crear Estatus"}</>
                        }
                    </SubmitBtn>
                </form>

            </ModalContent>
        </ModalOverlay>
    );
};