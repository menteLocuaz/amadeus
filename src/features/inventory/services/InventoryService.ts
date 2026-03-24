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

export interface InventarioCreateRequest {
    id_producto: string;
    id_sucursal: string;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    precio_compra: number;
    precio_venta: number;
}

export interface InventarioUpdateRequest {
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    precio_compra: number;
    precio_venta: number;
}

export interface MovimientoCreateRequest {
    id_producto: string;
    id_sucursal: string;
    tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION' | 'TRASLADO';
    cantidad: number;
    referencia?: string;
}

export const InventoryService = {
    getAll: async (id_sucursal?: string): Promise<{ success: boolean; data: InventoryItem[] }> => {
        const { data } = await axiosClient.get(ENDPOINTS.inventario.base, {
            params: id_sucursal ? { id_sucursal } : {}
        });
        return data;
    },

    create: async (payload: InventarioCreateRequest): Promise<{ success: boolean; data: InventoryItem }> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.base, payload);
        return data;
    },

    update: async (id: string, payload: InventarioUpdateRequest): Promise<{ success: boolean; data: InventoryItem }> => {
        const { data } = await axiosClient.put(`${ENDPOINTS.inventario.base}/${id}`, payload);
        return data;
    },

    createMovement: async (payload: MovimientoCreateRequest): Promise<{ success: boolean; data: any }> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.movimientos, payload);
        return data;
    }
};
