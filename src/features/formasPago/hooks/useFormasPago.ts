import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FormasPagoService, type FormaPago, type FormaPagoPayload } from "../services/FormasPagoService";

export const formasPagoKeys = {
  all: ["formas-pago"] as const,
};

export const useFormasPago = () => {
  const queryClient = useQueryClient();

  const { data: formasPago = [], isLoading, isError, refetch } = useQuery<FormaPago[]>({
    queryKey: formasPagoKeys.all,
    queryFn: async () => {
      const res = await FormasPagoService.getAll();
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormaPagoPayload) => FormasPagoService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: formasPagoKeys.all }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormaPagoPayload }) =>
      FormasPagoService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: formasPagoKeys.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => FormasPagoService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: formasPagoKeys.all }),
  });

  const deleteFormaPago = async (id: string) => {
    if (window.confirm("¿Eliminar esta forma de pago? Esta acción no se puede deshacer.")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return {
    formasPago,
    isLoading,
    isError,
    isMutating:
      createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    refresh: refetch,
    createFormaPago: createMutation.mutateAsync,
    updateFormaPago: updateMutation.mutateAsync,
    deleteFormaPago,
  };
};
