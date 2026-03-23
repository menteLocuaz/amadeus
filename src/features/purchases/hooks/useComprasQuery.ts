import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseService, type CompraCreateRequest, type RecepcionRequest } from '../services/PurchaseService';
import { extractData } from '../../proveedor/hooks/useProveedoresQuery';
import Swal from 'sweetalert2';

export const compraKeys = {
    all: ['compras'] as const,
    lists: () => [...compraKeys.all, 'list'] as const,
    details: () => [...compraKeys.all, 'detail'] as const,
    detail: (id: string) => [...compraKeys.details(), id] as const,
};

export const useOrdersData = () => {
    return useQuery({
        queryKey: compraKeys.lists(),
        queryFn: async () => {
            const res = await PurchaseService.getOrders();
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
            queryClient.invalidateQueries({ queryKey: compraKeys.all });
            queryClient.invalidateQueries({ queryKey: ['inventario'] });
            queryClient.invalidateQueries({ queryKey: ['kardex'] });
            Swal.fire({
                icon: 'success',
                title: 'Mercancía Recibida',
                text: 'El stock ha sido actualizado correctamente.',
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error en recepción',
                text: error.response?.data?.message || error.message || 'No se pudo procesar la recepción',
            });
        }
    });
};
