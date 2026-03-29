// features/products/monedas/Monedas.tsx
import React from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiDollarSign } from "react-icons/fi";
import { PageContainer } from "../../../shared/components/UI";
import { useMonedaPage } from "../hooks/useMonedaPage";
import { MonedaTable } from "../components/MonedaTable";
import { MonedaModal } from "../components/MonedaModal";

/**
 * Página de gestión de Monedas.
 * Solo orquesta: conecta el hook con los componentes visuales.
 */
const Monedas: React.FC = () => {
  const {
    filteredMonedas, sucursales, sucursalMap,
    search, setSearch,
    isLoading, isSaving, isDeletingId,
    isModalOpen, editingMoneda,
    formData, setFormData,
    openModal, closeModal,
    handleSave, handleDelete,
  } = useMonedaPage();

  const isBusy = isSaving || isDeletingId !== null || isLoading;

  return (
    <PageContainer>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
            <FiDollarSign /> Monedas
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--text-tertiary, #9CA3AF)", marginTop: 5 }}>
            Configure las divisas aceptadas en su sucursal
          </p>
        </div>
        <button
          onClick={() => openModal()}
          disabled={isBusy}
          style={{
            background: "var(--accent, #FCA311)", color: "#000",
            border: "none", padding: "12px 24px",
            borderRadius: 12, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 10,
            cursor: isBusy ? "not-allowed" : "pointer",
            opacity: isBusy ? 0.6 : 1, transition: "all 0.12s",
          }}
        >
          <FiPlus size={18} /> Nueva Moneda
        </button>
      </div>

      {/* ── Barra de búsqueda ── */}
      <div style={{
        background: "var(--bg, #fff)", border: "1px solid rgba(0,0,0,0.06)",
        padding: "12px 18px", borderRadius: 14,
        display: "flex", alignItems: "center", gap: 12,
        maxWidth: 400, marginBottom: 25,
      }}>
        <FiSearch style={{ color: "var(--accent, #FCA311)" }} />
        <input
          placeholder="Buscar moneda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isBusy}
          style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 16, opacity: isBusy ? 0.6 : 1 }}
        />
      </div>

      {/* ── Contenido principal ── */}
      {isLoading && filteredMonedas.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <ClimbingBoxLoader color="#FCA311" size={25} />
        </div>
      ) : (
        <MonedaTable
          monedas={filteredMonedas}
          sucursalMap={sucursalMap}
          isDeletingId={isDeletingId}
          isSaving={isSaving}
          onEdit={openModal}
          onDelete={handleDelete}
        />
      )}

      {/* ── Modal crear / editar ── */}
      {isModalOpen && (
        <MonedaModal
          editingMoneda={editingMoneda}
          formData={formData}
          sucursales={sucursales}
          isSaving={isSaving}
          isDeletingId={isDeletingId}
          onChange={setFormData}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

    </PageContainer>
  );
};

export default Monedas;