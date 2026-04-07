import React, { useEffect } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiUsers, FiArrowLeft, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";

// Componentes UI Compartidos
import { 
  PageContainer, PageHeader, HeaderTitle, Toolbar 
} from "../../../shared/components/UI";

// Hooks y Lógica
import { useUsuarios } from "../hooks/useUsuarios";

// Sub-componentes Locales (Refactorizados)
import UserStats from "../components/UserStats";
import UserTable from "../components/UserTable";
import UserFilters from "../components/UserFilters";
import UserForm from "../components/UserForm";

// Estilos
import { 
  ContentWrapper, 
  MainCard, 
  ActionBtn, 
  LoaderWrap 
} from "../styles/UserStyles";

/**
 * UsuariosPage - Orquestador del Módulo de Usuarios
 * 
 * Se ha refactorizado para seguir el principio de Responsabilidad Única.
 * La lógica de datos reside en useUsuarios, mientras que el renderizado
 * se delega en sub-componentes especializados.
 */
const UsuariosPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    // Estado de Datos
    paginated, filteredCount, sucursales, roles, statusList,
    sucursalMap, rolMap, statusMap,
    
    // UI State
    isLoading, isSaving, viewMode, editingItem,
    
    // Filtros y Paginación
    filters, setFilters, resetFilters,
    currentPage, totalPages, setPage,
    
    // Acciones
    openCreate, openEdit, goBack, handleDelete,
    
    // Formulario (RHF)
    register, handleSubmit, errors, watch, setValue, onSubmit
  } = useUsuarios();

  // --- Lógica de Negocio: Generación Automática de Campos ---
  const wName = watch("nombre", "");
  const wLast = watch("apellido", "");
  const wDni = watch("usu_dni", "");

  // Generación de Username automático basado en Nombre y Apellido
  useEffect(() => {
    if (viewMode === 'form' && !editingItem) {
      const timeout = setTimeout(() => {
        if (wName || wLast) {
          const firstLetter = wName.charAt(0).toLowerCase();
          const lastName = wLast.split(' ')[0].toLowerCase();
          const generated = `${firstLetter}${lastName}`
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
          
          // Solo actualizamos si el valor realmente cambió para evitar bucles
          if (watch("username") !== generated) {
            setValue("username", generated, { shouldValidate: true });
          }
        }
      }, 300); // Pequeño debounce para estabilidad
      return () => clearTimeout(timeout);
    }
  }, [wName, wLast, viewMode, !!editingItem, setValue, watch]);

  // Sincronización de PIN con DNI
  useEffect(() => {
    if (viewMode === 'form' && !editingItem && wDni) {
      const generatedPin = wDni.slice(0, 8);
      // Solo actualizamos si el valor actual es distinto para evitar bucles de re-renderizado
      if (watch("usu_pin_pos") !== generatedPin) {
        setValue("usu_pin_pos", generatedPin, { shouldValidate: true });
      }
    }
  }, [wDni, viewMode, !!editingItem, setValue, watch]);

  // --- Renderizado Condicional: Carga ---
  if (isLoading && viewMode === 'list') {
    return (
      <PageContainer>
        <LoaderWrap>
          <ClimbingBoxLoader color={theme.primary} size={15} />
          <p>Sincronizando Usuarios...</p>
        </LoaderWrap>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        {/* HEADER TECHNICAL LEDGER */}
        <PageHeader>
          <HeaderTitle>
            <h1><FiUsers /> Gestión de Colaboradores</h1>
            <p>Plataforma centralizada de accesos, roles y seguridad organizacional</p>
          </HeaderTitle>
          <Toolbar>
            {viewMode === 'list' ? (
              <>
                <ActionBtn onClick={() => navigate('/')} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid currentColor', borderRadius: '4px', background: 'transparent' }}>
                  <FiHome /> Volver al Inicio
                </ActionBtn>
                <ActionBtn $variant="primary" onClick={openCreate} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid transparent', borderRadius: '4px' }}>
                  <FiPlus /> Registrar Nuevo
                </ActionBtn>
              </>
            ) : (
              <ActionBtn onClick={goBack} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid currentColor', borderRadius: '4px', background: 'transparent' }}>
                <FiArrowLeft /> Volver al Listado
              </ActionBtn>
            )}
          </Toolbar>
        </PageHeader>

        {viewMode === 'list' ? (
          <>
            {/* SECCIÓN DE ESTADÍSTICAS */}
            <UserStats 
              total={filteredCount} 
              sucursalesCount={sucursales.length}
              rolesCount={roles.length}
            />

            {/* LISTADO PRINCIPAL */}
            <MainCard style={{ borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid rgba(150, 150, 150, 0.15)' }}>
              <UserFilters 
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
                roles={roles}
                sucursales={sucursales}
              />

              <UserTable 
                usuarios={paginated}
                rolMap={rolMap}
                statusMap={statusMap}
                sucursalMap={sucursalMap}
                onEdit={openEdit}
                onDelete={handleDelete}
              />

              {/* PAGINACIÓN */}
              <Pagination 
                current={currentPage} 
                total={totalPages} 
                onPageChange={setPage} 
                theme={theme}
              />
            </MainCard>
          </>
        ) : (
          /* FORMULARIO DE EDICIÓN/CREACIÓN */
          <MainCard style={{ borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', border: '1px solid rgba(150, 150, 150, 0.15)' }}>
            <UserForm 
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              errors={errors}
              watch={watch}
              isSaving={isSaving}
              editingItem={editingItem}
              roles={roles}
              sucursales={sucursales}
              statusList={statusList}
            />
          </MainCard>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

/**
 * Componente de Paginación Interno para limpieza visual
 */
const Pagination = ({ current, total, onPageChange, theme }: any) => (
  <div style={{ padding: 24, borderTop: `1px solid ${theme.bg3}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: 13, color: theme.texttertiary || theme.text, fontWeight: 600 }}>
      Página {current} de {total || 1}
    </span>
    <div style={{ display: 'flex', gap: 10 }}>
      <ActionBtn disabled={current === 1} onClick={() => onPageChange(current - 1)}>
        Anterior
      </ActionBtn>
      <ActionBtn disabled={current >= total} onClick={() => onPageChange(current + 1)} $variant="secondary">
        Siguiente
      </ActionBtn>
    </div>
  </div>
);

export default UsuariosPage;
