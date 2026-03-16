import { useState, useMemo } from "react";
import type { Product } from "../../products/services/ProductService";

export type CartItem = {
  product: Product;
  qty: number;
};

export const useCart = (initial: CartItem[] = []) => {
  const [items, setItems] = useState<CartItem[]>(initial);
  const [note, setNote] = useState("");

  const add = (product: Product) => {
    setItems(prev => {
      const id = product.id_producto ?? (product as any).id;
      const idx = prev.findIndex(i => (i.product.id_producto ?? (i.product as any).id) === id);
      
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [{ product, qty: 1 }, ...prev];
    });
  };

  const remove = (productId: string) => {
    setItems(prev => prev.filter(i => (i.product.id_producto ?? (i.product as any).id) !== productId));
  };

  const changeQty = (productId: string, qty: number) => {
    setItems(prev => prev.map(i => {
      if ((i.product.id_producto ?? (i.product as any).id) === productId) {
        return { ...i, qty: Math.max(0, qty) };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const clear = () => {
    setItems([]);
    setNote("");
  };

  const subtotal = useMemo(() => items.reduce((s, it) => {
    // Corregido: Usamos solo precio_venta que es el que existe en tu interfaz Product
    const price = Number(it.product.precio_venta ?? 0);
    return s + price * it.qty;
  }, 0), [items]);

  const taxRate = 0.225; // 22.5%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    items,
    add,
    remove,
    changeQty,
    clear,
    subtotal,
    tax,
    total,
    note,
    setNote
  };
};