import React from "react";
import { FormProvider } from "react-hook-form";
import { FiSearch, FiPlus, FiCpu } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";

// Componentes UI Shared
import { PageContainer, PageHeader, HeaderTitle, Toolbar, SearchBox } from "../../../shared/components/UI";

// Hooks Especializados
import { useDispositivosData } from "../hooks/useDispositivosData";
import { useDispositivosUI } from "../hooks/useDispositivosUI";

// Sub-componentes
import DeviceSummary from "../components/DeviceSummary";
import DeviceFilterBar from "../components/DeviceFilterBar";
import DeviceTable from "../components/DeviceTable";
import DeviceModal from "../components/DeviceModal";
import { ActionBtn, LoaderWrap } from "../../../features/usuario/styles/UserStyles"; // Reutilizando estilos base

const DispositivoPage: React.FC = () => {
    // 1. Hook de Datos (Capa de Red/Servidor)
    const { 
        dispositivos: raw, estaciones, isLoading, save, isSaving, remove, deletingId 
    } = useDispositivosData();

    // 2. Hook de UI (Capa de Interfaz)
    const { methods, ui } = useDispositivosUI(raw, estaciones);

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

    // Handler de guardado unificado
    const onSave = async (data: any) => {
        await save({ id: ui.editingItem?.id_dispositivo, data });
        ui.closeModal();
    };

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiCpu /> Dispositivos POS</h1>
                    <p>Hardware físico vinculado a las estaciones de venta</p>
                </HeaderTitle>
                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar dispositivo o IP..."
                            value={ui.searchTerm}
                            onChange={e => ui.setSearchTerm(e.target.value)}
                        />
                    </SearchBox>
                    <ActionBtn 
                        $variant="primary" 
                        onClick={() => ui.openModal()}
                        disabled={estaciones.length === 0}
                        title={estaciones.length === 0 ? "Primero cree una estación" : ""}
                    >
                        <FiPlus /> Nuevo Dispositivo
                    </ActionBtn>
                </Toolbar>
            </PageHeader>

            <DeviceSummary stats={ui.stats} />

            <DeviceFilterBar
                filterTipo={ui.filterTipo}
                onFilterChange={ui.setFilterTipo}
                dispositivos={ui.dispositivos}
            />

            <DeviceTable
                dispositivos={ui.filtered}
                isPinging={ui.isPinging}
                isDeletingId={deletingId as string}
                onPing={ui.ping}
                onEdit={ui.openModal}
                onDelete={remove}
                sucursalMap={ui.sucursalMap}
                estacionMap={ui.estacionMap}
            />

            {/* FORM PROVIDER: Inyecta el contexto de react-hook-form a los componentes hijos */}
            <FormProvider {...methods}>
                <DeviceModal
                    isOpen={ui.isModalOpen}
                    editingItem={ui.editingItem}
                    isSaving={isSaving}
                    estaciones={estaciones}
                    onClose={ui.closeModal}
                    onSave={methods.handleSubmit(onSave)}
                />
            </FormProvider>
        </PageContainer>
    );
};

export default DispositivoPage;
