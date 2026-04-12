/**
 * usePremiumInventory.ts
 * Hooks para el dashboard de inventario premium.
 *
 * Combina dos fuentes en paralelo:
 *   - ProductService  → catálogo maestro de productos
 *   - InventoryService → registros de stock de la sucursal activa
 *
 * Garantiza que TODOS los productos aparezcan en la tabla, incluso los que
 * aún no tienen un registro de inventario en la sucursal actual.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    InventoryService,
    type InventoryItem,
    type InventoryCreateDTO,
    type InventoryUpdateDTO,
    type MovimientoRequest,
    type MovimientoMasivoRequest,
    type ValuacionResult,
} from '../services/InventoryService';
import { ProductService, type Product } from '../../products/services/ProductService';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { type UserMe } from '../../auth/services/AuthService';
import Swal from 'sweetalert2';

// ── Helper: resolución del id de sucursal ─────────────────────────────────────
/**
 * Extrae el id de sucursal del objeto `user` del store de autenticación.
 * El campo `id_sucursal` está disponible directamente en el user o dentro
 * de `user.sucursal.id_sucursal` cuando se actualizó vía `setSucursalActiva`.
 */
function getSucursalId(user: UserMe | null): string {
    return user?.id_sucursal || user?.sucursal?.id_sucursal || '';
}

// ── Query Key Factory ──────────────────────────────────────────────────────────
export const premiumInventoryKeys = {
    all:       ['premium-inventory'] as const,
    dashboard: (sucursalId: string) => ['premium-inventory', 'dashboard', sucursalId] as const,
    valuation: (sucursalId: string, metodo: string) => ['premium-inventory', 'valuation', sucursalId, metodo] as const,
    rotation:  (sucursalId: string) => ['premium-inventory', 'rotation', sucursalId] as const,
};

// ── Tipo: MergedInventoryItem ──────────────────────────────────────────────────
/**
 * Producto del catálogo enriquecido con su registro de inventario.
 *
 * Los campos de inventario son opcionales porque un producto puede no tener
 * registro en la sucursal activa todavía. En ese caso `id_inventario` es
 * undefined, señal para mostrar el botón "Inicializar".
 */
export interface MergedInventoryItem {
    // Identificadores
    id_inventario?: string;     // undefined = sin registro en esta sucursal
    id_producto: string;

    // Del catálogo de productos
    nombre: string;
    categoria_nombre: string;
    unidad_nombre: string;
    imagen?: string;
    producto_original: Product; // Referencia completa para operaciones posteriores

    // Del registro de inventario (con fallback al producto)
    stock_actual: number;
    stock_minimo: number;
    ubicacion: string;
    precio_venta: number;
    precio_compra: number;
}

// ── Hook: usePremiumInventory ──────────────────────────────────────────────────
/**
 * Query principal del dashboard. Obtiene productos e inventario en paralelo
 * y los une en un array de MergedInventoryItem.
 *
 * La query key incluye `sucursalId` para que el caché sea independiente
 * por sucursal: al cambiar de sucursal se refetch automáticamente.
 */
export const usePremiumInventory = () => {
    const { user } = useAuthStore();
    const sucursalId = getSucursalId(user);

    return useQuery({
        queryKey: premiumInventoryKeys.dashboard(sucursalId),
        queryFn: async () => {
            // Peticiones en paralelo para minimizar tiempo de carga
            const [resProd, resInv] = await Promise.all([
                ProductService.getAll(),
                InventoryService.getBySucursal(sucursalId),
            ]);

            // El backend devuelve siempre: { status, message, data: [...] }
            const products: Product[]       = Array.isArray(resProd?.data) ? resProd.data : [];
            const inventory: InventoryItem[] = Array.isArray(resInv?.data)  ? resInv.data  : [];

            // Índice de inventario por id_producto para búsqueda O(1)
            const inventoryByProduct = new Map(
                inventory.map(inv => [inv.id_producto, inv])
            );

            // Itera sobre productos (no sobre inventario) para incluir los no inicializados
            return products.map((p): MergedInventoryItem => {
                const pId = p.id_producto ?? p.id ?? '';
                const inv = inventoryByProduct.get(pId);

                return {
                    id_inventario:    inv?.id_inventario,
                    id_producto:      pId,
                    nombre:           p.nombre,
                    categoria_nombre: p.categoria?.nombre ?? 'Sin Categoría',
                    unidad_nombre:    p.unidad?.nombre     ?? 'Unid.',
                    imagen:           p.imagen,
                    producto_original: p,
                    // Precio: prioriza inventario (puede variar por sucursal)
                    precio_venta:  inv?.precio_venta  ?? p.precio_venta  ?? 0,
                    precio_compra: inv?.precio_compra ?? p.precio_compra ?? 0,
                    // Stock: inventario de sucursal > campo legacy del producto > 0
                    stock_actual:  inv?.stock_actual ?? p.stock ?? p.stock_actual ?? 0,
                    stock_minimo:  inv?.stock_minimo ?? 0,
                    ubicacion:     inv?.ubicacion    ?? '',
                };
            });
        },
        enabled: !!sucursalId,
    });
};

// ── Hook: useInitializeInventory ───────────────────────────────────────────────
/**
 * Crea el primer registro de inventario de un producto en la sucursal activa.
 * Usar cuando `MergedInventoryItem.id_inventario` es undefined.
 */
export const useInitializeInventory = () => {
    const queryClient = useQueryClient();
    const { user }    = useAuthStore();

    return useMutation({
        mutationFn: (payload: InventoryCreateDTO) => InventoryService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Inventario Inicializado',
                text: 'El producto ha sido configurado correctamente.',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 1500,
            });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message ?? 'Error desconocido al inicializar';
            Swal.fire({ icon: 'error', title: 'Error de Validación', text: msg });
        },
        // Pasar user para que el modal pueda acceder al id_sucursal sin prop drilling
        meta: { sucursalId: getSucursalId(user) },
    });
};

// ── Hook: useUpdateInventory ───────────────────────────────────────────────────
/**
 * Actualiza precios y límites de stock de un registro existente.
 * Usar cuando `MergedInventoryItem.id_inventario` está definido.
 */
export const useUpdateInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: InventoryUpdateDTO }) =>
            InventoryService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Registro Actualizado',
                text: 'Los precios y límites se guardaron correctamente.',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 1500,
            });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message ?? 'Error al actualizar';
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
        },
    });
};

// ── Hook: useCreateMovement ────────────────────────────────────────────────────
/**
 * Registra un movimiento de inventario (entrada, salida, ajuste, etc.).
 * El backend actualiza stock_actual como efecto secundario.
 */
export const useCreateMovement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: MovimientoRequest) => InventoryService.createMovement(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Movimiento Registrado',
                text: 'El stock se ha actualizado correctamente.',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 1500,
            });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message ?? 'Error al registrar movimiento';
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
        },
    });
};

// ── Hook: useInventoryValuation ────────────────────────────────────────────────
/** Valor contable del inventario según el método de costeo seleccionado. */
export const useInventoryValuation = (metodo: ValuacionResult['metodo'] = 'promedio') => {
    const { user }    = useAuthStore();
    const sucursalId  = getSucursalId(user);

    return useQuery({
        queryKey: premiumInventoryKeys.valuation(sucursalId, metodo),
        queryFn:  () => InventoryService.getValuacion(sucursalId, metodo),
        enabled:  !!sucursalId,
        // La valuación no cambia por cada movimiento; 10 min es suficiente
        staleTime: 10 * 60 * 1000,
    });
};

// ── Hook: useInventoryRotation ─────────────────────────────────────────────────
/** Clasificación ABC de la sucursal activa (Principio de Pareto). */
export const useInventoryRotation = () => {
    const { user }   = useAuthStore();
    const sucursalId = getSucursalId(user);

    return useQuery({
        queryKey: premiumInventoryKeys.rotation(sucursalId),
        queryFn:  () => InventoryService.getRotacion(sucursalId),
        enabled:  !!sucursalId,
        staleTime: 15 * 60 * 1000,
    });
};

// ── Hook: useInventoryRotacionDetalle ──────────────────────────────────────────
/** Índice de rotación real (COGS / inventario promedio) por producto. */
export const useInventoryRotacionDetalle = () => {
    const { user }   = useAuthStore();
    const sucursalId = getSucursalId(user);

    return useQuery({
        queryKey: [...premiumInventoryKeys.rotation(sucursalId), 'detalle'] as const,
        queryFn:  () => InventoryService.getRotacionDetalle(sucursalId),
        enabled:  !!sucursalId,
        staleTime: 15 * 60 * 1000,
    });
};

// ── Hook: useMovimientoMasivo ──────────────────────────────────────────────────
/** Registra el mismo tipo de movimiento para múltiples productos en una operación atómica. */
export const useMovimientoMasivo = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: MovimientoMasivoRequest) =>
            InventoryService.createMovementMasivo(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            const count = Array.isArray(res.data) ? res.data.length : 0;
            Swal.fire({
                icon: 'success', title: 'Movimiento Masivo Registrado',
                text: `Se procesaron ${count} producto(s) correctamente.`,
                toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
            });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message ?? 'Error al procesar el movimiento masivo';
            Swal.fire({ icon: 'error', title: 'Error Transaccional', text: msg });
        },
    });
};
