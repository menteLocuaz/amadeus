// features/products/categories/components/CategoriaTable.tsx
import React from "react";
import { useTheme } from "styled-components";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { type Category } from "../../products/services/CategoryService";
import { type StatusItem } from "../../../shared/store/useCatalogStore";
import { TableCard, Table, ActionBtn } from "../../../shared/components/UI";

interface Props {
  categories:       Category[];
  sucursalMap:      Record<string, string>;
  statusList:       StatusItem[];
  isDeletingId:     string | null;
  onEdit:           (cat: Category) => void;
  onDelete:         (id: string) => void;
  onStatusChange:   (cat: Category, newStatusId: string) => void;
}

/**
 * Tabla de categorías con acciones de editar, eliminar y cambio de estado inline.
 */
export const CategoriaTable: React.FC<Props> = ({
  categories, sucursalMap, statusList, isDeletingId,
  onEdit, onDelete, onStatusChange,
}) => {
  const theme = useTheme();

  const isActive = (cat: Category) => {
    const desc = cat.status?.std_descripcion ?? statusList.find(s => s.id_status === cat.id_status)?.std_descripcion ?? "";
    return desc.toLowerCase().includes("activ");
  };

  return (
    <TableCard>
      <Table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Sucursal</th>
            <th>Estado</th>
            <th style={{ textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                No hay categorías en esta sucursal.
              </td>
            </tr>
          ) : (
            categories.map((cat) => (
              <tr key={cat.id_categoria}>
                <td style={{ fontWeight: 600 }}>{cat.nombre}</td>
                <td>
                  <span style={{
                    fontSize: "0.75rem", padding: "4px 8px",
                    background: theme.bg2, borderRadius: 6,
                    color: theme.textsecondary,
                  }}>
                    {sucursalMap[cat.id_sucursal] ?? "Sin Sucursal"}
                  </span>
                </td>
                <td>
                  {statusList.length > 0 ? (
                    <select
                      value={cat.id_status ?? ""}
                      onChange={(e) => onStatusChange(cat, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        border: `1px solid ${theme.bg3}44`,
                        background: isActive(cat) ? `${theme.success}18` : `${theme.danger}18`,
                        color: isActive(cat) ? theme.success : theme.danger,
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      {statusList.map((s) => (
                        <option key={s.id_status} value={s.id_status}>
                          {s.std_descripcion}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{
                      fontSize: "0.75rem", padding: "4px 8px",
                      background: theme.bg2, borderRadius: 6,
                      color: theme.textsecondary,
                    }}>
                      —
                    </span>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <ActionBtn onClick={() => onEdit(cat)} title="Editar">
                    <FiEdit2 size={18} />
                  </ActionBtn>
                  <ActionBtn $variant="delete" onClick={() => onDelete(cat.id_categoria)} title="Eliminar">
                    {isDeletingId === cat.id_categoria
                      ? <ClimbingBoxLoader color={theme.danger} size={10} />
                      : <FiTrash2 size={18} />}
                  </ActionBtn>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </TableCard>
  );
};
