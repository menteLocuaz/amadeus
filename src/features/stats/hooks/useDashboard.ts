import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../services/DashboardService";

/**
 * Hook to fetch all dashboard related data.
 */
export const useDashboard = () => {
  const resumenQuery = useQuery({
    queryKey: ["dashboard", "resumen"],
    queryFn: DashboardService.getResumen,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const deudaQuery = useQuery({
    queryKey: ["dashboard", "deuda-antiguedad"],
    queryFn: DashboardService.getAntiguedadDeuda,
    staleTime: 1000 * 60 * 5,
  });

  const composicionQuery = useQuery({
    queryKey: ["dashboard", "composicion-categoria"],
    queryFn: DashboardService.getComposicionCategoria,
    staleTime: 1000 * 60 * 5,
  });

  const mermasQuery = useQuery({
    queryKey: ["dashboard", "mermas"],
    queryFn: DashboardService.getMermas,
    staleTime: 1000 * 60 * 5,
  });

  return {
    resumen: resumenQuery.data || {
      valor_inventario_total: 0,
      productos_bajo_stock: 0,
      ventas_vs_compras: [],
      top_productos: [],
      punto_equilibrio: 0,
      gastos_mensuales: 0,
      ciclo_conversion_efectivo: 0,
      dio: 0, dso: 0, dpo: 0
    },
    deuda: deudaQuery.data || [],
    composicion: composicionQuery.data || [],
    mermas: mermasQuery.data || [],
    isLoading:
      resumenQuery.isLoading ||
      deudaQuery.isLoading ||
      composicionQuery.isLoading ||
      mermasQuery.isLoading,
    isError:
      resumenQuery.isError ||
      deudaQuery.isError ||
      composicionQuery.isError ||
      mermasQuery.isError,
    refetchAll: () => {
      resumenQuery.refetch();
      deudaQuery.refetch();
      composicionQuery.refetch();
      mermasQuery.refetch();
    },
  };
};
