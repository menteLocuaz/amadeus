import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await axiosClient.get<Product[]>(ENDPOINTS.products.base);
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await axiosClient.get<Product>(ENDPOINTS.products.byId(id));
    return data;
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const { data } = await axiosClient.post<Product>(ENDPOINTS.products.base, product);
    return data;
  }
};
