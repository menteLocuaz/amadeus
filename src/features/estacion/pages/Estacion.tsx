import React from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiMonitor } from "react-icons/fi";
import {
    PageContainer, PageHeader, HeaderTitle, Toolbar, SearchBox
} from "../../../shared/components/UI";

import { useEstaciones } from "../hooks/useEstaciones";
import EstacionStats from "../components/EstacionStats";
import EstacionTable from "../components/EstacionTable";
import EstacionModal from "../components/EstacionModal";

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

const Estacion: React.FC = () => {
    const {
        isLoading,
        isSaving,
        searchTerm,
        isModalOpen,
        editingItem,
        apiError,
        sucursales,
        sucursalMap,
        activeStatusList,
        errors,
        filtered,
        stats,
        setSearchTerm,
        handleOpenModal,
        handleCloseModal,
        handleDelete,
        onSubmit,
        register,
        handleSubmit
    } = useEstaciones();

    if (isLoading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p style={{ marginTop: 20, fontWeight: 700 }}>Conectando con estaciones POS...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiMonitor /> Estaciones POS</h1>
                    <p>Configura las terminales físicas y vincula sucursal y estatus</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input 
                            placeholder="Buscar por código o nombre..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <SubmitBtn 
                        style={{ width: 'auto', margin: 0, padding: '12px 24px' }}
                        onClick={() => handleOpenModal()}
                    >
                        <FiPlus /> Nueva Estación
                    </SubmitBtn>
                </Toolbar>
            </PageHeader>

            <EstacionStats 
                total={stats.total}
                sucursalesCount={stats.sucursales}
                activas={stats.activas}
            />

            <EstacionTable 
                estaciones={filtered}
                sucursalMap={sucursalMap}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <EstacionModal 
                isOpen={isModalOpen}
                isSaving={isSaving}
                editingItem={editingItem}
                apiError={apiError}
                sucursales={sucursales}
                activeStatusList={activeStatusList}
                register={register}
                errors={errors}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                onSave={onSubmit}
            />
        </PageContainer>
    );
};

export default Estacion;
