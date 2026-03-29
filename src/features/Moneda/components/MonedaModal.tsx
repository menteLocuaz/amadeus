// features/products/monedas/components/MonedaModal.tsx
import React from "react";
import { FiX } from "react-icons/fi";
import { type Moneda } from "../services/MonedaService";
import { type MonedaFormData } from "../hooks/useMonedaPage";
import { ModalOverlay, ModalContent, FormGroup, ActionBtn } from "../../../shared/components/UI";

interface Props {
  editingMoneda: Moneda | null;
  formData:      MonedaFormData;
  sucursales:    any[];
  isSaving:      boolean;
  isDeletingId:  string | null;
  onChange:      (data: MonedaFormData) => void;
  onSave:        () => void;
  onClose:       () => void;
}

/**
 * Modal para crear o editar una moneda.
 * Incluye campos de nombre y selector de sucursal.
 */
export const MonedaModal: React.FC<Props> = ({
  editingMoneda, formData, sucursales,
  isSaving, isDeletingId,
  onChange, onSave, onClose,
}) => {
  const isEditing = Boolean(editingMoneda);
  const isBusy    = isSaving || isDeletingId !== null;

  return (
    <ModalOverlay>
      <ModalContent>
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>
            {isEditing ? "Editar Moneda" : "Nueva Moneda"}
          </h2>
          <ActionBtn $variant="close" onClick={onClose} disabled={isBusy}>
            <FiX size={20} />
          </ActionBtn>
        </div>

        {/* Campo: Nombre */}
        <FormGroup>
          <label>Nombre de la Moneda</label>
          <input
            placeholder="Ej: Peso Mexicano, Dólar..."
            value={formData.nombre}
            onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
            disabled={isBusy}
            autoFocus
            required
          />
        </FormGroup>

        {/* Campo: Sucursal */}
        <FormGroup>
          <label>Sucursal</label>
          <select
            value={formData.id_sucursal}
            onChange={(e) => onChange({ ...formData, id_sucursal: e.target.value })}
            disabled={isBusy}
            required
            style={{
              width: "100%", padding: "12px", borderRadius: "10px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "inherit", outline: "none",
            }}
          >
            <option value="">Seleccione Sucursal</option>
            {sucursales.map((s) => (
              <option key={s.id_sucursal} value={s.id_sucursal}>
                {s.nombre_sucursal}
              </option>
            ))}
          </select>
        </FormGroup>

        {/* Botones */}
        <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
          <button
            onClick={onClose}
            disabled={isBusy}
            style={{ flex: 1, padding: 12, borderRadius: 12, fontWeight: 700, border: "none", background: "rgba(255,255,255,0.05)", cursor: isBusy ? "not-allowed" : "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isBusy}
            style={{ flex: 1, padding: 12, borderRadius: 12, fontWeight: 700, border: "none", background: "var(--accent, #FCA311)", color: "#000", cursor: isBusy ? "not-allowed" : "pointer" }}
          >
            {isSaving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Moneda"}
          </button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};