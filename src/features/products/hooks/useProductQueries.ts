import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductService } from "../services/ProductService";
import { CategoryService } from "../services/CategoryService";
import { MedidaService } from "../services/MedidaService";
import { MonedaService } from "../services/MonedaService";
import { EstatusService } from "../../auth/services/EstatusService";
import { PurchaseService } from "../../purchases/services/PurchaseService";

// --- Hooks de Consulta (Lectura) ---

export const useProductQueries = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const resProd = await ProductService.getAll();
      const resInv = await PurchaseService.getAll();
      
      const inventoryList = Array.isArray(resInv) ? resInv : (resInv.data || []);
      const mappedProducts = (resProd.data || []).map((p: any) => {
        const id = p.id_producto || p.id;
        const inv = inventoryList.find((i: any) => i.id_producto === id);
        return { 
          ...p, 
          id_producto: id,
          stock: inv?.stock_actual ?? p.stock ?? 0,
          stock_actual: inv?.stock_actual ?? p.stock ?? 0,
          precio_compra: inv?.precio_compra ?? p.precio_compra ?? 0,
          precio_venta: inv?.precio_venta ?? p.precio_venta ?? 0
        };
      });
      return mappedProducts;
    },
  });
};

export const useCategoryQueries = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await CategoryService.getAll();
      return res.data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hora de caché (cambia poco)
  });
};

export const useUnitQueries = () => {
  return useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await MedidaService.getAll();
      return (res.data || []).map((u: any) => ({ 
        ...u, 
        id_unidad: u.id_unidad || u.id_medida || u.id 
      }));
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useCurrencyQueries = () => {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const res = await MonedaService.getAll();
      return (res.data || []).map((c: any) => ({ 
        ...c, 
        id_moneda: c.id_moneda || c.id_divisa || c.id 
      }));
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useStatusQueries = () => {
  return useQuery({
    queryKey: ["status-catalog"],
    queryFn: async () => {
      const res = await EstatusService.getCatalogo();
      if (res.success) {
        return res.data["2"]?.items || res.data["1"]?.items || [];
      }
      return [];
    },
    staleTime: 1000 * 60 * 60,
  });
};

// --- Hooks de Mutación (Escritura) ---

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return { deleteMutation };
};
