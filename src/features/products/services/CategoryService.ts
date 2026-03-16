import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Category {
  id_categoria: string;
  nombre: string;
  id_sucursal: string;
}

export interface CreateCategoryDTO {
  nombre: string;
  id_sucursal: string;
}

export const CategoryService = {
  getAll: async (): Promise<{ success: boolean; data: Category[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.categorias.base);
    return data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Category }> => {
    const { data } = await axiosClient.get(ENDPOINTS.categorias.byId(id));
    return data;
  },

  create: async (payload: CreateCategoryDTO): Promise<{ success: boolean; data: Category }> => {
    const { data } = await axiosClient.post(ENDPOINTS.categorias.base, payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateCategoryDTO>): Promise<{ success: boolean; data: Category }> => {
    const { data } = await axiosClient.put(ENDPOINTS.categorias.byId(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.categorias.byId(id));
  }
};
