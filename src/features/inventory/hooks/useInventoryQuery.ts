/**
 * useInventoryQuery.ts
 * Custom hooks para la gestión del inventario usando TanStack Query.
 *
 * Expone dos hooks principales:
 *  - useInventoryItems → consulta y filtra los ítems de inventario por sucursal del usuario.
 *  - useAdjustStock    → mutación que actualiza el stock y registra el movimiento en el Kardex.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService, type InventoryItem } from '../services/InventoryService';
import { useAuthStore } from '../../auth/store/useAuthStore';
import Swal from 'sweetalert2';

// ── Query Key Factory ──────────────────────────────────────────────────────
/**
 * Fábrica de query keys para el módulo de inventario.
 * Centralizar las keys aquí garantiza consistencia al invalidar caché
 * y evita strings duplicados dispersos en el código.
 *
 * Jerarquía:
 *   all → lists → list(filters)
 *              → details → detail(id)
 */
export const inventoryKeys = {
    all: ['inventory'] as const,
    lists: () => [...inventoryKeys.all, 'list'] as const,
    list: (filters: string) => [...inventoryKeys.lists(), { filters }] as const,
    details: () => [...inventoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.details(), id] as const,
};

// ── Hook: useInventoryItems ────────────────────────────────────────────────
/**
 * Obtiene todos los ítems de inventario y los filtra por la sucursal
 * del usuario autenticado.
 *
 * Manejo de respuesta flexible:
 * El backend puede devolver la lista en distintas estructuras según el endpoint
 * o versión de la API. La función `extractData` normaliza todos los casos conocidos
 * a un array plano de InventoryItem[].
 */
export const useInventoryItems = () => {
    const { user } = useAuthStore();
    
    return useQuery({
        queryKey: inventoryKeys.lists(),
        queryFn: async () => {
            const res = await InventoryService.getAll();
            
            /**
             * Normaliza la respuesta del servicio a un array de InventoryItem.
             * Cubre los siguientes formatos de respuesta observados en el proyecto:
             *  - Array directo:          [{ ... }, { ... }]
             *  - Wrapper data:           { data: [...] }
             *  - Wrapper items:          { items: [...] }
             *  - Estructura anidada:     { data: { "1": { items: [...] } } }
             *  - Objeto genérico:        { data: { key: { ... } } } → extrae valores
             */
            const extractData = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.items && Array.isArray(res.items)) return res.items;
                if (res.data && typeof res.data === 'object') {
                    // Intenta capturar estructuras anidadas frecuentes en este proyecto
                    // donde los datos vienen indexados por número de módulo/sucursal
                    const modData = res.data["2"] || res.data["1"] || res.data["3"];
                    if (modData && Array.isArray(modData.items)) return modData.items;
                    return Object.values(res.data).filter(v => typeof v === 'object') as any[];
                }
                return [];
            };

            const allItems = extractData(res) as InventoryItem[];
            
            /**
             * Filtro por sucursal del usuario autenticado.
             * Se resuelve el id de sucursal probando tres rutas posibles en el objeto user,
             * ya que la estructura puede variar según el endpoint de login utilizado.
             */
            const currentUserSucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || (user as any)?.sucursal?.id;
            
            // Si el usuario no tiene sucursal asignada, devuelve todos los ítems sin filtrar
            if (!currentUserSucursalId) return allItems;

            // Filtra los ítems cuya sucursal coincida con la del usuario
            // También resuelve el id de sucursal del ítem por múltiples rutas posibles
            return allItems.filter(i => {
                const invSucursalId = i.id_sucursal || i.sucursal?.id_sucursal || i.sucursal?.id;
                return invSucursalId === currentUserSucursalId;
            });
        },
    });
};

// ── Hook: useAdjustStock ───────────────────────────────────────────────────
/**
 * Mutación para ajustar el stock de un ítem de inventario.
 *
 * Realiza dos operaciones en secuencia:
 *  1. Actualiza el registro de inventario con el nuevo stock.
 *  2. Si el stock cambió, registra un movimiento de tipo 'AJUSTE' en el Kardex,
 *     calculando la diferencia (diff) entre el stock original y el nuevo.
 *
 * Parámetros de la mutación:
 * @param id       - ID del ítem de inventario a actualizar.
 * @param payload  - Campos a actualizar (incluye el nuevo stock_actual).
 * @param motivo   - Descripción opcional del ajuste; se usa como referencia en el Kardex.
 * @param original - Snapshot del ítem antes del ajuste, necesario para calcular el diff.
 */
export const useAdjustStock = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async ({ id, payload, motivo, original }: { 
            id: string; 
            payload: Partial<InventoryItem>; 
            motivo?: string;
            original: InventoryItem;
        }) => {
            // Guarda de seguridad: no permite ajustes sin usuario autenticado
            if (!user?.id_usuario) throw new Error("Usuario no autenticado");

            // Paso 1: Persiste los cambios en el registro de inventario
            await InventoryService.update(id, payload);

            // Paso 2: Registra el movimiento en el Kardex solo si el stock realmente cambió.
            // Se usa Math.abs(diff) para que la cantidad del movimiento siempre sea positiva;
            // el tipo 'AJUSTE' ya indica si fue incremento o decremento.
            if (payload.stock_actual !== undefined && payload.stock_actual !== original.stock_actual) {
                const diff = payload.stock_actual - original.stock_actual;
                await InventoryService.createMovement({
                    id_producto: original.id_producto,
                    id_sucursal: original.id_sucursal,
                    tipo_movimiento: 'AJUSTE',
                    cantidad: Math.abs(diff),
                    id_usuario: user.id_usuario,
                    referencia: motivo || "AJUSTE MANUAL" // Fallback si no se provee motivo
                });
            }
        },

        // ── Callbacks de resultado ─────────────────────────────────────────

        onSuccess: () => {
            // Invalida toda la caché de inventario para forzar un refetch fresco
            // y reflejar el nuevo stock en todas las vistas que consuman estos datos
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            Swal.fire({
                icon: 'success',
                title: 'Stock Actualizado',
                text: 'El ajuste se ha registrado correctamente.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,        // Notificación no intrusiva tipo toast
                position: 'top-end'
            });
        },

        onError: (error: any) => {
            // Prioriza el mensaje del backend; si no existe, usa el mensaje genérico del error
            Swal.fire({
                icon: 'error',
                title: 'Error al ajustar stock',
                text: error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
            });
        }
    });
};