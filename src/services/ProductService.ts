import axiosClient from '../api/axiosClient';

// INTERFAZ DE DOMINIO: Asegura el tipado fuerte en todo el flujo
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

// PATRÓN FACTORY/SERVICE: Centraliza la lógica de peticiones para "Productos"
export const ProductService = {
  /**
   * Obtiene la lista completa de productos
   */
  getAll: async (): Promise<Product[]> => {
    const { data } = await axiosClient.get<Product[]>('/products');
    return data;
  },

  /**
   * Obtiene un producto específico por su ID
   */
  getById: async (id: string): Promise<Product> => {
    const { data } = await axiosClient.get<Product>(`/products/${id}`);
    return data;
  },

  /**
   * Crea un nuevo producto
   */
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const { data } = await axiosClient.post<Product>('/products', product);
    return data;
  }
};
