/**
 * InventoryService.ts
 * Capa de acceso a datos para el módulo de Inventario.
 *
 * El stock solo se modifica a través de movimientos (Kardex); nunca se edita
 * directamente el campo `stock_actual` desde el frontend fuera del PUT de inventario.
 *
 * Referencia API: doc/inventario_logica.md
 */

import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

// ── Tipos de movimiento válidos según el backend ──────────────────────────────
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION' | 'TRASLADO';

// ── Modelos de respuesta ──────────────────────────────────────────────────────

/** Registro de inventario de un producto en una sucursal. */
export interface InventoryItem {
    id_inventario: string;
    id_producto: string;
    id_sucursal: string;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    precio_compra: number;
    precio_venta: number;
    ubicacion?: string;
    created_at: string;
    updated_at: string;
}

/** Movimiento registrado en el Kardex. */
export interface MovimientoInventario {
    id_movimiento: string;
    id_producto: string;
    id_sucursal: string;
    tipo_movimiento: TipoMovimiento;
    cantidad: number;
    costo_unitario: number;
    precio_unitario: number;
    stock_anterior: number;
    stock_posterior: number;
    fecha: string;
    id_usuario: string;
    referencia?: string;
    created_at: string;
    updated_at: string;
}

/** Resultado de la valuación del inventario. */
export interface ValuacionResult {
    id_sucursal: string;
    metodo: 'peps' | 'ueps' | 'promedio';
    total_valor: number;
}

/** Clasificación ABC de productos por valor económico. */
export interface RotacionABC {
    A: string[];
    B: string[];
    C: string[];
}

// ── DTOs de entrada ───────────────────────────────────────────────────────────

/** Body para POST /inventario — crea el primer registro de un producto en una sucursal. */
export interface InventoryCreateDTO {
    id_producto: string;
    id_sucursal: string;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    precio_compra: number;
    precio_venta: number;
}

/**
 * Body para PUT /inventario/{id} — actualiza precios y límites de stock.
 * Todos los campos son requeridos por el backend; no se puede cambiar
 * id_producto ni id_sucursal.
 */
export interface InventoryUpdateDTO {
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    precio_compra: number;
    precio_venta: number;
}

/** Body para POST /inventario/movimientos — movimiento individual. */
export interface MovimientoRequest {
    id_producto: string;
    id_sucursal: string;
    tipo_movimiento: TipoMovimiento;
    cantidad: number;       // Debe ser > 0
    referencia?: string;    // Opcional (núm. factura, reporte, etc.)
}

/** Body para POST /inventario/movimientos/masivo — varios productos a la vez. */
export interface MovimientoMasivoRequest {
    id_sucursal: string;
    tipo_movimiento: TipoMovimiento;
    referencia?: string;
    items: { id_producto: string; cantidad: number }[];
}

/** Query params de paginación cursor-based. */
export interface PaginationParams {
    limit?: number;
    last_id?: string;
    last_date?: string; // RFC3339 / ISO 8601 con timezone
}

// ── Respuesta estándar del backend ────────────────────────────────────────────
interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convierte un objeto de paginación en query string (ej. "?limit=20&last_id=..."). */
function toPaginationQuery(params?: PaginationParams): string {
    if (!params) return '';
    const q = new URLSearchParams();
    if (params.limit)     q.set('limit',     String(params.limit));
    if (params.last_id)   q.set('last_id',   params.last_id);
    if (params.last_date) q.set('last_date', params.last_date);
    const qs = q.toString();
    return qs ? `?${qs}` : '';
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const InventoryService = {

    /**
     * Lista todo el inventario (todas las sucursales).
     * GET /inventario/
     */
    getAll: async (pagination?: PaginationParams): Promise<ApiResponse<InventoryItem[]>> => {
        const { data } = await axiosClient.get(
            `${ENDPOINTS.inventario.base}/${toPaginationQuery(pagination)}`
        );
        return data;
    },

    /**
     * Inventario de una sucursal específica.
     * GET /inventario/sucursal/{id_sucursal}
     */
    getBySucursal: async (
        id_sucursal: string,
        pagination?: PaginationParams
    ): Promise<ApiResponse<InventoryItem[]>> => {
        const { data } = await axiosClient.get(
            `${ENDPOINTS.inventario.bySucursal(id_sucursal)}${toPaginationQuery(pagination)}`
        );
        return data;
    },

    /**
     * Obtiene un registro de inventario por su ID.
     * GET /inventario/{id}
     */
    getById: async (id: string): Promise<ApiResponse<InventoryItem>> => {
        const { data } = await axiosClient.get(ENDPOINTS.inventario.byId(id));
        return data;
    },

    /**
     * Crea el primer registro de inventario para un producto en una sucursal.
     * Solo puede existir un registro por (id_producto, id_sucursal).
     * POST /inventario/
     */
    create: async (payload: InventoryCreateDTO): Promise<ApiResponse<InventoryItem>> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.base, payload);
        return data;
    },

    /**
     * Actualiza precios y límites de stock de un registro existente.
     * Todos los campos del DTO son requeridos por el backend.
     * PUT /inventario/{id}
     */
    update: async (id: string, payload: InventoryUpdateDTO): Promise<ApiResponse<InventoryItem>> => {
        const { data } = await axiosClient.put(ENDPOINTS.inventario.byId(id), payload);
        return data;
    },

    /**
     * Elimina un registro de inventario (soft delete).
     * DELETE /inventario/{id}
     */
    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(ENDPOINTS.inventario.byId(id));
    },

    /**
     * Registra un movimiento individual en el Kardex.
     * El backend actualiza stock_actual automáticamente.
     * POST /inventario/movimientos
     */
    createMovement: async (payload: MovimientoRequest): Promise<ApiResponse<MovimientoInventario>> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.movimientos, payload);
        return data;
    },

    /**
     * Registra el mismo tipo de movimiento para múltiples productos en una sola operación.
     * POST /inventario/movimientos/masivo
     */
    createMovementMasivo: async (
        payload: MovimientoMasivoRequest
    ): Promise<ApiResponse<MovimientoInventario[]>> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.movimientosMasivo, payload);
        return data;
    },

    /**
     * Historial de movimientos (Kardex) de un producto específico.
     * GET /inventario/movimientos/{id_producto}
     */
    getKardex: async (
        id_producto: string,
        pagination?: PaginationParams
    ): Promise<ApiResponse<MovimientoInventario[]>> => {
        const { data } = await axiosClient.get(
            `${ENDPOINTS.inventario.movimientosByProduct(id_producto)}${toPaginationQuery(pagination)}`
        );
        return data;
    },

    /**
     * Productos cuyo stock_actual <= stock_minimo.
     * Si no se pasa id_sucursal, el backend la toma del token JWT.
     * GET /inventario/alertas?id_sucursal={uuid}
     */
    getAlertas: async (id_sucursal?: string): Promise<ApiResponse<InventoryItem[]>> => {
        const qs = id_sucursal ? `?id_sucursal=${id_sucursal}` : '';
        const { data } = await axiosClient.get(`${ENDPOINTS.inventario.alertas}${qs}`);
        return data;
    },

    /**
     * Valor contable del inventario de una sucursal según el método elegido.
     * Si no se pasa id_sucursal, el backend la toma del token JWT.
     * GET /inventario/valuacion?id_sucursal={uuid}&metodo={peps|ueps|promedio}
     */
    getValuacion: async (
        id_sucursal: string,
        metodo: ValuacionResult['metodo'] = 'promedio'
    ): Promise<ApiResponse<ValuacionResult>> => {
        const { data } = await axiosClient.get(
            `${ENDPOINTS.inventario.valuacion}?id_sucursal=${id_sucursal}&metodo=${metodo}`
        );
        return data;
    },

    /**
     * Clasificación ABC de productos por importancia económica (Pareto).
     * Si no se pasa id_sucursal, el backend la toma del token JWT.
     * GET /inventario/rotacion?id_sucursal={uuid}
     */
    getRotacion: async (id_sucursal: string): Promise<ApiResponse<RotacionABC>> => {
        const { data } = await axiosClient.get(
            `${ENDPOINTS.inventario.rotacion}?id_sucursal=${id_sucursal}`
        );
        return data;
    },
};
