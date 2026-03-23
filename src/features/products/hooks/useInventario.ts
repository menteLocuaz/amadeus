import { useState, useEffect, useMemo } from "react";
import { ProductService, type Product } from "../services/ProductService";
import { PurchaseService } from "../../purchases/services/PurchaseService";

export const useInventario = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStockBajo, setFilterStockBajo] = useState(false);
  const [search, setSearch] = useState("");

  const loadInventario = async () => {
    setIsLoading(true);
    try {
      const [resProd, resInv] = await Promise.all([
        ProductService.getAll(),
        PurchaseService.getInventory()
      ]);
      
      const productList = resProd.data || [];
      const inventoryList = Array.isArray(resInv) ? resInv : (resInv.data || []);

      const merged = productList.map((p: any) => {
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

      setProducts(merged);
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