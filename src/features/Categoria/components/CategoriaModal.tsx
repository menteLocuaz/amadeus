// features/products/categories/components/CategoriaModal.tsx
import React from "react";
import { useTheme } from "styled-components";
import { FiX } from "react-icons/fi";
import { type Category } from "../../products/services/CategoryService";
import { type CategoryFormData } from "../hooks/useCategoriaPage";
import { type StatusItem } from "../../../shared/store/useCatalogStore";
import { ModalOverlay, ModalContent, FormGroup, ActionBtn } from "../../../shared/components/UI";

interface Props {
  editingCategory:  Category | null;
  formData:         CategoryFormData;
  sucursales:       any[];
  statusList:       StatusItem[];
  isSaving:         boolean;
  onChange:         (data: CategoryFormData) => void;
  onSave:           () => void;
  onClose:          () => void;
}

/**
 * Modal reutilizable para crear o editar una categoría.
 * El título y el botón de confirmación cambian según el modo.
 */
export const CategoriaModal: React.FC<Props> = ({
  editingCategory, formData, sucursales, statusList,
  isSaving, onChange, onSave, onClose,
}) => {
  const theme = useTheme();
  const isEditing = Boolean(editingCategory);

  const selectStyle = {
    width: "100%", padding: "12px", borderRadius: "10px",
    background: theme.bg2, border: `1px solid ${theme.bg3}33`,
    color: theme.text, outline: "none",
  };

  return (
    <ModalOverlay>
      <ModalContent>
        {/* Encabezado del modal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
          <h2 style={{ margin: 0, color: theme.text }}>
            {isEditing ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <ActionBtn $variant="close" onClick={onClose}>
            <FiX size={24} />
          </ActionBtn>
        </div>

        {/* Campo: Nombre */}
        <FormGroup>
          <label>Nombre</label>
          <input
            value={formData.nombre}
            onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Lácteos, Bebidas..."
            autoFocus
          />
        </FormGroup>

        {/* Campo: Sucursal */}
        <FormGroup style={{ marginTop: 20 }}>
          <label>Asignar a Sucursal</label>
          <select
            value={formData.id_sucursal}
            onChange={(e) => onChange({ ...formData, id_sucursal: e.target.value })}
            style={selectStyle}
          >
            <option value="">Seleccione sucursal...</option>
            {sucursales.map((s: any) => (
              <option key={s.id_sucursal} value={s.id_sucursal}>
                {s.nombre_sucursal}
              </option>
            ))}
          </select>
        </FormGroup>

        {/* Campo: Estado */}
        <FormGroup style={{ marginTop: 20 }}>
          <label>Estado</label>
          <select
            value={formData.id_status}
            onChange={(e) => onChange({ ...formData, id_status: e.target.value })}
            style={selectStyle}
          >
            <option value="">Seleccione estado...</option>
            {statusList.map((s) => (
              <option key={s.id_status} value={s.id_status}>
                {s.std_descripcion}
              </option>
            ))}
          </select>
        </FormGroup>

        {/* Botones de acción */}
        <div style={{ display: "flex", gap: 15, marginTop: 30 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: 14, borderRadius: 12, background: theme.bg2, color: theme.text, border: "none", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            style={{ flex: 1, padding: 14, borderRadius: 12, background: theme.primary, color: theme.bg, border: "none", fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer" }}
          >
            {isSaving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Categoría"}
          </button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};
