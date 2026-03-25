/**
 * Dispositivo.tsx
 * Vista principal del módulo de gestión de Dispositivos POS.
 *
 * Responsabilidad única: orquestar el render de los sub-componentes
 * y conectarlos con el estado y handlers provistos por useDispositivos.
 * No contiene lógica de negocio propia.
 *
 * Arquitectura del módulo:
 *  useDispositivos (hook)     → estado, CRUD, filtros, ping
 *       ↓
 *  Dispositivo (esta vista)   → layout y composición
 *       ↓
 *  ├── DeviceSummary          → tarjetas de resumen por tipo de dispositivo
 *  ├── DeviceFilterBar        → filtros por tipo (teclado, impresora, etc.)
 *  ├── DeviceTable            → tabla con acciones por fila (ping, editar, eliminar)
 *  └── DeviceModal            → formulario de creación/edición
 */

import React from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiAlertCircle, FiCpu } from "react-icons/fi";
import {
    PageContainer, PageHeader, HeaderTitle, Toolbar, SearchBox
} from "../../../shared/components/UI";

import { useDispositivos } from "../hooks/useDispositivos";
import DeviceSummary from "../components/DeviceSummary";
import DeviceFilterBar from "../components/DeviceFilterBar";
import DeviceTable from "../components/DeviceTable";
import DeviceModal from "../components/DeviceModal";

// ── Styled Components ──────────────────────────────────────────────────────

/**
 * Botón de acción primaria reutilizado en el header.
 * Definido aquí (y no en el shared UI) porque su uso es específico
 * de esta vista. El box-shadow en hover usa el color del tema con
 * opacidad hexadecimal (44 = ~27%) para un efecto de glow sutil.
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

/**
 * Banner de error de API para errores globales (fuera del modal).
 * Se muestra solo cuando hay un error Y el modal está cerrado,
 * evitando duplicar el mensaje que ya aparece dentro del modal.
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

/**
 * Contenedor del estado de carga inicial.
 * min-height: 400px garantiza que el loader esté centrado verticalmente
 * en la pantalla sin colapsar el layout durante la carga.
 */
const LoaderWrap = styled.div`
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 400px; gap: 20px;
    p { font-weight: 600; opacity: 0.7; }
`;

// ── Componente Principal ───────────────────────────────────────────────────

const Dispositivo: React.FC = () => {

    /**
     * Toda la lógica del módulo proviene de useDispositivos.
     * Este componente solo consume el estado y los handlers;
     * no tiene useState, useEffect ni llamadas a servicios propios.
     */
    const {
        // Estados de carga
        isLoading,      // Carga inicial de la lista completa
        isSaving,       // Guardado en curso (crear/editar en el modal)
        isDeletingId,   // ID del dispositivo siendo eliminado (null si ninguno)
        isPinging,      // ID del dispositivo siendo pinguado (null si ninguno)

        // Datos y catálogos
        apiError,
        dispositivos,
        estaciones,     // Catálogo de estaciones para el selector del modal
        sucursalMap,    // id_sucursal → nombre (para resolución en la tabla)
        estacionMap,    // id_estacion → nombre (para resolución en la tabla)

        // Búsqueda y filtros
        searchTerm,
        filterTipo,
        setSearchTerm,
        setFilterTipo,

        // Modal
        isModalOpen,
        editingItem,
        handleOpenModal,
        handleCloseModal,

        // CRUD y acciones
        handleDelete,
        handlePing,
        onSubmit,

        // Datos derivados
        filtered,       // Lista filtrada por searchTerm + filterTipo
        statsPerTipo,   // Conteo de dispositivos agrupado por tipo

        // Formulario (react-hook-form)
        errors,
        register,
        handleSubmit,
    } = useDispositivos();

    // ── Estado de Carga Inicial ────────────────────────────────────────────
    /**
     * Reemplaza el layout completo durante la carga inicial.
     * El mensaje "Escaneando red..." contextualiza la espera para el usuario
     * en términos del dominio (dispositivos de red), no en términos técnicos.
     */
    if (isLoading) {
        return (
            <PageContainer>
                <LoaderWrap>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p>Escaneando red de dispositivos...</p>
                </LoaderWrap>
            </PageContainer>
        );
    }

    // ── Render Principal ───────────────────────────────────────────────────
    return (
        <PageContainer>

            {/* ── HEADER ── */}
            <PageHeader>
                <HeaderTitle>
                    <h1><FiCpu /> Dispositivos POS</h1>
                    <p>Hardware físico vinculado a las estaciones de venta</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar por nombre, IP o estación..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>

                    {/*
                     * Botón "Nuevo Dispositivo":
                     *  - Deshabilitado si hay una eliminación en curso (isDeletingId)
                     *    para evitar abrir el modal mientras la tabla está en transición.
                     *  - Deshabilitado si no hay estaciones creadas, ya que un dispositivo
                     *    requiere estar vinculado a una estación (FK obligatoria).
                     *  - El `title` cambia dinámicamente para explicar el motivo del bloqueo.
                     */}
                    <SubmitBtn
                        type="button"
                        style={{ width: "auto", padding: "12px 20px", margin: 0 }}
                        onClick={() => handleOpenModal()}
                        disabled={!!isDeletingId || estaciones.length === 0}
                        title={
                            estaciones.length === 0
                                ? "Primero debe crear al menos una estación"
                                : "Añadir nuevo dispositivo"
                        }
                    >
                        <FiPlus /> Nuevo Dispositivo
                    </SubmitBtn>
                </Toolbar>
            </PageHeader>

            {/*
             * ── ERROR GLOBAL DE API ──
             * Visible solo cuando hay error Y el modal está cerrado.
             * Cuando el modal está abierto, el error se muestra dentro de él
             * (en DeviceModal) para no duplicar el mensaje.
             */}
            {apiError && !isModalOpen && (
                <ApiError>
                    <FiAlertCircle /> {apiError}
                </ApiError>
            )}

            {/* ── TARJETAS DE RESUMEN ──
                statsPerTipo: conteo de dispositivos agrupado por tipo
                (ej: { IMPRESORA: 3, LECTOR: 2, PANTALLA: 1 }) */}
            <DeviceSummary stats={statsPerTipo} />

            {/* ── FILTROS POR TIPO ──
                Recibe la lista completa (dispositivos) para calcular
                los conteos de cada tipo en los botones de filtro */}
            <DeviceFilterBar
                filterTipo={filterTipo}
                onFilterChange={setFilterTipo}
                dispositivos={dispositivos}
            />

            {/* ── TABLA DE DISPOSITIVOS ──
                Recibe `filtered` (no `dispositivos`) para mostrar
                solo los resultados que coinciden con búsqueda y filtro activo */}
            <DeviceTable
                dispositivos={filtered}
                isPinging={isPinging}
                isDeletingId={isDeletingId}
                onPing={handlePing}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                sucursalMap={sucursalMap}
                estacionMap={estacionMap}
            />

            {/* ── MODAL DE FORMULARIO ──
                onSubmit = handleSubmit de RHF (wrapper de validación)
                onSave   = onSubmit del hook (handler real de creación/edición) */}
            <DeviceModal
                isOpen={isModalOpen}
                editingItem={editingItem}
                isSaving={isSaving}
                apiError={apiError}
                estaciones={estaciones}
                register={register}
                errors={errors}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                onSave={onSubmit}
            />
        </PageContainer>
    );
};

export default Dispositivo;