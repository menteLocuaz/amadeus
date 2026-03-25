/**
 * EstacionModal.tsx
 * Componente modal para crear y editar estaciones (terminales POS).
 *
 * Es un componente de presentación puro: no gestiona estado propio ni
 * realiza llamadas a la API. Toda la lógica reside en useEstaciones.ts,
 * que provee los handlers y el estado a través de props.
 *
 * Optimización:
 *  - Envuelto en React.memo para evitar re-renders cuando el componente
 *    padre actualiza estado no relacionado con este modal.
 *  - El guard `if (!isOpen) return null` desmonta el DOM del modal cuando
 *    está cerrado, liberando memoria y evitando efectos secundarios.
 */

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

// ── Styled Components ──────────────────────────────────────────────────────

/**
 * Botón de envío del formulario.
 * Usa theme.bg4 como color de fondo para mantener consistencia con el
 * sistema de diseño global sin hardcodear un color específico.
 * El estado disabled reduce la opacidad y bloquea el cursor para
 * indicar visualmente que el formulario está procesándose.
 */
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

// ── Props ──────────────────────────────────────────────────────────────────

interface EstacionModalProps {
    isOpen: boolean;                              // Controla visibilidad; false → desmonta el DOM
    isSaving: boolean;                            // Deshabilita inputs y botones durante el guardado
    editingItem: EstacionAPI | null;              // null → modo creación; objeto → modo edición
    apiError: string | null;                      // Mensaje de error del backend para mostrar en el modal
    sucursales: any[];                            // Catálogo de sucursales para el selector
    activeStatusList: any[];                      // Estados filtrados válidos para una estación POS
    register: UseFormRegister<EstacionForm>;      // Registra inputs en react-hook-form
    errors: FieldErrors<EstacionForm>;            // Errores de validación por campo
    onClose: () => void;                          // Cierra el modal y limpia el estado de edición
    onSubmit: UseFormHandleSubmit<EstacionForm>;  // Wrapper de RHF que valida antes de llamar a onSave
    onSave: (data: EstacionForm) => void;         // Handler real de creación/actualización
}

// ── Componente ─────────────────────────────────────────────────────────────

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
    /**
     * Guard de visibilidad: desmonta el DOM completo cuando el modal está cerrado.
     * Esto garantiza que el formulario se reinicie correctamente al reabrirse,
     * ya que react-hook-form reinicializa su estado interno al montar el componente.
     */
    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 550 }}>
                <ModalHeader>
                    {/* Título dinámico según el modo: creación o edición */}
                    <h2>{editingItem ? "Editar Terminal" : "Registrar Terminal POS"}</h2>

                    {/* Botón de cierre deshabilitado durante el guardado para evitar
                        cerrar el modal mientras la petición está en curso */}
                    <ActionBtn $variant="close" onClick={onClose} disabled={isSaving}>
                        <FiX />
                    </ActionBtn>
                </ModalHeader>

                {/* Banner de error de API: visible solo cuando hay un error del backend.
                    Se muestra dentro del modal para que el usuario no pierda los datos
                    ingresados al tener que reabrir el formulario. */}
                {apiError && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 10,
                        color: '#EF4444', marginBottom: 15, fontSize: '0.88rem',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <FiAlertCircle /> {apiError}
                    </div>
                )}

                {/*
                  * onSubmit(onSave): patrón de react-hook-form donde onSubmit es el
                  * wrapper que ejecuta la validación del esquema yup ANTES de llamar
                  * a onSave. Si la validación falla, onSave nunca se ejecuta y los
                  * errores se muestran en los campos correspondientes.
                  */}
                <form onSubmit={onSubmit(onSave)}>

                    {/* Fila 1: Código (1/3) + Nombre (2/3) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 15 }}>
                        <FormGroup>
                            <label>Código</label>
                            <input {...register("codigo")} placeholder="POS-01" disabled={isSaving} />
                            {errors.codigo && (
                                <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.codigo.message}</p>
                            )}
                        </FormGroup>
                        <FormGroup>
                            <label>Nombre Comercial / Ubicación</label>
                            <input {...register("nombre")} placeholder="Caja Principal Pasillo A" disabled={isSaving} />
                            {errors.nombre && (
                                <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.nombre.message}</p>
                            )}
                        </FormGroup>
                    </div>

                    {/* Campo IP con ícono decorativo posicionado absolutamente dentro del input */}
                    <FormGroup>
                        <label>Dirección IP Fija</label>
                        <div style={{ position: 'relative' }}>
                            {/* FiGlobe es decorativo (no interactivo); el paddingLeft del input
                                evita que el texto se superponga con el ícono */}
                            <FiGlobe style={{
                                position: 'absolute', left: 12, top: '50%',
                                transform: 'translateY(-50%)', opacity: 0.4
                            }} />
                            <input
                                {...register("ip")}
                                placeholder="192.168.1.10"
                                style={{ paddingLeft: 35 }}
                                disabled={isSaving}
                            />
                        </div>
                        {errors.ip && (
                            <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.ip.message}</p>
                        )}
                    </FormGroup>

                    {/* Fila 2: Sucursal + Estatus (columnas iguales) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <FormGroup>
                            <label>Sucursal</label>
                            {/* Array.isArray guard: previene errores si el catálogo aún no cargó */}
                            <select {...register("id_sucursal")} disabled={isSaving}>
                                <option value="">Seleccione...</option>
                                {(Array.isArray(sucursales) ? sucursales : []).map(s => (
                                    // Doble fallback de key y value por inconsistencias del backend
                                    <option key={s.id || s.id_sucursal} value={s.id || s.id_sucursal}>
                                        {s.nombre_sucursal || s.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.id_sucursal && (
                                <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.id_sucursal.message}</p>
                            )}
                        </FormGroup>
                        <FormGroup>
                            <label>Estatus Inicial</label>
                            <select {...register("id_status")} disabled={isSaving}>
                                <option value="">Seleccione...</option>
                                {(Array.isArray(activeStatusList) ? activeStatusList : []).map(s => (
                                    <option key={s.id_status} value={s.id_status}>
                                        {/* Triple fallback: descripción estándar → nombre → literal de seguridad */}
                                        {s.std_descripcion || s.nombre || 'Estatus desconocido'}
                                    </option>
                                ))}
                            </select>
                            {errors.id_status && (
                                <p style={{ color: '#EF4444', fontSize: '0.75rem' }}>{errors.id_status.message}</p>
                            )}
                        </FormGroup>
                    </div>

                    {/* Botón de envío: muestra BeatLoader durante el guardado
                        y el label dinámico (Crear/Actualizar) cuando está inactivo */}
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