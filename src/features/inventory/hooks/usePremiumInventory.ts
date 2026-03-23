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
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const query = useQuery({
        queryKey: premiumInventoryKeys.dashboard(),
        queryFn: async () => {
            const [resProd, resInv] = await Promise.all([
                ProductService.getAll(),
                InventoryService.getAll()
            ]);

            const extract = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                return res.data || [];
            };

            const products = extract(resProd) as Product[];
            const inventory = extract(resInv) as InventoryItem[];

            // Merge Logic: Show all products, even if they don't have inventory records
            return products.map(p => {
                const pId = p.id_producto || p.id;
                const inv = inventory.find(i => i.id_producto === pId);

                return {
                    ...inv,
                    id_producto: pId as string,
                    nombre: p.nombre,
                    categoria_nombre: p.categoria?.nombre || 'Sin Categoría',
                    unidad_nombre: p.unidad?.nombre || 'Unid',
                    precio_venta: inv?.precio_venta ?? p.precio_venta ?? 0,
                    precio_compra: inv?.precio_compra ?? p.precio_compra ?? 0,
                    stock_actual: inv?.stock_actual ?? 0,
                    stock_minimo: inv?.stock_minimo ?? 0,
                    stock_maximo: inv?.stock_maximo ?? 0,
                    imagen: p.imagen,
                    producto_original: p
                } as MergedInventoryItem;
            });
        }
    });

    const adjustStock = useMutation({
        mutationFn: async ({ id_producto, payload, motivo }: { 
            id_producto: string; 
            payload: any; 
            motivo?: string 
        }) => {
            if (!user?.id_usuario) throw new Error("Usuario no autenticado");

            // 1. Check if inventory record exists
            const currentData = query.data || [];
            const existing = currentData.find(i => i.id_producto === id_producto);

            if (existing?.id) {
                // Update existing
                await InventoryService.update(existing.id, payload);
            } else {
                // Create new initial record if it doesn't exist
                // This might need a specific endpoint or just the POST /inventario
                // For now, assume update handles initialization if ID is missing or use create logic
                // According to doc/api.md: POST /inventario creates initial record
                await InventoryService.createMovement({
                    id_producto,
                    tipo_movimiento: 'AJUSTE',
                    cantidad: payload.stock_actual || 0,
                    id_usuario: user.id_usuario,
                    referencia: motivo || "INICIALIZACIÓN"
                });
            }

            // Register movement if stock changed and it's not the first time
            if (existing?.id && payload.stock_actual !== undefined && payload.stock_actual !== existing.stock_actual) {
                const diff = payload.stock_actual - existing.stock_actual;
                await InventoryService.createMovement({
                    id_producto,
                    tipo_movimiento: 'AJUSTE',
                    cantidad: Math.abs(diff),
                    id_usuario: user.id_usuario,
                    referencia: motivo || "AJUSTE MANUAL"
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: premiumInventoryKeys.all });
            Swal.fire({
                icon: 'success',
                title: 'Stock Actualizado',
                text: 'El cambio se ha guardado correctamente.',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    });

    return {
        ...query,
        adjustStock
    };
};
