import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await axiosClient.get<Product[]>(ENDPOINTS.productos.base);
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await axiosClient.get<Product>(ENDPOINTS.productos.byId(id));
    return data;
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const { data } = await axiosClient.post<Product>(ENDPOINTS.productos.base, product);
    return data;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data } = await axiosClient.put<Product>(ENDPOINTS.productos.byId(id), product);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.productos.byId(id));
  }
};
