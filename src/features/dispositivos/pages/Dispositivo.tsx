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

/* ═══════════════════════════════════════════════════════════
   STYLED COMPONENTS
═══════════════════════════════════════════════════════════ */
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

const LoaderWrap = styled.div`
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 400px; gap: 20px;
    p { font-weight: 600; opacity: 0.7; }
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
const Dispositivo: React.FC = () => {
    const {
        isLoading,
        isSaving,
        isDeletingId,
        isPinging,
        apiError,
        dispositivos,
        estaciones,
        searchTerm,
        filterTipo,
        isModalOpen,
        editingItem,
        errors,
        filtered,
        statsPerTipo,
        setSearchTerm,
        setFilterTipo,
        handleOpenModal,
        handleCloseModal,
        handleDelete,
        handlePing,
        onSubmit,
        register,
        handleSubmit
    } = useDispositivos();

    /* ═══════════ RENDER ═══════════ */
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
                    <SubmitBtn
                        type="button"
                        style={{ width: "auto", padding: "12px 20px", margin: 0 }}
                        onClick={() => handleOpenModal()}
                        disabled={!!isDeletingId || estaciones.length === 0}
                        title={estaciones.length === 0 ? "Primero debe crear al menos una estación" : "Añadir nuevo dispositivo"}
                    >
                        <FiPlus /> Nuevo Dispositivo
                    </SubmitBtn>
                </Toolbar>
            </PageHeader>

            {/* ── ERROR GLOBAL DE API ── */}
            {apiError && !isModalOpen && (
                <ApiError>
                    <FiAlertCircle /> {apiError}
                </ApiError>
            )}

            {/* ── TARJETAS DE RESUMEN ── */}
            <DeviceSummary stats={statsPerTipo} />

            {/* ── FILTROS ── */}
            <DeviceFilterBar 
                filterTipo={filterTipo} 
                onFilterChange={setFilterTipo} 
                dispositivos={dispositivos} 
            />

            {/* ── TABLA ── */}
            <DeviceTable 
                dispositivos={filtered} 
                isPinging={isPinging} 
                isDeletingId={isDeletingId} 
                onPing={handlePing} 
                onEdit={handleOpenModal} 
                onDelete={handleDelete} 
            />

            {/* ── MODAL FORMULARIO ── */}
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
