// features/products/categories/components/CategoriaTable.tsx
import React from "react";
import { useTheme } from "styled-components";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { type Category } from "../../products/services/CategoryService";
import { TableCard, Table, ActionBtn } from "../../../shared/components/UI";

interface Props {
  categories:   Category[];
  sucursalMap:  Record<string, string>;
  isDeletingId: string | null;
  onEdit:       (cat: Category) => void;
  onDelete:     (id: string) => void;
}

/**
 * Tabla de categorías con acciones de editar y eliminar.
 * Muestra el nombre de la sucursal usando el mapa precalculado.
 */
export const CategoriaTable: React.FC<Props> = ({
  categories, sucursalMap, isDeletingId, onEdit, onDelete,
}) => {
  const theme = useTheme();

  return (
    <TableCard>
      <Table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Sucursal</th>
            <th style={{ textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
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