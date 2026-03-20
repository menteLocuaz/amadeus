import React from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiBriefcase } from "react-icons/fi";
import {
    PageContainer, PageHeader, HeaderTitle, Toolbar, SearchBox
} from "../../../shared/components/UI";

import { useEmpresas } from "../hooks/useEmpresas";
import EmpresaTable from "../components/EmpresaTable";
import EmpresaModal from "../components/EmpresaModal";

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

const Empresa: React.FC = () => {
    const {
        isLoading,
        isSaving,
        searchTerm,
        isModalOpen,
        editingItem,
        apiError,
        statusList,
        statusMap,
        errors,
        filtered,
        setSearchTerm,
        handleOpenModal,
        handleCloseModal,
        handleDelete,
        onSubmit,
        register,
        handleSubmit
    } = useEmpresas();

    if (isLoading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p style={{ marginTop: 20, fontWeight: 700 }}>Conectando con empresas...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiBriefcase /> Empresas</h1>
                    <p>Administra los datos fiscales y el estatus de las empresas del sistema</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input 
                            placeholder="Buscar por nombre o RUT..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <SubmitBtn 
                        style={{ width: 'auto', margin: 0, padding: '12px 24px' }}
                        onClick={() => handleOpenModal()}
                    >
                        <FiPlus /> Nueva Empresa
                    </SubmitBtn>
                </Toolbar>
            </PageHeader>

            <EmpresaTable 
                empresas={filtered}
                statusMap={statusMap}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <EmpresaModal 
                isOpen={isModalOpen}
                isSaving={isSaving}
                editingItem={editingItem}
                apiError={apiError}
                statusList={statusList}
                register={register}
                errors={errors}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                onSave={onSubmit}
            />
        </PageContainer>
    );
};

export default Empresa;
