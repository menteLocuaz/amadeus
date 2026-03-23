import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface DetalleCompra {
  id?: string;
  id_detalle_compra?: string;
  id_producto: string;
  cantidad_pedida: number;
  precio_unitario: number;
  impuesto: number;
  producto?: { nombre: string }; // For display
}

export interface Compra {
  id: string;
  id_orden_compra?: string;
  numero_orden: string;
  id_proveedor: string;
  id_sucursal: string;
  id_moneda: string;
  id_status: string;
  status_id?: string;
  observaciones?: string;
  fecha_creacion: string;
  total?: number;
  proveedor?: { nombre: string };
  sucursal?: { nombre: string };
  status?: { nombre: string };
  detalles?: DetalleCompra[];
}

export interface CompraCreateRequest {
  numero_orden: string;
  id_proveedor: string;
  id_sucursal: string;
  id_moneda: string;
  id_status: string;
  observaciones?: string;
  detalles: {
    id_producto: string;
    cantidad_pedida: number;
    precio_unitario: number;
    impuesto: number;
  }[];
}

export interface RecepcionRequest {
  id_orden_compra: string;
  id_status: string;
  items: {
    id_detalle_compra: string;
    id_producto: string;
    cantidad_recibida: number;
  }[];
}

export const PurchaseService = {
  getOrders: async (): Promise<{ success: boolean; data: Compra[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.compras.base);
    return data;
  },

  getOrderById: async (id: string): Promise<{ success: boolean; data: Compra }> => {
    const { data } = await axiosClient.get(ENDPOINTS.compras.byId(id));
    return data;
  },

  createOrder: async (payload: CompraCreateRequest): Promise<{ success: boolean; data: Compra }> => {
    const { data } = await axiosClient.post(ENDPOINTS.compras.base, payload);
    return data;
  },

  receiveOrder: async (payload: RecepcionRequest): Promise<{ success: boolean; data: any }> => {
    const { data } = await axiosClient.post(ENDPOINTS.compras.recepcion, payload);
    return data;
  },

  // Legacy/Direct adjustment helper
  createMovement: async (payload: any) => {
    const { data } = await axiosClient.post(ENDPOINTS.inventario.movimientos, payload);
    return data;
  },

  // Inventory list helper for pre-condition check
  getInventory: async (): Promise<{ success: boolean; data: any[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.inventario.base);
    return data;
  }
};
