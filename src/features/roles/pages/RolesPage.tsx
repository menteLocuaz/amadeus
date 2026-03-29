// ─── Roles Feature — RolesPage ────────────────────────────────────────────────
// Página orquestadora: conecta el hook con los componentes de UI.
// No contiene lógica de negocio — eso vive en useRoles.
// No contiene estilos propios — eso vive en shared/components/UI.

import React from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiRefreshCcw, FiShield } from "react-icons/fi";

import {
    PageContainer,
    TableCard,
    PageHeader,
    HeaderTitle,
    Toolbar,
    ActionBtn,
    Button,
} from "../../../shared/components/UI";

import { useRoles }    from "../hooks/useRoles";
import { RolesTable }  from "../components/RolesTable";
import { RolModal }    from "../components/RolModal";

// ─── Page ──────────────────────────────────────────────────────────────────────

const RolesPage: React.FC = () => {
    const {
        // Datos
        roles,
        sucursales,
        estatusList,

        // Estados de carga
        isLoading,
        isSaving,
        isDeletingId,

        // Modal
        modal,
        openCreate,
        openEdit,
        closeModal,
        setField,
        handleSave,
        handleDelete,

        // Helpers
        loadData,
        getSucursalNombre,
        getEstatus,
    } = useRoles();

    // Cualquier operación asíncrona en curso → bloquea botones de fila
    const isBusy = isSaving || isDeletingId !== null;

    return (
        <PageContainer>

            {/* ── Cabecera de página ── */}
            <PageHeader>
                <HeaderTitle>
                    <h1><FiShield color="#FCA311" /> Gestión de Roles</h1>
                    <p>Define perfiles de acceso y asígnalos a sucursales.</p>
                </HeaderTitle>

                <Toolbar>
                    <ActionBtn
                        onClick={loadData}
                        disabled={isLoading}
                        title="Actualizar lista"
                    >
                        {/* La clase "spin" activa la animación de rotación */}
                        <FiRefreshCcw className={isLoading ? "spin" : ""} />
                    </ActionBtn>

                    <Button onClick={openCreate} disabled={isBusy}>
                        <FiPlus /> Nuevo Rol
                    </Button>
                </Toolbar>
            </PageHeader>

            {/* ── Tabla de roles ── */}
            <TableCard>
                {isLoading ? (
                    // Loader centrado solo en la carga inicial
                    <div style={{
                        padding:        100,
                        display:        "flex",
                        flexDirection:  "column",
                        alignItems:     "center",
                        gap:            20,
                    }}>
                        <ClimbingBoxLoader color="#FCA311" />
                        <p style={{ opacity: 0.5 }}>Cargando roles...</p>
                    </div>
                ) : (
                    <RolesTable
                        roles={roles}
                        isDeletingId={isDeletingId}
                        isBusy={isBusy}
                        getSucursalNombre={getSucursalNombre}
                        getEstatus={getEstatus}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                )}
            </TableCard>

            {/* ── Modal crear / editar ── */}
            <RolModal
                open={modal.open}
                isEditing={modal.isEditing}
                isSaving={isSaving}
                form={modal.form}
                errors={modal.errors}
                sucursales={sucursales}
                estatusList={estatusList}
                onClose={closeModal}
                onSave={handleSave}
                setField={setField}
            />

        </PageContainer>
    );
};

export default RolesPage;