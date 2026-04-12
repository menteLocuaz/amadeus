import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Category {
  id_categoria: string;
  nombre: string;
  id_sucursal: string;
  id_status: string;
  status?: {
    id_status: string;
    std_descripcion: string;
  };
}

export interface CreateCategoryDTO {
  nombre: string;
  id_sucursal: string;
  id_status: string;
}

export const CategoryService = {
  getAll: async (): Promise<{ status: string; data: Category[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.categorias.base);
    return data;
  },

  getById: async (id: string): Promise<{ status: string; data: Category }> => {
    const { data } = await axiosClient.get(ENDPOINTS.categorias.byId(id));
    return data;
  },

  create: async (payload: CreateCategoryDTO): Promise<{ status: string; data: Category }> => {
    const { data } = await axiosClient.post(ENDPOINTS.categorias.base, payload);
    return data;
  },

  update: async (id: string, payload: CreateCategoryDTO): Promise<{ status: string; data: Category }> => {
    const { data } = await axiosClient.put(ENDPOINTS.categorias.byId(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.categorias.byId(id));
  }
};
