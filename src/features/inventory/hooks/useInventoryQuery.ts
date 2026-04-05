/**
 * useInventoryQuery.ts
 * Hooks para la gestión de inventario basados en Movimientos.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryService, type MovimientoRequest } from '../services/InventoryService';
import { useAuthStore } from '../../auth/store/useAuthStore';
import Swal from 'sweetalert2';

export const inventoryKeys = {
    all: ['inventory'] as const,
    bySucursal: (id_sucursal: string) => [...inventoryKeys.all, 'sucursal', id_sucursal] as const,
    kardex: (id_producto: string) => [...inventoryKeys.all, 'kardex', id_producto] as const,
};

/**
 * Obtiene el inventario real de la sucursal del usuario.
 */
export const useInventoryItems = () => {
    const { user } = useAuthStore();
    const id_sucursal = user?.id_sucursal || (user as any)?.sucursal?.id;

    return useQuery({
        queryKey: inventoryKeys.bySucursal(id_sucursal || 'none'),
        queryFn: async () => {
            if (!id_sucursal) return [];
            const res = await InventoryService.getBySucursal(id_sucursal);
            return res.data || [];
        },
        enabled: !!id_sucursal, // Solo ejecuta la query si hay una sucursal identificada
    });
};

/**
 * Mutación para registrar movimientos (Ajuste/Merma/Entrada).
 * No actualiza el stock directamente, sino que envía el movimiento al Kardex.
 */
export const useRegisterMovement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: MovimientoRequest) => {
            return await InventoryService.createMovement(payload);
        },
        onSuccess: (_, variables) => {
            // Invalidamos las queries de inventario de esa sucursal
            queryClient.invalidateQueries({ 
                queryKey: inventoryKeys.bySucursal(variables.id_sucursal) 
            });
            // También invalidamos el Kardex si se estaba viendo
            queryClient.invalidateQueries({ 
                queryKey: inventoryKeys.kardex(variables.id_producto) 
            });

            Swal.fire({
                icon: 'success',
                title: 'Movimiento Registrado',
                text: 'El stock se actualizará automáticamente.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error de Movimiento',
                text: error.response?.data?.message || 'No se pudo procesar el ajuste',
            });
        }
    });
};
