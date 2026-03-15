import { create } from 'zustand';
import { type Product } from '../services/ProductService';

interface CartItem extends Product {
  quantity: number;
}

interface PosState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],

  addToCart: (product) => {
    const { cart } = get();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      set({
        cart: cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      set({ cart: [...cart, { ...product, quantity: 1 }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.id !== productId) });
  },

  updateQuantity: (productId, delta) => {
    const { cart } = get();
    set({
      cart: cart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0),
    });
  },

  clearCart: () => set({ cart: [] }),

  getTotal: () => {
    return get().cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  },
}));
