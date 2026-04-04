import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { DispositivoService } from "../services/DispositivoService";
import { EstacionService } from "../../estacion/services/EstacionService";

/**
 * Hook Especializado: Gestión de Datos (Queries y Mutations)
 * Se encarga del ciclo de vida del servidor (Server State).
 */
export const useDispositivosData = () => {
    const queryClient = useQueryClient();

    // Query: Listado completo de dispositivos
    const dispositivosQuery = useQuery({
        queryKey: ['dispositivos'],
        queryFn: DispositivoService.getAll,
        staleTime: 1000 * 60 * 5, // 5 minutos de caché fresca
    });

    // Query: Listado de estaciones (Catálogo para selectores)
    const estacionesQuery = useQuery({
        queryKey: ['estaciones'],
        queryFn: EstacionService.getAll,
    });

    // Mutation: Guardado (Crear/Editar)
    const saveMutation = useMutation({
        mutationFn: ({ id, data }: { id?: string; data: any }) => 
            id ? DispositivoService.update(id, data) : DispositivoService.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['dispositivos'] });
            toast.success(variables.id ? "Dispositivo actualizado" : "Dispositivo creado");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Error al guardar"),
    });

    // Mutation: Eliminación
    const deleteMutation = useMutation({
        mutationFn: DispositivoService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dispositivos'] });
            toast.success("Dispositivo eliminado");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Error al eliminar"),
    });

    return {
        dispositivos: dispositivosQuery.data ?? [],
        estaciones: estacionesQuery.data ?? [],
        isLoading: dispositivosQuery.isLoading || estacionesQuery.isLoading,
        error: dispositivosQuery.error,
        save: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        remove: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        deletingId: deleteMutation.variables
    };
};
