import { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { useProductQueries, useProductMutations } from "./useProductQueries";

export const useProducts = () => {
  const [search, setSearch] = useState("");
  const { user } = useAuthStore();

  // --- Store de Catálogos (Centralizado) ---
  const { 
    categories, units, currencies, statusList, 
    fetchCatalogs, isLoading: isCatalogLoading 
  } = useCatalogStore();

  // --- Query de Productos (Dinámico con React Query) ---
  const { data: products = [], isLoading: isProdLoading, refetch } = useProductQueries();

  // --- Mutation ---
  const { deleteMutation } = useProductMutations();

  // Cargar catálogos si no están inicializados
  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const filteredProducts = useMemo(() => 
    products.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase())), 
    [products, search]
  );

  const deleteProduct = (id: string) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    deleteMutation.mutate(id);
  };

  const isLoading = isProdLoading || isCatalogLoading;

  return {
    products: filteredProducts,
    categories,
    units,
    currencies,
    estatusList: statusList,
    search,
    setSearch,
    isLoading,
    isDeletingId: deleteMutation.isPending ? deleteMutation.variables : (null as string | null),
    user,
    refresh: refetch,
    deleteProduct
  };
};
