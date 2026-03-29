// ─── Estatus Feature — EstatusPage ────────────────────────────────────────────
// Página orquestadora: conecta el hook con los componentes de UI.
// No contiene lógica de negocio ni estilos propios.

import React from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiTag, FiAlertCircle } from "react-icons/fi";

import {
    PageContainer, PageHeader, HeaderTitle,
    Toolbar, SearchBox,
} from "../../../shared/components/UI";

import { useEstatus } from "../hooks/useEstatus";
import { EstatusStats } from "../components/EstatusStats";
import { ModuleGroup } from "../components/ModuleGroup";
import { EstatusModal } from "../components/EstatusModal";

// ─── Styled locales (solo los que son exclusivos de esta página) ───────────────

const LoaderWrap = styled.div`
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 400px; gap: 20px;
    p { font-weight: 600; opacity: 0.7; }
`;

const EmptyState = styled.div`
    text-align: center; padding: 60px 20px; opacity: 0.45;
    svg { font-size: 3rem; margin-bottom: 12px; display: block; margin-inline: auto; }
    p { font-size: 1rem; }
`;

const ApiError = styled.div`
    margin-bottom: 16px; padding: 12px 16px; border-radius: 12px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
    color: #ef4444; font-size: 0.88rem;
    display: flex; align-items: center; gap: 8px;
`;

const NewBtn = styled.button`
    padding: 12px 20px; border-radius: 12px; border: none;
    background: ${({ theme }) => theme.bg4};
    color: #000; font-weight: 800; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; gap: 8px; transition: all 0.2s;
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { transform: translateY(-2px); }
`;

// ─── Page ──────────────────────────────────────────────────────────────────────

const EstatusPage: React.FC = () => {
    const {
        filteredCatalog,
        tipoStats,
        isLoading,
        isSaving,
        isDeletingId,
        apiError,
        isModalOpen,
        editingItem,
        openCreate,
        openEdit,
        closeModal,
        searchTerm,
        setSearchTerm,
        form,
        handleSave,
        handleDelete,
    } = useEstatus();

    // ── Loader de carga inicial ──────────────────────────────────────────────
    if (isLoading) {
        return (
            <PageContainer>
                <LoaderWrap>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p>Cargando catálogo de estatus...</p>
                </LoaderWrap>
            </PageContainer>
        );
    }

    const groups = Object.entries(filteredCatalog);

    return (
        <PageContainer>

            {/* ── Cabecera de página ── */}
            <PageHeader>
                <HeaderTitle>
                    <h1><FiTag /> Estatus</h1>
                    <p>Catálogo de estados del sistema por módulo</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar descripción o tipo..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <NewBtn
                        onClick={openCreate}
                        disabled={!!isDeletingId}
                    >
                        <FiPlus /> Nuevo Estatus
                    </NewBtn>
                </Toolbar>
            </PageHeader>

            {/* ── Error global (solo cuando el modal está cerrado) ── */}
            {apiError && !isModalOpen && (
                <ApiError><FiAlertCircle /> {apiError}</ApiError>
            )}

            {/* ── Tarjetas de resumen por tipo ── */}
            <EstatusStats stats={tipoStats} />

            {/* ── Grupos por módulo o estado vacío ── */}
            {groups.length === 0 ? (
                <EmptyState>
                    <FiTag />
                    <p>
                        No hay estatus registrados
                        {searchTerm ? " con ese criterio" : ""}.
                    </p>
                </EmptyState>
            ) : (
                groups.map(([mdlIdStr, group]) => (
                    <ModuleGroup
                        key={mdlIdStr}
                        modulo={group.modulo || `Módulo ${mdlIdStr}`}
                        items={group.items}
                        deletingId={isDeletingId}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                ))
            )}

            {/* ── Modal crear / editar ── */}
            <EstatusModal
                open={isModalOpen}
                editingItem={editingItem}
                isSaving={isSaving}
                apiError={apiError}
                form={form}
                onClose={closeModal}
                onSave={handleSave}
            />

        </PageContainer>
    );
};

export default EstatusPage;