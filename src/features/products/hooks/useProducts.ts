import { useState, useEffect, useMemo } from "react";
import { ProductService, type Product } from "../services/ProductService";
import { CategoryService } from "../services/CategoryService";
import { MedidaService } from "../services/MedidaService";
import { MonedaService } from "../services/MonedaService";
import { EstatusService } from "../../auth/services/EstatusService";
import { useAuthStore } from "../../auth/store/useAuthStore";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [estatusList, setEstatusList] = useState<any[]>([]);
  
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [resProd, resCats, resUnits, resCurrs, resStatus] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll(),
        MedidaService.getAll(),
        MonedaService.getAll(),
        EstatusService.getCatalogo()
      ]);

      setProducts((resProd.data || []).map((p: any) => ({ ...p, id_producto: p.id_producto || p.id })));
      setCategories(resCats.data || []);
      setUnits((resUnits.data || []).map((u: any) => ({ ...u, id_unidad: u.id_unidad || u.id_medida || u.id })));
      setCurrencies((resCurrs.data || []).map((c: any) => ({ ...c, id_moneda: c.id_moneda || c.id_divisa || c.id })));
      if (resStatus.success) setEstatusList(resStatus.data["2"]?.items || resStatus.data["1"]?.items || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAllData(); }, []);

  const filteredProducts = useMemo(() => 
    products.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase())), 
    [products, search]
  );

  const deleteProduct = async (id: string) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    setIsDeletingId(id);
    try {
      await ProductService.delete(id);
      await loadAllData();
    } catch (error) {
      alert("Error al eliminar");
    } finally {
      setIsDeletingId(null);
    }
  };

  return {
    products: filteredProducts,
    categories,
    units,
    currencies,
    estatusList,
    search,
    setSearch,
    isLoading,
    isSaving,
    setIsSaving,
    isDeletingId,
    user,
    refresh: loadAllData,
    deleteProduct
  };
};