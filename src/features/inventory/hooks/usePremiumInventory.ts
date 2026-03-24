import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService, type InventoryItem } from '../services/InventoryService';
import { ProductService, type Product } from '../../products/services/ProductService';
import { useAuthStore } from '../../auth/store/useAuthStore';
import Swal from 'sweetalert2';

export const premiumInventoryKeys = {
    all: ['premium-inventory'] as const,
    dashboard: () => [...premiumInventoryKeys.all, 'dashboard'] as const,
};

export interface MergedInventoryItem extends Partial<InventoryItem> {
    id_producto: string;
    nombre: string;
    categoria_nombre: string;
    unidad_nombre: string;
    precio_venta: number;
    precio_compra: number;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    imagen?: string;
    producto_original: Product;
}

export const usePremiumInventory = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: [premiumInventoryKeys.dashboard()[0], user?.id_sucursal],
        queryFn: async () => {
            const sucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || (user as any)?.sucursal?.id;

            const [resProd, resInv] = await Promise.all([
                ProductService.getAll(),
                InventoryService.getAll(sucursalId)
            ]);

            const extract = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.items && Array.isArray(res.items)) return res.items;
                
                if (res.data && typeof res.data === 'object') {
                    // Intentar capturar estructuras anidadas (Módulos 1, 2, 3, 6, 4, etc.)
                    const modData = res.data["2"] || res.data["1"] || res.data["3"] || res.data["6"] || res.data["4"];
                    if (modData && Array.isArray(modData.items)) return modData.items;
                    if (modData && Array.isArray(modData)) return modData;
                    
                    // Buscar cualquier propiedad que sea un array de items
                    const possibleItems = Object.values(res.data).find(v => typeof v === 'object' && Array.isArray((v as any).items));
                    if (possibleItems) return (possibleItems as any).items;
                    
                    // Si es un objeto de objetos que parecen registros
                    return Object.values(res.data).filter(v => typeof v === 'object' && ((v as any).id_producto || (v as any).id)) || [];
                }
                return res.data || [];
            };

            const products = extract(resProd) as Product[];
            const inventory = extract(resInv) as InventoryItem[];

            return products.map(p => {
                const pId = p.id_producto || p.id;
                
                // Search inventory with robust fallbacks
                const inv = inventory.find(i => {
                    const invProductId = i.id_producto || (i.producto as any)?.id_producto || (i.producto as any)?.id || i.idProducto;
                    return String(invProductId) === String(pId);
                });

                const currentStock = inv?.stock_actual ?? p.stock ?? p.stock_actual ?? 0;

                return {
                    ...inv, // this will be undefined if no inventory record exists for the sucursal
                    id: inv?.id, // explicit
                    id_producto: pId as string,
                    nombre: p.nombre,
                    categoria_nombre: p.categoria?.nombre || 'Sin Categoría',
                    unidad_nombre: p.unidad?.nombre || 'Unid',
                    // Use inventory price if available, else fallback to product defaults
                    precio_venta: inv?.precio_venta ?? p.precio_venta ?? 0,
                    precio_compra: inv?.precio_compra ?? p.precio_compra ?? 0,
                    stock_actual: currentStock,
                    stock_minimo: inv?.stock_minimo ?? 0,
                    stock_maximo: inv?.stock_maximo ?? 0,
                    imagen: p.imagen,
                    producto_original: p
                } as Omit<MergedInventoryItem, 'id'> & { id?: string };
            });
        }
    });
};

export const useInitializeInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any /* InventarioCreateRequest */) => InventoryService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Inventario Inicializado', text: 'El producto ha sido configurado correctamente.', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
            });
        },
        onError: (error: any) => {
            const errorData = error.response?.data;
            const errorMsg = errorData?.message || (errorData ? JSON.stringify(errorData) : 'Error desconocido al inicializar');
            console.error("Detalle Error 400:", errorData);
            Swal.fire({ icon: 'error', title: 'Error de Validación', text: errorMsg });
        }
    });
};

export const useUpdateInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string, payload: any /* InventarioUpdateRequest */ }) => InventoryService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Registro actualizado', text: 'Los precios y límites se actualizaron.', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
            });
        },
        onError: (error: any) => {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al actualizar' });
        }
    });
};

export const useCreateMovement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any /* MovimientoCreateRequest */) => InventoryService.createMovement(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success', title: 'Movimiento Registrado', text: 'El stock se ha actualizado correctamente.', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500
            });
        },
        onError: (error: any) => {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error de movimiento' });
        }
    });
};
