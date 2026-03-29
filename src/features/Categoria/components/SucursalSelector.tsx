// features/products/categories/components/SucursalSelector.tsx
import React from "react";
import { useTheme } from "styled-components";
import { FiMapPin } from "react-icons/fi";

interface Props {
  sucursales:       any[];
  selectedId:       string;
  onSelect:         (id: string) => void;
}

/**
 * Selector global de sucursal que actualiza el store de autenticación.
 * Aparece en el Header de la página de Categorías.
 */
export const SucursalSelector: React.FC<Props> = ({ sucursales, selectedId, onSelect }) => {
  const theme = useTheme();

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: theme.bg2, padding: "8px 15px",
      borderRadius: 12, border: `1px solid ${theme.bg3}33`,
    }}>
      <FiMapPin style={{ color: theme.primary }} />
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        style={{
          background: "transparent", border: "none",
          color: theme.text, fontWeight: 600,
          outline: "none", cursor: "pointer",
        }}
      >
        <option value="">Todas las sucursales</option>
        {sucursales.map((s: any) => (
          <option key={s.id_sucursal} value={s.id_sucursal}>
            {s.nombre_sucursal}
          </option>
        ))}
      </select>
    </div>
  );
};