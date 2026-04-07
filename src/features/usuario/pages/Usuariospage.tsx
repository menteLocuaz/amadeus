import React, { useEffect } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiUsers, FiArrowLeft, FiHome, FiShield, FiActivity, FiCpu } from "react-icons/fi";
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
 * UsuariosPage - Sentinel Interface Dashboard
 * 
 * High-performance UI for user management with security-first aesthetic.
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
          
          if (watch("username") !== generated) {
            setValue("username", generated, { shouldValidate: true });
          }
        }
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [wName, wLast, viewMode, !!editingItem, setValue, watch]);

  // Sincronización de PIN con DNI
  useEffect(() => {
    if (viewMode === 'form' && !editingItem && wDni) {
      const generatedPin = wDni.slice(0, 8);
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
          <ClimbingBoxLoader color={theme.bg4 || theme.accent} size={20} />
          <p>INITIALIZING_SECURITY_PROTOCOLS...</p>
        </LoaderWrap>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        {/* SENTINEL COMMAND HEADER */}
        <PageHeader style={{ borderLeft: `4px solid ${theme.bg4 || theme.accent}`, paddingLeft: 24, marginBottom: 40 }}>
          <HeaderTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: theme.bg4 || theme.accent, letterSpacing: 4 }}>
                SEC_MODULE // 001
              </span>
              <FiShield size={14} color={theme.bg4 || theme.accent} />
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
              Directorio de Personal
            </h1>
            <p style={{ fontFamily: 'Inter', opacity: 0.6, fontSize: 14 }}>
              Registro maestro de credenciales, privilegios y auditoría de accesos.
            </p>
          </HeaderTitle>
          <Toolbar>
            {viewMode === 'list' ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <ActionBtn onClick={() => navigate('/')}>
                  <FiHome /> HOME_BASE
                </ActionBtn>
                <ActionBtn $variant="primary" onClick={openCreate}>
                  <FiPlus /> REGISTER_AGENT
                </ActionBtn>
              </div>
            ) : (
              <ActionBtn onClick={goBack}>
                <FiArrowLeft /> RETURN_TO_LIST
              </ActionBtn>
            )}
          </Toolbar>
        </PageHeader>

        {viewMode === 'list' ? (
          <>
            {/* AGENT STATS OVERVIEW */}
            <UserStats 
              total={filteredCount} 
              sucursalesCount={sucursales.length}
              rolesCount={roles.length}
            />

            {/* MASTER DATA LEDGER */}
            <MainCard>
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

              {/* PAGINATION_CONTROL */}
              <Pagination 
                current={currentPage} 
                total={totalPages} 
                onPageChange={setPage} 
                theme={theme}
              />
              
              {/* DECORATIVE SCANLINE */}
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%', pointerEvents: 'none', opacity: 0.05
              }} />
            </MainCard>
          </>
        ) : (
          /* AGENT_CONFIG_FORM */
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
             <MainCard>
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
          </div>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

/**
 * Pagination Control - Sentinel Edition
 */
const Pagination = ({ current, total, onPageChange, theme }: any) => (
  <div style={{ 
    padding: '24px 32px', 
    borderTop: `1px solid ${theme.border || '#2a2d3e'}44`, 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    background: `${theme.bg || '#0f1117'}40`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <FiCpu size={14} color={theme.bg4 || theme.accent} />
      <span style={{ 
        fontFamily: 'JetBrains Mono', 
        fontSize: 11, 
        color: theme.texttertiary || theme.text, 
        fontWeight: 700,
        textTransform: uppercase
      }}>
        PAGE_INDEX: {current.toString().padStart(2, '0')} // TOTAL_CAPACITY: {total || 1}
      </span>
    </div>
    <div style={{ display: 'flex', gap: 12 }}>
      <ActionBtn disabled={current === 1} onClick={() => onPageChange(current - 1)}>
        PREV_SEQ
      </ActionBtn>
      <ActionBtn disabled={current >= total} onClick={() => onPageChange(current + 1)} $variant="primary" style={{ padding: '10px 32px' }}>
        NEXT_SEQ
      </ActionBtn>
    </div>
  </div>
);

// Helper for inline uppercase fix (since TS might complain if not defined)
const uppercase = 'uppercase' as const;

export default UsuariosPage;
