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
    
    // Case: { success: true, data: [...] }
    if (res.data && Array.isArray(res.data)) return res.data;
    
    // Case: { items: [...] }
    if (res.items && Array.isArray(res.items)) return res.items;

    // Aggressive search for any array property in the top level
    for (const key in res) {
        if (Array.isArray(res[key]) && res[key].length > 0) return res[key];
    }
    
    // Case: { data: { "1": { items: [...] }, "7": { items: [...] } } }
    const dataContainer = res.data || res; // Check res itself if no data property
    if (dataContainer && typeof dataContainer === 'object' && !Array.isArray(dataContainer)) {
        // Try known modules first (including 7 for Compras, 2 for Products)
        const commonModuleIds = ["2", "1", "3", "7", "8"];
        for (const id of commonModuleIds) {
            if (dataContainer[id]?.items && Array.isArray(dataContainer[id].items)) {
                return dataContainer[id].items;
            }
        }
        
        // Fallback: look for ANY key that has an 'items' array
        for (const key in dataContainer) {
            if (dataContainer[key]?.items && Array.isArray(dataContainer[key].items)) {
                return dataContainer[key].items;
            }
        }

        // Fallback: search for any array within data property
        for (const key in dataContainer) {
            if (Array.isArray(dataContainer[key]) && dataContainer[key].length > 0) return dataContainer[key];
        }

        // Fallback: return first object that looks like an array container
        const values = Object.values(dataContainer).filter(v => typeof v === 'object' && v !== null);
        if (values.length > 0) {
            return values as any[];
        }
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
        mutationFn: ({ id, payload }: { id: string; payload: ProveedorUpdateRequest }) => {
            if (!id || id === 'undefined') {
                console.error("ID de proveedor inválido capturado:", id);
                return Promise.reject(new Error("Error: ID de proveedor no especificado. Por favor recargue la página."));
            }
            return ProveedorService.update(id, payload);
        },
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
        mutationFn: (id: string) => {
            if (!id || id === 'undefined') {
                return Promise.reject(new Error("Error: ID de proveedor no especificado."));
            }
            return ProveedorService.delete(id);
        },
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
