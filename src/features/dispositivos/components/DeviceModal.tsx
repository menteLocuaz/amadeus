/**
 * DeviceModal.tsx
 * Modal de formulario para crear y editar dispositivos POS.
 *
 * Responsabilidad: renderizar el formulario controlado por react-hook-form
 * (pasado como props desde useDispositivos) y gestionar los estados visuales
 * de carga y error durante el guardado.
 *
 * Patrón de formulario:
 *   useDispositivos (hook)
 *     ├── register, errors  → control de campos
 *     ├── handleSubmit      → wrapper de validación (prop `onSubmit`)
 *     └── onSubmit          → handler real de creación/edición (prop `onSave`)
 *
 *   <form onSubmit={onSubmit(onSave)}>
 *     El doble nivel (onSubmit wrapping onSave) es el patrón estándar de RHF:
 *     handleSubmit valida primero y solo llama a onSave si no hay errores.
 *
 * Nota sobre "Estado Operativo":
 *   El select de estado operativo (ACTIVO/INACTIVO) no está registrado con RHF
 *   ni incluido en DispositivoForm. Es un placeholder visual pendiente de
 *   integración con el backend. Ver TODO al final del archivo.
 */

import React from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup } from "../../../shared/components/UI";
import type { UseFormRegister, FieldErrors, UseFormHandleSubmit } from "react-hook-form";
import type { DispositivoForm } from "../hooks/useDispositivos";
import type { Dispositivo } from "../constants/dispositivos";
import type { EstacionAPI } from "../../estacion/services/EstacionService";

// ── Styled Components ──────────────────────────────────────────────────────

/**
 * Grid de dos columnas para agrupar campos relacionados visualmente.
 * Usado para (Tipo + IP) y (Estación + Estado Operativo).
 * Sin breakpoint responsive: en pantallas pequeñas el modal tiene
 * scroll vertical, no colapsa a una columna.
 */
const FormGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
`;

/**
 * Botón de submit primario del formulario.
 * Definido localmente (no en shared UI) porque su ancho 100% y
 * margin-top son específicos del layout de este modal.
 * El box-shadow en hover usa el color del tema con opacidad 44 (hex) ≈ 27%.
 */
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

/** Mensaje de error de validación por campo (react-hook-form). */
const ErrorText = styled.span`
    color: #ff4d4d; font-size: 0.75rem; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
`;

/**
 * Banner de error de API dentro del modal.
 * Se muestra cuando apiError tiene valor Y el modal está abierto.
 * (La vista Dispositivo.tsx oculta el banner global cuando el modal está abierto
 * para evitar duplicar el mismo mensaje en dos lugares.)
 */
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

// ── Props ──────────────────────────────────────────────────────────────────

interface DeviceModalProps {
    /** Controla la visibilidad del modal. Si false, retorna null sin renderizar. */
    isOpen: boolean;

    /**
     * Dispositivo siendo editado, o null en modo creación.
     * Determina el título del modal y el label del botón de submit.
     */
    editingItem: Dispositivo | null;

    /** true mientras el handler onSave está en curso. Deshabilita todos los campos y el submit. */
    isSaving: boolean;

    /**
     * Error de API a mostrar dentro del modal.
     * Puede ser un error de creación, edición o validación del backend.
     * null si no hay error activo.
     */
    apiError: string | null;

    /** Catálogo de estaciones para el selector de vinculación. */
    estaciones: EstacionAPI[];

    /** Función register de react-hook-form para vincular inputs al formulario. */
    register: UseFormRegister<DispositivoForm>;

    /** Errores de validación por campo, provistos por react-hook-form. */
    errors: FieldErrors<DispositivoForm>;

    /** Cierra el modal y limpia el estado de edición. */
    onClose: () => void;

    /**
     * handleSubmit de react-hook-form (wrapper de validación).
     * Se invoca como: onSubmit(onSave) → valida y llama a onSave solo si no hay errores.
     */
    onSubmit: UseFormHandleSubmit<DispositivoForm>;

    /** Handler real de creación/edición. Solo se ejecuta si la validación de RHF pasa. */
    onSave: (data: DispositivoForm) => void;
}

// ── Componente ─────────────────────────────────────────────────────────────

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
    onSave,
}) => {
    // Renderizado condicional: evita montar el árbol del modal cuando está cerrado.
    // Esto también resetea el estado interno del formulario al cerrar.
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 620 }}>

                {/* ── Header: título dinámico + botón de cierre ── */}
                <ModalHeader>
                    <h2>{editingItem ? "Editar Dispositivo" : "Registrar Dispositivo"}</h2>
                    {/* Botón de cierre deshabilitado durante el guardado para evitar
                        cerrar el modal mientras la petición está en curso */}
                    <ActionBtn $variant="close" onClick={onClose} disabled={isSaving}>
                        <FiX />
                    </ActionBtn>
                </ModalHeader>

                {/* ── Error de API (solo visible cuando hay error activo) ── */}
                {apiError && (
                    <ApiError>
                        <FiAlertCircle /> {apiError}
                    </ApiError>
                )}

                {/*
                 * Patrón RHF: onSubmit(onSave)
                 *   - onSubmit = handleSubmit de RHF → ejecuta validación del schema yup
                 *   - onSave   = handler real del hook → solo se llama si la validación pasa
                 * Si hay errores de validación, RHF los inyecta en `errors` sin llamar a onSave.
                 */}
                <form onSubmit={onSubmit(onSave)}>

                    {/* ── Campo: Nombre ── */}
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

                    {/* ── Fila: Tipo de Hardware + Dirección IP ── */}
                    <FormGrid>
                        <FormGroup>
                            <label>Tipo de Hardware</label>
                            {/* Los emojis en las opciones son decorativos; no afectan el valor enviado al backend */}
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

                        <FormGroup>
                            <label>Dirección IP en Red Local</label>
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

                    {/* ── Fila: Estación POS + Estado Operativo ── */}
                    <FormGrid>
                        <FormGroup>
                            <label>Estación POS Vinculada</label>
                            {/* Array.isArray guard: previene crash si estaciones llega como undefined
                                durante la carga inicial del catálogo */}
                            <select {...register("id_estacion")} disabled={isSaving}>
                                <option value="">Seleccione Estación...</option>
                                {(Array.isArray(estaciones) ? estaciones : []).map(e => (
                                    <option key={e.id_estacion} value={e.id_estacion}>
                                        {e.nombre} ({e.codigo})
                                    </option>
                                ))}
                            </select>
                            {errors.id_estacion && (
                                <ErrorText><FiAlertCircle /> {errors.id_estacion.message}</ErrorText>
                            )}
                        </FormGroup>

                        {/*
                         * TODO: Integrar Estado Operativo con el backend
                         * Este select no está registrado con RHF ni incluido en DispositivoForm.
                         * Es un placeholder visual. Para integrarlo:
                         *   1. Agregar `estatus: yup.string().oneOf(["ACTIVO","INACTIVO"])` al schema
                         *   2. Agregar `register("estatus")` a este select
                         *   3. Incluir el campo en el DTO de DispositivoService.create/update
                         */}
                        <FormGroup>
                            <label>Estado Operativo</label>
                            <select disabled={isSaving}>
                                <option value="ACTIVO">✅ En servicio</option>
                                <option value="INACTIVO">⛔ Fuera de servicio</option>
                            </select>
                        </FormGroup>
                    </FormGrid>

                    {/* ── Nota informativa sobre IP fija ── */}
                    {/* Fondo ámbar con baja opacidad para destacar sin alarmar */}
                    <div style={{
                        background: "rgba(252,163,17,0.06)",
                        border: "1px solid rgba(252,163,17,0.2)",
                        borderRadius: 12, padding: "12px 16px",
                        fontSize: "0.82rem", marginBottom: 10, opacity: 0.85
                    }}>
                        💡 La <strong>dirección IP</strong> permite al sistema enviar comandos al hardware
                        (impresión, comandas de cocina). Usa una <strong>IP fija</strong> en la red local.
                    </div>

                    {/* ── Botón de Submit ── */}
                    {/* BeatLoader reemplaza el contenido del botón durante el guardado,
                        manteniendo el tamaño del botón estable (sin colapso de layout) */}
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

/*
 * TODO: Integrar Estado Operativo
 * El select de "Estado Operativo" (ACTIVO/INACTIVO) es actualmente un placeholder.
 * Pasos para integrarlo completamente:
 *   1. En dispositivos.ts (constants): agregar "ACTIVO" | "INACTIVO" como tipo EstadoOperativo
 *   2. En useDispositivos.ts (schema yup): agregar campo `estatus`
 *   3. En DispositivoForm (type): el campo se inferirá automáticamente del schema
 *   4. En DispositivoService: incluir `estatus` en el DTO de create y update
 *   5. Aquí: agregar {...register("estatus")} al select
 */