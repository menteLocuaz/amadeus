/**
 * InventoryService.ts
 * Capa de acceso a datos para el módulo de Inventario de Prunus.
 * 
 * Basado en la arquitectura de "Movimientos de Inventario":
 * - El stock actual se consulta por sucursal.
 * - El stock solo cambia mediante registros en el Kardex (movimientos).
 */

import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

// --- Interfaces de Dominio ---

export interface InventoryItem {
    id?: string;
    id_producto: string;
    id_sucursal: string;
    nombre_producto: string;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo?: number;
    unidad_medida: string;
    precio_venta?: number;
    precio_compra?: number;
    categoria?: string;
    imagen?: string;
    producto?: any; // To handle nested product data if present
}

/**
 * Payload para registrar un movimiento manual (Ajuste, Entrada, Salida).
 */
export interface MovimientoRequest {
    id_sucursal: string;
    id_producto: string;
    tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'COMPRA' | 'VENTA' | 'MERMA';
    cantidad: number;
    motivo: string;
    referencia?: string;
}

export const InventoryService = {
    /**
     * Obtiene el stock actual de todos los productos en una sucursal específica.
     * Endpoint: GET /inventario/sucursal/{id_sucursal}
     */
    getBySucursal: async (id_sucursal: string): Promise<{ status: string; data: InventoryItem[] }> => {
        const url = `${ENDPOINTS.inventario.base}/sucursal/${id_sucursal}`;
        const { data } = await axiosClient.get(url);
        return data;
    },

    /**
     * Crea un registro de inventario para un producto en una sucursal.
     * Endpoint: POST /inventario
     */
    create: async (payload: any): Promise<{ status: string; data: any }> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.base, payload);
        return data;
    },

    /**
     * Actualiza un registro de inventario existente (precios, stock_minimo, etc).
     * Endpoint: PUT /inventario/{id}
     */
    update: async (id: string, payload: any): Promise<{ status: string; data: any }> => {
        const url = `${ENDPOINTS.inventario.base}/${id}`;
        const { data } = await axiosClient.put(url, payload);
        return data;
    },

    /**
     * Registra un movimiento de inventario (Entrada/Salida/Ajuste).
     * El backend actualiza el stock automáticamente al recibir este movimiento.
     * Endpoint: POST /inventario/movimientos
     */
    createMovement: async (payload: MovimientoRequest): Promise<{ status: string; message: string; data: any }> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.movimientos, payload);
        return data;
    },

    /**
     * Obtiene el historial (Kardex) de un producto.
     * Endpoint: GET /inventario/movimientos/{id_producto}
     */
    getKardex: async (id_producto: string): Promise<{ status: string; data: any[] }> => {
        const url = ENDPOINTS.inventario.movimientosByProduct(id_producto);
        const { data } = await axiosClient.get(url);
        return data;
    }
};
