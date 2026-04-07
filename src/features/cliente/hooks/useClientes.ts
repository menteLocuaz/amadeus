import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClienteService, type Cliente } from "../services/ClienteService";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { useMemo } from "react";

export const useClientes = () => {
  const queryClient = useQueryClient();
  const { statusList } = useCatalogStore();

  // Filter status for Clientes (Module 6 or general)
  const clienteStatuses = useMemo(
    () => statusList.filter(s => s.mdl_id === 6),
    [statusList]
  );

  const { data: clientes = [], isLoading, refetch } = useQuery<Cliente[]>({
    queryKey: ["clientes"],
    queryFn: async () => {
      const res = await ClienteService.getAll();
      return res.data || (Array.isArray(res) ? res : []);
    },
  });

  const createMutation = useMutation({
    mutationFn: ClienteService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Cliente }) => 
      ClienteService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ClienteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });

  const deleteCliente = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return {
    clientes,
    clienteStatuses,
    isLoading,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    refresh: refetch,
    createCliente: createMutation.mutateAsync,
    updateCliente: updateMutation.mutateAsync,
    deleteCliente,
  };
};
