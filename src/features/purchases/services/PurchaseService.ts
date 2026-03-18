import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface PurchaseItem {
  id_producto: string;
  cantidad: number;
  precio_unitario: number;
}

export interface PurchaseCreateRequest {
  codigo_orden?: string;
  items: PurchaseItem[];
  nota?: string;
  id_usuario?: string; // Required for backend movements
}

export const PurchaseService = {
  // Since there is no global 'Orders' histórico in api.md, we could list the inventory
  // or use the general inventory endpoint.
  getAll: async (): Promise<{ success: boolean; data: any[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.inventario.base);
    return data;
  },

  // According to api.md: POST /inventario/movimientos
  // We simulate a bulk purchase by registering individual movements
  create: async (payload: PurchaseCreateRequest): Promise<{ success: boolean; data: any }> => {
    const promises = payload.items.map(item => 
      axiosClient.post(ENDPOINTS.inventario.movimientos, {
        id_producto: item.id_producto,
        tipo_movimiento: "COMPRA",
        cantidad: Number(item.cantidad),
        id_usuario: payload.id_usuario, // Now mandatory
        referencia: payload.codigo_orden || payload.nota || "ENTRADA MERCANCIA"
      })
    );

    const results = await Promise.all(promises);
    return { success: true, data: results };
  },

  // Movement deletion/update is not documented in api.md movements,
  // we could potentially update the inventory record directly.
  delete: async (id: string): Promise<void> => {
    // Direct inventory deletion if needed, or ignored if it's history
    await axiosClient.delete(`${ENDPOINTS.inventario.base}/${id}`);
  }
};
