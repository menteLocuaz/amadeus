import React from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiMapPin } from "react-icons/fi";
import {
    PageContainer, PageHeader, HeaderTitle, Toolbar, SearchBox
} from "../../../shared/components/UI";

import { useSucursales } from "../hooks/useSucursales";
import SucursalTable from "../components/SucursalTable";
import SucursalModal from "../components/SucursalModal";

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

const Sucursal: React.FC = () => {
    const {
        isLoading,
        isSaving,
        searchTerm,
        isModalOpen,
        editingItem,
        apiError,
        statusList,
        statusMap,
        empresas,
        empresaMap,
        errors,
        filtered,
        setSearchTerm,
        handleOpenModal,
        handleCloseModal,
        handleDelete,
        onSubmit,
        register,
        handleSubmit
    } = useSucursales();

    if (isLoading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p style={{ marginTop: 20, fontWeight: 700 }}>Conectando con sucursales...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiMapPin /> Sucursales</h1>
                    <p>Gestiona las ubicaciones físicas vinculadas a cada empresa</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input 
                            placeholder="Buscar por nombre..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <SubmitBtn 
                        style={{ width: 'auto', margin: 0, padding: '12px 24px' }}
                        onClick={() => handleOpenModal()}
                    >
                        <FiPlus /> Nueva Sucursal
                    </SubmitBtn>
                </Toolbar>
            </PageHeader>

            <SucursalTable 
                sucursales={filtered}
                empresaMap={empresaMap}
                statusMap={statusMap}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <SucursalModal 
                isOpen={isModalOpen}
                isSaving={isSaving}
                editingItem={editingItem}
                apiError={apiError}
                statusList={statusList}
                empresas={empresas}
                register={register}
                errors={errors}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                onSave={onSubmit}
            />
        </PageContainer>
    );
};

export default Sucursal;
