/**
 * InventoryService.ts
 * Capa de acceso a datos para el módulo de Inventario.
 *
 * Responsabilidades:
 *  - Definir los contratos de datos (interfaces) para ítems de inventario,
 *    solicitudes de creación/actualización y movimientos de stock.
 *  - Exponer métodos HTTP que abstraen la comunicación con el backend,
 *    permitiendo que los hooks (useInventoryQuery, usePremiumInventoryQuery)
 *    consuman datos sin conocer los detalles de la API.
 *
 * Todos los métodos retornan la estructura estándar { success, data }
 * que el backend de este proyecto utiliza como envelope de respuesta.
 */

import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

// ── Interfaces de Dominio ──────────────────────────────────────────────────

/**
 * Representa un registro de inventario en una sucursal específica.
 *
 * Un InventoryItem es la intersección entre un Producto y una Sucursal:
 * almacena el stock y los precios que pueden variar por ubicación.
 *
 * Las relaciones `sucursal` y `producto` son opcionales porque el backend
 * puede o no incluirlas dependiendo del endpoint y los parámetros de la query
 * (algunos endpoints devuelven solo IDs, otros incluyen el JOIN completo).
 */
export interface InventoryItem {
    id: string;                  // ID del registro de inventario (no del producto)
    id_producto: string;         // FK → Producto
    id_sucursal: string;         // FK → Sucursal
    stock_actual: number;
    stock_minimo: number;        // Umbral de alerta de stock bajo
    stock_maximo: number;        // Límite superior para control de sobrestock
    precio_compra: number;       // Puede diferir del precio base del producto por sucursal
    precio_venta: number;        // Puede diferir del precio base del producto por sucursal

    /**
     * Relación anidada de sucursal.
     * Opcional: presente solo cuando el endpoint incluye el JOIN.
     * Expone tanto `id` como `id_sucursal` por inconsistencias entre versiones del backend.
     */
    sucursal?: {
        id?: string;
        id_sucursal?: string;
        nombre?: string;
    };

    /**
     * Relación anidada del producto.
     * Opcional: presente solo cuando el endpoint incluye el JOIN.
     * Incluye datos de presentación (nombre, imagen) y sus propias relaciones
     * (categoría, unidad) para evitar una segunda petición al backend.
     */
    producto?: {
        nombre: string;
        imagen?: string;
        categoria?: { nombre: string };
        unidad?: { nombre: string };
    };

    created_at?: string;         // Timestamp ISO de creación del registro
    updated_at?: string;         // Timestamp ISO de última modificación
}

/**
 * Payload para crear un nuevo registro de inventario.
 * Se usa cuando un producto aún no tiene inventario en una sucursal
 * (useInitializeInventory en usePremiumInventoryQuery).
 *
 * Todos los campos son requeridos para garantizar que el registro
 * quede completamente configurado desde el primer momento.
 */
export interface InventarioCreateRequest {
    id_producto: string;
    id_sucursal: string;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    precio_compra: number;
    precio_venta: number;
}

/**
 * Payload para actualizar un registro de inventario existente.
 * Todos los campos son opcionales (PATCH semántico):
 * solo se envían los campos que el usuario modificó.
 * Se usa en useUpdateInventory y useAdjustStock.
 */
export interface InventarioUpdateRequest {
    stock_actual?: number;
    stock_minimo?: number;
    stock_maximo?: number;
    precio_compra?: number;
    precio_venta?: number;
}

/**
 * Payload para registrar un movimiento de stock en el Kardex.
 *
 * Tipos de movimiento soportados:
 *  - ENTRADA    → ingreso de mercancía (compra, recepción)
 *  - SALIDA     → egreso de mercancía (venta, consumo)
 *  - AJUSTE     → corrección manual de inventario (conteo físico)
 *  - DEVOLUCION → retorno de mercancía al proveedor o del cliente
 *  - TRASLADO   → movimiento entre sucursales
 *
 * `referencia` es el número de documento, folio o motivo asociado al movimiento.
 * `id_usuario` es opcional para trazabilidad; si no se provee, el backend
 * puede inferirlo del token de autenticación.
 */
export interface MovimientoCreateRequest {
    id_producto: string;
    id_sucursal: string;
    tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION' | 'TRASLADO';
    cantidad: number;
    referencia?: string;         // Folio, número de orden o descripción del movimiento
    id_usuario?: string;         // Para trazabilidad en el Kardex
}

// ── Servicio ───────────────────────────────────────────────────────────────

export const InventoryService = {

    /**
     * Obtiene todos los registros de inventario.
     * Si se provee `id_sucursal`, filtra los resultados por sucursal en el backend.
     * Si no se provee, el backend puede devolver todos los registros (según permisos del token).
     *
     * Nota: el hook usePremiumInventory siempre pasa id_sucursal para aislar
     * el inventario de la sucursal del usuario autenticado.
     */
    getAll: async (id_sucursal?: string): Promise<{ status: string; data: InventoryItem[] }> => {
        const { data } = await axiosClient.get(ENDPOINTS.inventario.base, {
            params: id_sucursal ? { id_sucursal } : {}  // Omite el param si no hay sucursal
        });
        return data;
    },

    /**
     * Crea un nuevo registro de inventario para un producto en una sucursal.
     * Equivale a "inicializar" el producto en esa sucursal.
     * Retorna el registro creado con su `id` asignado por el backend.
     */
    create: async (payload: InventarioCreateRequest): Promise<{ status: string; data: InventoryItem }> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.base, payload);
        return data;
    },

    /**
     * Actualiza un registro de inventario existente por su `id`.
     * Nota: el `id` es el del registro de inventario, NO el del producto.
     * Para actualizar stock con trazabilidad en el Kardex, usar `createMovement`.
     */
    update: async (id: string, payload: InventarioUpdateRequest): Promise<{ status: string; data: InventoryItem }> => {
        const { data } = await axiosClient.put(`${ENDPOINTS.inventario.base}/${id}`, payload);
        return data;
    },

    /**
     * Registra un movimiento de stock en el Kardex.
     * El backend actualiza el stock_actual del registro de inventario
     * como efecto secundario de este endpoint.
     *
     * Retorna `any` porque la estructura de respuesta del movimiento
     * puede variar según el tipo y aún no está tipificada completamente.
     */
    createMovement: async (payload: MovimientoCreateRequest): Promise<{ status: string; data: any }> => {
        const { data } = await axiosClient.post(ENDPOINTS.inventario.movimientos, payload);
        return data;
    }
};