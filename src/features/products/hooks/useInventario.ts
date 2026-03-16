import { useState, useEffect, useMemo } from "react";
import { ProductService, type Product } from "../services/ProductService";

export const useInventario = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStockBajo, setFilterStockBajo] = useState(false);
  const [search, setSearch] = useState("");

  const loadInventario = async () => {
    setIsLoading(true);
    try {
      const res = await ProductService.getAll();
      setProducts(res.data || []);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadInventario(); }, []);

  const filteredInventario = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || 
                            p.id_producto?.toString().includes(search);
      const matchesStock = filterStockBajo ? (p.stock <= 5) : true; // Umbral de 5 unidades
      return matchesSearch && matchesStock;
    });
  }, [products, search, filterStockBajo]);

  return {
    products: filteredInventario,
    isLoading,
    search,
    setSearch,
    filterStockBajo,
    setFilterStockBajo,
    refresh: loadInventario
  };
};