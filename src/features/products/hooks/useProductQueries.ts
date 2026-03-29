import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductService, type Product } from "../services/ProductService";
import { CategoryService } from "../services/CategoryService";
import { MedidaService } from "../services/MedidaService";
import { MonedaService } from "../../Moneda/services/MonedaService";
import { EstatusService } from "../../auth/services/EstatusService";
import { InventoryService } from "../../inventory/services/InventoryService";
import { useAuthStore } from "../../auth/store/useAuthStore";

// --- Hooks de Consulta (Lectura) ---

export const useProductQueries = () => {
  const { user } = useAuthStore();
  
  return useQuery<Product[]>({
    queryKey: ["products", user?.id_sucursal],
    queryFn: async () => {
      // Obtener sucursal actual
      const sucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || (user as any)?.sucursal?.id;

      const [resProd, resInv] = await Promise.all([
        ProductService.getAll(),
        InventoryService.getAll(sucursalId)
      ]);
      
      const extract = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (res.items && Array.isArray(res.items)) return res.items;
        
        if (res.data && typeof res.data === 'object') {
          // Intentar capturar estructuras anidadas (Módulos 1, 2, 3, 6, 4, etc.)
          const modData = res.data["2"] || res.data["1"] || res.data["3"] || res.data["6"] || res.data["4"];
          if (modData && Array.isArray(modData.items)) return modData.items;
          if (modData && Array.isArray(modData)) return modData;
          
          // Buscar cualquier propiedad que sea un array de items
          const possibleItems = Object.values(res.data).find(v => typeof v === 'object' && Array.isArray((v as any).items));
          if (possibleItems) return (possibleItems as any).items;
          
          // Si es un objeto de objetos que parecen registros
          return Object.values(res.data).filter(v => typeof v === 'object' && ((v as any).id_producto || (v as any).id)) || [];
        }
        return res.data || [];
      };

      const products = extract(resProd);
      const inventory = extract(resInv);

      const mappedProducts = products.map((p: any): Product => {
        const pId = p.id_producto || p.id;
        
        // Buscar el registro de inventario que coincida con el producto
        const inv = inventory.find((i: any) => {
          const invProductId = i.id_producto || i.producto?.id_producto || i.producto?.id || i.idProducto;
          return String(invProductId) === String(pId);
        });

        // Prioridad: 1. Stock de Inventario por sucursal, 2. Stock base del producto, 3. Cero
        const currentStock = inv?.stock_actual ?? p.stock ?? p.stock_actual ?? 0;

        return { 
          ...p, 
          id_producto: pId,
          stock: currentStock,
          stock_actual: currentStock,
          precio_compra: p.precio_compra ?? inv?.precio_compra ?? 0,
          precio_venta: p.precio_venta ?? inv?.precio_venta ?? 0
        } as Product;
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
      if (res.status === 'success') {
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
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => ProductService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => ProductService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["kardex"] });
    },
  });

  return { deleteMutation, createMutation, updateMutation };
};
