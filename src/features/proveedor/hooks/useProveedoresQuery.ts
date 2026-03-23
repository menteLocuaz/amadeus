import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProveedorService, type Proveedor, type ProveedorCreateRequest, type ProveedorUpdateRequest } from '../services/ProveedorService';
import Swal from 'sweetalert2';

export const proveedorKeys = {
    all: ['proveedores'] as const,
    lists: () => [...proveedorKeys.all, 'list'] as const,
    list: (filters: string) => [...proveedorKeys.lists(), { filters }] as const,
    details: () => [...proveedorKeys.all, 'detail'] as const,
    detail: (id: string) => [...proveedorKeys.details(), id] as const,
};

// Extraction utility shared for robustness
export const extractData = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.items && Array.isArray(res.items)) return res.items;
    if (res.data && typeof res.data === 'object') {
        const modData = res.data["2"] || res.data["1"] || res.data["3"];
        if (modData && Array.isArray(modData.items)) return modData.items;
        return Object.values(res.data).filter(v => typeof v === 'object') as any[];
    }
    return [];
};

export const useProveedoresData = () => {
    return useQuery({
        queryKey: proveedorKeys.lists(),
        queryFn: async () => {
            const res = await ProveedorService.getAll();
            return extractData(res) as Proveedor[];
        },
    });
};

export const useCreateProveedor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ProveedorCreateRequest) => ProveedorService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: proveedorKeys.all });
            Swal.fire({
                icon: 'success',
                title: 'Proveedor Creado',
                text: 'El proveedor se ha registrado correctamente.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al crear proveedor',
                text: error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
            });
        }
    });
};

export const useUpdateProveedor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ProveedorUpdateRequest }) => 
            ProveedorService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: proveedorKeys.all });
            Swal.fire({
                icon: 'success',
                title: 'Proveedor Actualizado',
                text: 'Los datos se han guardado correctamente.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al actualizar proveedor',
                text: error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
            });
        }
    });
};

export const useDeleteProveedor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ProveedorService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: proveedorKeys.all });
            Swal.fire({
                icon: 'success',
                title: 'Proveedor Eliminado',
                text: 'El registro ha sido borrado.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al eliminar proveedor',
                text: error.response?.data?.message || error.message || 'No se pudo eliminar el proveedor.',
            });
        }
    });
};
