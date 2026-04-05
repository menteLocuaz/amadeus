/**
 * usePremiumInventoryQuery.ts
 * Custom hooks para la vista de Inventario & Catálogo (dashboard premium).
 *
 * A diferencia de useInventoryQuery.ts (que trabaja solo con registros de inventario),
 * este módulo fusiona datos de dos fuentes en paralelo:
 *   - ProductService  → catálogo maestro de productos
 *   - InventoryService → registros de stock por sucursal
 *
 * El resultado es un array de MergedInventoryItem: una vista desnormalizada
 * que garantiza que TODOS los productos aparezcan en la tabla, incluso si
 * aún no tienen un registro de inventario en la sucursal actual.
 *
 * Hooks exportados:
 *   usePremiumInventory    → query principal (merge productos + inventario)
 *   useInitializeInventory → mutación para crear el primer registro de inventario
 *   useUpdateInventory     → mutación para actualizar precios y límites de stock
 *   useCreateMovement      → mutación para registrar entradas/salidas/ajustes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService, type InventoryItem } from '../services/InventoryService';
import { ProductService, type Product } from '../../products/services/ProductService';
import { useAuthStore } from '../../auth/store/useAuthStore';
import Swal from 'sweetalert2';

// ── Query Key Factory ──────────────────────────────────────────────────────
/**
 * Fábrica de query keys para el módulo de inventario premium.
 * Separada de inventoryKeys (useInventoryQuery) para que las invalidaciones
 * de caché de este módulo no afecten las queries del módulo base y viceversa.
 */
export const premiumInventoryKeys = {
    all: ['premium-inventory'] as const,
    dashboard: () => [...premiumInventoryKeys.all, 'dashboard'] as const,
};

// ── Tipo: MergedInventoryItem ──────────────────────────────────────────────
/**
 * Representa un producto del catálogo enriquecido con su registro de inventario.
 *
 * Extiende Partial<InventoryItem> porque el registro de inventario puede no existir
 * para la sucursal actual (producto sin inicializar). En ese caso, los campos
 * de stock y precio se resuelven con fallbacks desde el producto base.
 *
 * `producto_original` conserva el objeto Product completo para acceso a
 * relaciones anidadas (categoría, unidad, moneda) sin necesidad de un JOIN adicional.
 */
export interface MergedInventoryItem extends Partial<InventoryItem> {
    id_producto: string;
    nombre: string;
    categoria_nombre: string;   // Desnormalizado desde producto.categoria.nombre
    unidad_nombre: string;      // Desnormalizado desde producto.unidad.nombre
    precio_venta: number;       // Inventario > Producto > 0
    precio_compra: number;      // Inventario > Producto > 0
    stock_actual: number;       // Inventario > Producto.stock > Producto.stock_actual > 0
    stock_minimo: number;
    stock_maximo: number;
    imagen?: string;
    producto_original: Product; // Referencia al producto fuente para operaciones posteriores
}

// ── Hook: usePremiumInventory ──────────────────────────────────────────────
/**
 * Query principal del dashboard de inventario.
 *
 * Estrategia de merge:
 *  1. Obtiene productos e inventario en paralelo con Promise.all.
 *  2. Normaliza ambas respuestas con `extract` (ver comentarios internos).
 *  3. Itera sobre TODOS los productos (no sobre el inventario) para garantizar
 *     que productos sin registro de inventario también aparezcan en la tabla.
 *  4. Para cada producto, busca su registro de inventario con múltiples fallbacks
 *     de ID, ya que el backend puede devolver el id del producto en distintos campos.
 *
 * La query key incluye `user?.id_sucursal` para que el caché sea independiente
 * por sucursal: si el usuario cambia de sucursal, se refetch automáticamente.
 */
export const usePremiumInventory = () => {
    const { user } = useAuthStore();

    return useQuery({
        // Incluir id_sucursal en la key garantiza caché separado por sucursal
        queryKey: [premiumInventoryKeys.dashboard()[0], user?.id_sucursal],
        queryFn: async () => {
            // Resolución del id de sucursal con múltiples rutas posibles en el objeto user
            const sucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || (user as any)?.sucursal?.id;

            // Peticiones en paralelo para minimizar el tiempo de carga total
            const [resProd, resInv] = await Promise.all([
                ProductService.getAll(),
                InventoryService.getBySucursal(sucursalId)
            ]);

            /**
             * Normaliza cualquier formato de respuesta del backend a un array plano.
             *
             * El backend de este proyecto puede devolver datos en múltiples estructuras
             * dependiendo del endpoint, versión o módulo activo:
             *
             *  Caso 1: Array directo          → [{ ... }]
             *  Caso 2: Wrapper data array     → { data: [...] }
             *  Caso 3: Wrapper items          → { items: [...] }
             *  Caso 4: Módulos numerados      → { data: { "2": { items: [...] } } }
             *            Prueba módulos: 2, 1, 3, 6, 4 en ese orden de prioridad
             *  Caso 5: Módulo con array directo → { data: { "1": [...] } }
             *  Caso 6: Búsqueda dinámica      → primer valor de data que tenga .items
             *  Caso 7: Objeto de registros    → filtra valores que tengan id_producto o id
             *  Caso 8: Fallback final         → res.data o []
             */
            const extract = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.items && Array.isArray(res.items)) return res.items;
                
                if (res.data && typeof res.data === 'object') {
                    // Caso 4 y 5: estructuras anidadas por número de módulo
                    const modData = res.data["2"] || res.data["1"] || res.data["3"] || res.data["6"] || res.data["4"];
                    if (modData && Array.isArray(modData.items)) return modData.items;
                    if (modData && Array.isArray(modData)) return modData;
                    
                    // Caso 6: búsqueda dinámica del primer objeto que contenga .items
                    const possibleItems = Object.values(res.data).find(v => typeof v === 'object' && Array.isArray((v as any).items));
                    if (possibleItems) return (possibleItems as any).items;
                    
                    // Caso 7: objeto de registros individuales → filtra solo los que parecen entidades válidas
                    return Object.values(res.data).filter(v => typeof v === 'object' && ((v as any).id_producto || (v as any).id)) || [];
                }
                return res.data || [];
            };

            const products = extract(resProd) as Product[];
            const inventory = extract(resInv) as InventoryItem[];

            /**
             * Merge: itera sobre productos (no sobre inventario) para incluir
             * productos que aún no tienen registro de inventario en esta sucursal.
             *
             * Si un producto no tiene registro de inventario (inv === undefined),
             * el spread de `...inv` no agrega nada y los campos se resuelven
             * con los valores del producto base o con 0 como último recurso.
             */
            return products.map(p => {
                const pId = p.id_producto || p.id;
                
                /**
                 * Búsqueda del registro de inventario con múltiples fallbacks de ID.
                 * El backend puede devolver el id del producto en distintos campos
                 * según el endpoint o la versión del serializer utilizado.
                 */
                const inv = inventory.find(i => {
                    const invProductId = i.id_producto || (i.producto as any)?.id_producto || (i.producto as any)?.id || (i as any).idProducto;
                    return String(invProductId) === String(pId);
                });

                /**
                 * Resolución del stock actual con cadena de fallbacks:
                 *  1. inv.stock_actual → registro de inventario de la sucursal (más preciso)
                 *  2. p.stock          → campo legacy del producto
                 *  3. p.stock_actual   → campo alternativo del producto
                 *  4. 0               → valor por defecto si no hay dato disponible
                 */
                const currentStock = inv?.stock_actual ?? p.stock ?? p.stock_actual ?? 0;

                return {
                    ...inv,             // Spread del registro de inventario (puede ser undefined)
                    id: inv?.id,        // Explícito para evitar que el spread lo omita
                    id_producto: pId as string,
                    nombre: p.nombre,
                    categoria_nombre: p.categoria?.nombre || 'Sin Categoría',
                    unidad_nombre: p.unidad?.nombre || 'Unid',
                    // Precio: prioriza el registro de inventario (puede tener precio especial por sucursal)
                    precio_venta: inv?.precio_venta ?? p.precio_venta ?? 0,
                    precio_compra: inv?.precio_compra ?? p.precio_compra ?? 0,
                    stock_actual: currentStock,
                    stock_minimo: inv?.stock_minimo ?? 0,
                    stock_maximo: inv?.stock_maximo ?? 0,
                    imagen: p.imagen,
                    producto_original: p  // Referencia completa para modales de detalle/edición
                } as Omit<MergedInventoryItem, 'id'> & { id?: string };
            });
        }
    });
};

// ── Hook: useInitializeInventory ───────────────────────────────────────────
/**
 * Crea el primer registro de inventario para un producto en una sucursal.
 * Se usa cuando `MergedInventoryItem.id` es undefined (producto sin inicializar).
 *
 * El tipo `any` en el payload está comentado como InventarioCreateRequest
 * para indicar que debe tipificarse cuando el contrato del backend esté definido.
 *
 * Invalida `premiumInventoryKeys.all` en onSuccess para refrescar el dashboard
 * y que el producto recién inicializado aparezca con su nuevo registro.
 */
export const useInitializeInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any /* InventarioCreateRequest */) => InventoryService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Inventario Inicializado', text: 'El producto ha sido configurado correctamente.',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
            });
        },
        onError: (error: any) => {
            // Intenta extraer el mensaje del cuerpo de la respuesta 400;
            // si no hay mensaje legible, serializa el objeto completo para depuración
            const errorData = error.response?.data;
            const errorMsg = errorData?.message || (errorData ? JSON.stringify(errorData) : 'Error desconocido al inicializar');
            console.error("Detalle Error 400:", errorData); // Log completo para debugging en consola
            Swal.fire({ icon: 'error', title: 'Error de Validación', text: errorMsg });
        }
    });
};

// ── Hook: useUpdateInventory ───────────────────────────────────────────────
/**
 * Actualiza un registro de inventario existente (precios, stock mínimo/máximo).
 * Requiere el `id` del registro de inventario (no del producto).
 *
 * Se usa cuando `MergedInventoryItem.id` está definido (producto ya inicializado).
 * Para productos sin registro, usar `useInitializeInventory` en su lugar.
 */
export const useUpdateInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string, payload: any /* InventarioUpdateRequest */ }) => 
            InventoryService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Registro actualizado', text: 'Los precios y límites se actualizaron.',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
            });
        },
        onError: (error: any) => {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al actualizar' });
        }
    });
};

// ── Hook: useCreateMovement ────────────────────────────────────────────────
/**
 * Registra un movimiento de inventario (entrada, salida o ajuste) en el Kardex.
 * Actualiza el stock_actual del registro de inventario como efecto secundario en el backend.
 *
 * Invalida `premiumInventoryKeys.all` para que el dashboard refleje
 * el nuevo stock inmediatamente después del movimiento.
 *
 * El tipo `any` en el payload está comentado como MovimientoCreateRequest
 * para indicar que debe tipificarse cuando el contrato del backend esté definido.
 */
export const useCreateMovement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any /* MovimientoCreateRequest */) => InventoryService.createMovement(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Movimiento Registrado', text: 'El stock se ha actualizado correctamente.',
                toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
            });
        },
        onError: (error: any) => {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error de movimiento' });
        }
    });
};