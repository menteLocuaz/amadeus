import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface PurchaseItem {
  id?: string;
  id_producto: string;
  cantidad: number;
  received_qty?: number;
  precio_unitario: number;
  producto?: { nombre: string; sku?: string; unidad?: string };
}

export interface PurchaseOrder {
  id: string;
  id_proveedor: string;
  codigo_orden: string;
  fecha_emision: string;
  fecha_llegada_estimada?: string;
  status: 'DRAFT' | 'SENT' | 'PARTIAL' | 'RECEIVED';
  nota?: string;
  items: PurchaseItem[];
  proveedor?: { nombre: string };
  invoice_number?: string;
}

export interface PurchaseCreateRequest {
  id_proveedor: string;
  codigo_orden?: string;
  fecha_emision: string;
  fecha_llegada_estimada?: string;
  nota?: string;
  items: {
    id_producto: string;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface ReceiveRequest {
  invoice_number?: string;
  items: {
    id_item: string;
    cantidad: number;
  }[];
}

export const PurchaseService = {
  getAll: async (): Promise<{ success: boolean; data: PurchaseOrder[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.compras.base);
    return data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const { data } = await axiosClient.get(ENDPOINTS.compras.byId(id));
    return data;
  },

  create: async (payload: PurchaseCreateRequest): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const { data } = await axiosClient.post(ENDPOINTS.compras.base, payload);
    return data;
  },

  update: async (id: string, payload: Partial<PurchaseCreateRequest>): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const { data } = await axiosClient.put(ENDPOINTS.compras.byId(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.compras.byId(id));
  },

  receive: async (id: string, payload: ReceiveRequest): Promise<{ success: boolean; data: PurchaseOrder }> => {
    const { data } = await axiosClient.post(ENDPOINTS.compras.receive(id), payload);
    return data;
  }
};
