import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface InventoryItem {
    id: string;
    id_producto: string;
    id_sucursal: string;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    precio_compra: number;
    precio_venta: number;
    producto?: {
        nombre: string;
        imagen?: string;
        categoria?: { nombre: string };
        unidad?: { nombre: string };
    };
    created_at?: string;
    updated_at?: string;
}

export interface AdjustStockPayload {
    id_producto: string;
    stock_actual?: number;
    stock_minimo?: number;
    stock_maximo?: number;
    precio_venta?: number;
    precio_compra?: number;
}

export const InventoryService = {
    getAll: async (): Promise<{ success: boolean; data: InventoryItem[] }> => {
        const { data } = await axiosClient.get(ENDPOINTS.inventario.base);
        return data;
    },

    update: async (id: string, payload: Partial<InventoryItem>): Promise<{ success: boolean; data: InventoryItem }> => {
        const { data } = await axiosClient.put(`${ENDPOINTS.inventario.base}/${id}`, payload);
        return data;
    },

    createMovement: async (payload: {
        id_producto: string;
        tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'COMPRA' | 'VENTA';
        cantidad: number;
        id_usuario: string;
        referencia?: string;
    }): Promise<{ success: boolean; data: any }> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.movimientos, payload);
        return data;
    }
};
