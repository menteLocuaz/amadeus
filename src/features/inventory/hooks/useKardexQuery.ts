/**
 * useKardexQuery.ts
 * Custom hook para consultar el historial de movimientos de Kardex
 * de un producto específico, con soporte de filtros por rango de fechas.
 *
 * Diseñado para trabajar en conjunto con el componente Kardex.tsx,
 * donde la query solo se activa cuando el usuario presiona "Generar Reporte"
 * (patrón de búsqueda manual, no reactiva).
 */

import { useQuery } from '@tanstack/react-query';
import { KardexService } from '../services/KardexService';

// ── Query Key Factory ──────────────────────────────────────────────────────
/**
 * Fábrica de query keys para el módulo de Kardex.
 *
 * `byProduct` incluye productId, startDate y endDate en la key,
 * lo que garantiza que cada combinación única de filtros tenga
 * su propia entrada en caché, evitando colisiones entre consultas.
 *
 * Ejemplo de key generada:
 *   ['kardex', 'prod-001', { start: '2024-01-01', end: '2024-12-31' }]
 */
export const kardexKeys = {
    all: ['kardex'] as const,
    byProduct: (productId: string, start?: string, end?: string) => 
        [...kardexKeys.all, productId, { start, end }] as const,
};

// ── Hook: useKardexData ────────────────────────────────────────────────────
/**
 * Obtiene los movimientos de Kardex para un producto dado,
 * opcionalmente filtrados por rango de fechas.
 *
 * @param productId  - ID del producto a consultar. La query no se ejecuta si está vacío.
 * @param startDate  - Fecha de inicio del rango (formato ISO: YYYY-MM-DD). Opcional.
 * @param endDate    - Fecha de fin del rango (formato ISO: YYYY-MM-DD). Opcional.
 *
 * Comportamiento clave:
 * - `enabled: !!productId` → la query permanece inactiva hasta que se provea un productId.
 *   Esto soporta el patrón de búsqueda manual del componente Kardex.tsx,
 *   donde queryParams.id comienza vacío y solo se llena al hacer clic en "Generar Reporte".
 * - La doble guarda (`!productId` dentro de queryFn) es una capa de seguridad adicional
 *   por si la query se ejecutara con un id vacío de forma inesperada.
 * - Devuelve `[]` si la respuesta no es exitosa, evitando que el componente
 *   tenga que manejar undefined o null en la tabla.
 */
export const useKardexData = (productId: string, startDate?: string, endDate?: string) => {
    return useQuery({
        // La key cambia con cada combinación de producto + fechas,
        // por lo que TanStack Query cachea cada búsqueda de forma independiente
        queryKey: kardexKeys.byProduct(productId, startDate, endDate),

        queryFn: async () => {
            // Guarda defensiva: retorna array vacío si no hay producto seleccionado
            if (!productId) return [];

            const res = await KardexService.getMovimientos(productId, startDate, endDate);

            // Normaliza la respuesta: solo retorna datos si el servicio indica éxito;
            // de lo contrario devuelve [] para que la tabla muestre el estado "sin resultados"
            return res.success ? res.data : [];
        },

        // La query solo se activa cuando productId tiene un valor truthy.
        // Mientras productId sea "" (estado inicial), la query queda en estado 'disabled'
        // y no realiza ninguna petición al backend.
        enabled: !!productId,
    });
};