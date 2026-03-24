import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService, type InventoryItem } from '../services/InventoryService';
import { useAuthStore } from '../../auth/store/useAuthStore';
import Swal from 'sweetalert2';

export const inventoryKeys = {
    all: ['inventory'] as const,
    lists: () => [...inventoryKeys.all, 'list'] as const,
    list: (filters: string) => [...inventoryKeys.lists(), { filters }] as const,
    details: () => [...inventoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.details(), id] as const,
};

export const useInventoryItems = () => {
    const { user } = useAuthStore();
    
    return useQuery({
        queryKey: inventoryKeys.lists(),
        queryFn: async () => {
            const res = await InventoryService.getAll();
            
            // Reusing extraction logic
            const extractData = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.items && Array.isArray(res.items)) return res.items;
                if (res.data && typeof res.data === 'object') {
                    // Try to catch nested structures often seen in this project
                    const modData = res.data["2"] || res.data["1"] || res.data["3"];
                    if (modData && Array.isArray(modData.items)) return modData.items;
                    return Object.values(res.data).filter(v => typeof v === 'object') as any[];
                }
                return [];
            };

            const allItems = extractData(res) as InventoryItem[];
            
            // Filtro por sucursal del usuario
            const currentUserSucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || (user as any)?.sucursal?.id;
            
            if (!currentUserSucursalId) return allItems;

            return allItems.filter(i => {
                const invSucursalId = i.id_sucursal || i.sucursal?.id_sucursal || i.sucursal?.id;
                return invSucursalId === currentUserSucursalId;
            });
        },
    });
};

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
            if (!user?.id_usuario) throw new Error("Usuario no autenticado");

            // 1. Update the inventory record
            await InventoryService.update(id, payload);

            // 2. Register movement if stock changed
            if (payload.stock_actual !== undefined && payload.stock_actual !== original.stock_actual) {
                const diff = payload.stock_actual - original.stock_actual;
                await InventoryService.createMovement({
                    id_producto: original.id_producto,
                    tipo_movimiento: 'AJUSTE',
                    cantidad: Math.abs(diff),
                    id_usuario: user.id_usuario,
                    referencia: motivo || "AJUSTE MANUAL"
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            Swal.fire({
                icon: 'success',
                title: 'Stock Actualizado',
                text: 'El ajuste se ha registrado correctamente.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al ajustar stock',
                text: error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
            });
        }
    });
};
