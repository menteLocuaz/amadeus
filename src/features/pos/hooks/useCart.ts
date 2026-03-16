import { useState, useMemo } from "react";
import type { Product } from "../../products/services/ProductService";

export type CartItem = {
  product: Product;
  qty: number;
};

export const useCart = (initial: CartItem[] = []) => {
  const [items, setItems] = useState<CartItem[]>(initial);
  const [note, setNote] = useState("");

  const getPid = (p: Product) => p.id_producto || p.id || "";

  const add = (product: Product) => {
    setItems(prev => {
      const id = getPid(product);
      const idx = prev.findIndex(i => getPid(i.product) === id);
      
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [{ product, qty: 1 }, ...prev];
    });
  };

  const remove = (productId: string) => {
    setItems(prev => prev.filter(i => getPid(i.product) !== productId));
  };

  const changeQty = (productId: string, qty: number) => {
    setItems(prev => prev.map(i => {
      if (getPid(i.product) === productId) {
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
    const price = Number(it.product.precio_venta ?? 0);
    return s + price * it.qty;
  }, 0), [items]);

  const taxRate = 0.19; // Updated from 0.225 to match 19% shown in UI
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