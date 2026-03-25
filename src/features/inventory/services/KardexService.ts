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

// ── Interfaz de Dominio ────────────────────────────────────────────────────

/**
 * Representa un movimiento de inventario registrado en el Kardex.
 * Alineado con la tabla MOVIMIENTOS_INVENTARIO del esquema de base de datos.
 *
 * Campos de saldo:
 *  - `saldo_resultante` → calculado y persistido por el backend al registrar el movimiento.
 *  - `saldo_calculado`  → campo derivado que puede ser calculado en el frontend
 *                         si el backend no lo devuelve. El componente Kardex.tsx
 *                         usa el operador `??` para priorizar uno sobre el otro.
 *
 * Tipos de movimiento soportados (cubre todos los valores posibles del backend):
 *  - ENTRADA  → ingreso de mercancía (recepción, ajuste positivo)
 *  - SALIDA   → egreso de mercancía (despacho, ajuste negativo)
 *  - AJUSTE   → corrección manual de inventario
 *  - COMPRA   → entrada por orden de compra a proveedor
 *  - VENTA    → salida por venta al cliente
 */
export interface MovimientoKardex {
    id?: string;                  // Opcional: puede no estar presente en respuestas parciales
    id_producto: string;          // FK → Producto al que pertenece el movimiento
    id_sucursal?: string;         // FK → Sucursal donde ocurrió el movimiento (opcional en algunos endpoints)
    fecha: string;                // Fecha del movimiento en formato ISO (puede diferir de created_at)
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'COMPRA' | 'VENTA'; // Todos los tipos posibles del backend
    cantidad: number;             // Siempre positivo; el tipo determina si es entrada o salida
    saldo_resultante?: number;    // Stock después del movimiento, calculado por el backend
    saldo_calculado?: number;     // Alternativa calculada en frontend si el backend no lo provee
    referencia?: string;          // Documento asociado: ID de factura, orden de pedido, etc.
    id_usuario?: string;          // FK → Usuario que registró el movimiento (trazabilidad)
    created_at?: string;          // Timestamp de inserción en BD; puede diferir de `fecha`
}

// ── Servicio ───────────────────────────────────────────────────────────────

export const KardexService = {

    /**
     * Obtiene el historial de movimientos de inventario para un producto.
     *
     * @param idProducto  - ID del producto a consultar. Si es 'all' o vacío,
     *                      consulta todos los movimientos sin filtrar por producto.
     * @param fechaInicio - Fecha de inicio del rango (YYYY-MM-DD). Opcional.
     * @param fechaFin    - Fecha de fin del rango (YYYY-MM-DD). Opcional.
     *
     * Construcción de la URL:
     *  - Endpoint base: GET /inventario/movimientos/{id_producto}  (según api.md)
     *  - Si idProducto es 'all' o vacío → omite el segmento de ID en la ruta.
     *  - Los filtros de fecha se agregan como query params solo si están presentes,
     *    evitando parámetros vacíos que podrían causar errores en el backend.
     *
     * Manejo de errores:
     *  - A diferencia de otros servicios, este método captura el error internamente
     *    y retorna { success: false, data: [] } en lugar de propagar la excepción.
     *  - Esto permite que el hook useKardexData muestre la tabla vacía sin
     *    necesidad de un boundary de error, ya que una consulta sin resultados
     *    es un estado válido y esperado en esta vista.
     */
    getMovimientos: async (
        idProducto: string,
        fechaInicio?: string,
        fechaFin?: string
    ): Promise<{ success: boolean; data: MovimientoKardex[] }> => {

        // Construye los query params solo con los filtros que tienen valor
        const params = new URLSearchParams();
        if (fechaInicio) params.append('startDate', fechaInicio);
        if (fechaFin) params.append('endDate', fechaFin);

        // Agrega el query string solo si hay al menos un parámetro
        const queryString = params.toString() ? `?${params.toString()}` : '';

        /**
         * Determina el segmento de ID en la ruta:
         *  - Con ID válido → /inventario/movimientos/{idProducto}
         *  - Sin ID o 'all' → /inventario/movimientos  (todos los movimientos)
         */
        const path = (idProducto && idProducto !== 'all') ? `/${idProducto}` : '';
        const url = `/inventario/movimientos${path}${queryString}`;

        try {
            const { data } = await axiosClient.get(url);
            return data;
        } catch (error) {
            // Log de advertencia (no error) porque una respuesta vacía es un estado válido.
            // El hook consumidor (useKardexData) mostrará el estado "sin resultados"
            // en lugar de lanzar una excepción al componente.
            console.warn("Kardex endpoint error:", error);
            return { success: false, data: [] };
        }
    }
};