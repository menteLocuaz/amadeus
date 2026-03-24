import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseService, type CompraCreateRequest, type RecepcionRequest } from '../services/PurchaseService';
import { extractData } from '../../proveedor/hooks/useProveedoresQuery';
import { useAuthStore } from '../../auth/store/useAuthStore';
import Swal from 'sweetalert2';

export const compraKeys = {
    all: ['compras'] as const,
    lists: () => [...compraKeys.all, 'list'] as const,
    list: (sucursalId?: string) => [...compraKeys.lists(), { sucursalId }] as const,
    details: () => [...compraKeys.all, 'detail'] as const,
    detail: (id: string) => [...compraKeys.details(), id] as const,
};

export const useOrdersData = () => {
    const { user } = useAuthStore();
    const sucursalId = user?.id_sucursal;

    return useQuery({
        queryKey: compraKeys.list(sucursalId),
        queryFn: async () => {
            const res = await PurchaseService.getOrders(sucursalId);
            return extractData(res);
        },
    });
};

export const useOrderDetail = (id: string) => {
    return useQuery({
        queryKey: compraKeys.detail(id),
        queryFn: async () => {
            const res = await PurchaseService.getOrderById(id);
            return res.data;
        },
        enabled: !!id,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CompraCreateRequest) => PurchaseService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: compraKeys.all });
            Swal.fire({
                icon: 'success',
                title: 'Orden Creada',
                text: 'La orden de compra se ha registrado correctamente.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al crear orden',
                text: error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
            });
        }
    });
};

export const useReceiveOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: RecepcionRequest) => PurchaseService.receiveOrder(payload),
        onSuccess: () => {
            // Invalidar todas las consultas relacionadas para forzar el refresco de stock
            queryClient.invalidateQueries({ queryKey: compraKeys.all });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['premium-inventory'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['kardex'] });
            
            Swal.fire({
                icon: 'success',
                title: 'Mercancía Recibida',
                text: 'El stock ha sido actualizado correctamente.',
            });
        },
        onError: (error: any) => {
            const data = error.response?.data;
            const apiMessage = data?.message || data?.error || error.message || 'No se pudo procesar la recepción';
            Swal.fire({
                icon: 'error',
                title: 'Error en recepción',
                text: apiMessage,
                footer: `<div style="text-align: left; font-size: 0.8rem;"><pre>${JSON.stringify(data || error, null, 2)}</pre></div>`
            });
        },
    });
};
