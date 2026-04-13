// features/products/categories/Categoria.tsx
import React from "react";
import { useTheme } from "styled-components";
import { FiPlus, FiSearch, FiTag } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";

import { PageContainer } from "../../../shared/components/UI";
import { useCategoriaPage } from "../hooks/useCategoriaPage";
import { SucursalSelector } from "../components/SucursalSelector";
import { CategoriaTable } from "../components/CategoriaTable";
import { CategoriaModal } from "../components/CategoriaModal";

/**
 * Página de gestión de Categorías.
 * Este componente actúa como orquestador: solo conecta el hook
 * con los componentes visuales. No contiene lógica de negocio.
 */
export const Categoria: React.FC = () => {
  const theme = useTheme();
  const {
    user, sucursales, sucursalMap, statusList,
    search, setSearch,
    isLoading, isSaving, isDeletingId,
    isModalOpen, editingCategory,
    formData, setFormData,
    filteredCategories,
    handleOpenModal, handleCloseModal,
    handleSave, handleDelete, handleStatusChange, handleSelectSucursal,
  } = useCategoriaPage();

  return (
    <PageContainer>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
        {/* Título */}
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: theme.primary, display: "flex", alignItems: "center", gap: 12 }}>
            <FiTag /> Categorías
          </h1>
          <p style={{ fontSize: "0.95rem", color: theme.texttertiary, marginTop: 5 }}>
            Gestiona los grupos de productos de tu sucursal
          </p>
        </div>

        {/* Controles del header */}
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          {/* Selector de sucursal global */}
          <SucursalSelector
            sucursales={sucursales}
            selectedId={user?.id_sucursal ?? ""}
            onSelect={handleSelectSucursal}
          />
          {/* Botón nueva categoría */}
          <button
            onClick={() => handleOpenModal()}
            disabled={isLoading}
            style={{
              background: theme.primary, color: theme.bg,
              border: "none", padding: "12px 24px",
              borderRadius: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 10,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            <FiPlus /> Nueva Categoría
          </button>
        </div>
      </div>

      {/* ── Barra de búsqueda ── */}
      <div style={{
        background: theme.bg, border: `1px solid ${theme.bg2}`,
        padding: "12px 18px", borderRadius: 14,
        display: "flex", alignItems: "center", gap: 12,
        maxWidth: 400, marginBottom: 25,
      }}>
        <FiSearch style={{ color: theme.primary }} />
        <input
          placeholder="Buscar en esta sucursal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", outline: "none", background: "transparent", color: theme.text, width: "100%" }}
        />
      </div>

      {/* ── Contenido principal ── */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <ClimbingBoxLoader color={theme.primary} size={20} />
        </div>
      ) : (
        <CategoriaTable
          categories={filteredCategories}
          sucursalMap={sucursalMap}
          statusList={statusList}
          isDeletingId={isDeletingId}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── Modal crear / editar ── */}
      {isModalOpen && (
        <CategoriaModal
          editingCategory={editingCategory}
          formData={formData}
          sucursales={sucursales}
          statusList={statusList}
          isSaving={isSaving}
          onChange={setFormData}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}

    </PageContainer>
  );
};

export default Categoria;
