import React from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiUsers } from "react-icons/fi";
import {
    PageContainer, PageHeader, HeaderTitle, Toolbar, SearchBox
} from "../../../shared/components/UI";

import { useUsuarios } from "../hooks/useUsuarios";
import UsuarioTable from "../components/UsuarioTable";
import UsuarioModal from "../components/UsuarioModal";

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

const Usuario: React.FC = () => {
    const {
        isLoading,
        isSaving,
        searchTerm,
        isModalOpen,
        editingItem,
        apiError,
        statusList,
        statusMap,
        sucursales,
        sucursalMap,
        roles,
        rolMap,
        errors,
        filtered,
        setSearchTerm,
        handleOpenModal,
        handleCloseModal,
        handleDelete,
        onSubmit,
        register,
        handleSubmit
    } = useUsuarios();

    if (isLoading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <ClimbingBoxLoader color="#FCA311" size={15} />
                    <p style={{ marginTop: 20, fontWeight: 700 }}>Conectando con usuarios...</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiUsers /> Usuarios</h1>
                    <p>Administra los accesos y perfiles del personal en el sistema</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input 
                            placeholder="Nombre, email o DNI..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <SubmitBtn 
                        style={{ width: 'auto', margin: 0, padding: '12px 24px' }}
                        onClick={() => handleOpenModal()}
                    >
                        <FiPlus /> Nuevo Usuario
                    </SubmitBtn>
                </Toolbar>
            </PageHeader>

            <UsuarioTable 
                usuarios={filtered}
                sucursalMap={sucursalMap}
                rolMap={rolMap}
                statusMap={statusMap}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <UsuarioModal 
                isOpen={isModalOpen}
                isSaving={isSaving}
                editingItem={editingItem}
                apiError={apiError}
                statusList={statusList}
                sucursales={sucursales}
                roles={roles}
                register={register}
                errors={errors}
                onClose={handleCloseModal}
                onSubmit={handleSubmit as any}
                onSave={onSubmit}
            />
        </PageContainer>
    );
};

export default Usuario;
