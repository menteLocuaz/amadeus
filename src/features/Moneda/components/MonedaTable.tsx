// features/products/monedas/components/MonedaTable.tsx
import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { type Moneda } from "../services/MonedaService";
import { TableCard, Table, ActionBtn, Badge } from "../../../shared/components/UI";

interface Props {
  monedas:      Moneda[];
  /** Mapa id_sucursal → nombre_sucursal */
  sucursalMap:  Record<string, string>;
  isDeletingId: string | null;
  isSaving:     boolean;
  onEdit:       (moneda?: Moneda) => void;
  onDelete:     (id: string | undefined) => void;
}

/** 
 * Helper local para el color del badge. 
 * Como en este módulo el status es fijo (Activo), 
 * podemos simplificarlo o basarlo en el texto si existiera.
 */
const getBadgeColor = (_statusId: string) => {
  // Si el ID coincide con el activo (puedes importar la constante si gustas)
  return "rgba(34,197,94,0.12)"; 
};

export const MonedaTable: React.FC<Props> = ({
  monedas, sucursalMap, isDeletingId, isSaving,
  onEdit, onDelete,
}) => {
  const isBusy = isSaving || isDeletingId !== null;

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
          {monedas.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                No se encontraron monedas.
              </td>
            </tr>
          ) : (
            monedas.map((moneda) => {
              const id = String(moneda.id_moneda);
              return (
                <tr key={id}>
                  <td style={{ fontWeight: 600 }}>{moneda.nombre}</td>
                  <td style={{ fontSize: "0.9rem", color: "#666" }}>
                    {sucursalMap[moneda.id_sucursal] || "Sucursal no encontrada"}
                  </td>
                  <td>
                    <Badge $color={getBadgeColor(moneda.id_status)}>
                      Activo
                    </Badge>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <ActionBtn onClick={() => onEdit(moneda)} title="Editar" disabled={isBusy}>
                        <FiEdit2 size={18} />
                      </ActionBtn>
                      
                      <ActionBtn 
                        $variant="delete" 
                        onClick={() => onDelete(id)} 
                        title="Eliminar" 
                        disabled={isBusy}
                      >
                        {isDeletingId === id ? (
                          <div style={{ display: "inline-flex", width: 20 }}>
                            <ClimbingBoxLoader color="#ff4d4d" size={12} />
                          </div>
                        ) : (
                          <FiTrash2 size={18} />
                        )}
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </TableCard>
  );
};