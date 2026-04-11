/**
 * KardexService.ts
 * Capa de acceso a datos para el módulo de Kardex (historial de movimientos de inventario).
 *
 * Responsabilidades:
 *  - Definir el contrato de datos MovimientoKardex, alineado con la tabla
 *    MOVIMIENTOS_INVENTARIO del esquema de base de datos.
 *  - Exponer el método getMovimientos para consultar el historial de un producto,
 *    con soporte de filtros opcionales por rango de fechas.
 *
 * A diferencia de InventoryService, este servicio es de solo lectura:
 * los movimientos se crean a través de InventoryService.createMovement,
 * que los registra como efecto secundario al actualizar el stock.
 */

import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

// ── Domain Interface ────────────────────────────────────────────────────

/**
 * Represents an inventory movement recorded in the Kardex.
 * Aligned with the MOVIMIENTOS_INVENTARIO table in the database schema.
 */
export interface MovimientoKardex {
    id_movimiento?: string;
    id_producto: string;
    id_sucursal: string;
    fecha: string; // ISO Format
    tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION' | 'TRASLADO' | 'COMPRA' | 'VENTA';
    cantidad: number;
    stock_anterior?: number;
    stock_posterior?: number;
    saldo_resultante?: number; // Backend calculated field
    saldo_calculado?: number;  // Frontend fallback field
    referencia?: string;
    id_usuario?: string;
    created_at?: string;
}

// ── Service ───────────────────────────────────────────────────────────────

export const KardexService = {

    /**
     * Fetches inventory movement history for a specific product.
     * 
     * @param idProducto  - The unique ID of the product.
     * @param fechaInicio - Start date filter (YYYY-MM-DD).
     * @param fechaFin    - End date filter (YYYY-MM-DD).
     * 
     * Backend Endpoint: GET /inventario/movimientos/{id_producto}
     */
    getMovimientos: async (
        idProducto: string,
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<{ status: string; data: MovimientoKardex[] }> => {

        // Validacion preventiva: el backend requiere un ID de producto para este endpoint.
        // Si no hay ID o es 'all', retornamos vacio para evitar el error 400.
        if (!idProducto || idProducto === 'all') {
            return { status: 'success', data: [] };
        }

        const params = new URLSearchParams();
        if (fechaInicio) params.append('startDate', fechaInicio);
        if (fechaFin)    params.append('endDate',   fechaFin);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const url = `${ENDPOINTS.inventario.movimientosByProduct(idProducto)}${queryString}`;

        try {
            const { data } = await axiosClient.get(url);
            return data;
        } catch (error) {
            console.error("Kardex fetch error:", error);
            // Return empty data instead of crashing to allow the UI to handle it gracefully
            return { status: 'error', data: [] };
        }
    }
};