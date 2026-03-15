import { create } from 'zustand';
import { Product, ProductService } from '../services/ProductService';

// PATRÓN OBSERVER: Zustand notifica automáticamente a los componentes cuando el estado cambia
interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Acciones (Actions)
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await ProductService.getAll();
      set({ products: data, isLoading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
      set({ error: errorMessage, isLoading: false });
    }
  },

  addProduct: async (newProduct) => {
    set({ isLoading: true });
    try {
      const created = await ProductService.create(newProduct);
      set((state) => ({ 
        products: [...state.products, created], 
        isLoading: false 
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
      set({ error: errorMessage, isLoading: false });
    }
  }
}));
