import { useMemo, useEffect } from "react";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCatalogStore, selectStatusMap, selectSucursalMap } from "../../../shared/store/useCatalogStore";
import { useProductQueries, useProductMutations } from "./useProductQueries";

/**
 * Hook para la gestión de productos e integración con catálogos globales.
 */
export const useProducts = () => {
  const { user } = useAuthStore();

  // --- Store de Catálogos (Centralizado) ---
  const {
    categories, units, currencies, sucursales, statusList,
    fetchCatalogs, isLoading: isCatalogLoading
  } = useCatalogStore();

  // Mapas para búsquedas O(1) en la UI
  const sucursalMap = useCatalogStore(selectSucursalMap);
  const statusMap = useCatalogStore(selectStatusMap);

  // Estatus del módulo 4 (Productos); si no hay, usar todos los estatus disponibles
  const productStatuses = useMemo(() => {
    const filtered = statusList.filter(s => s.mdl_id === 4);
    return filtered.length > 0 ? filtered : statusList;
  }, [statusList]);

  // --- Query de Productos (React Query) ---
  const { data: products = [], isLoading: isProdLoading, refetch } = useProductQueries();

  // --- Mutation ---
  const { deleteMutation } = useProductMutations();

  // Cargar catálogos si no están inicializados
  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const deleteProduct = (id: string) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    deleteMutation.mutate(id);
  };

  const isLoading = isProdLoading || isCatalogLoading;

  return {
    products, // Ya no filtramos aquí, TanStack Table se encarga del filtrado global
    categories,
    units,
    currencies,
    sucursales,
    estatusList: productStatuses,
    statusMap,
    sucursalMap,
    isLoading,
    isDeletingId: deleteMutation.isPending ? deleteMutation.variables : (null as string | null),
    user,
    refresh: refetch,
    deleteProduct
  };
};
