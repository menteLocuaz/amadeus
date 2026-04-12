import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Medida {
  id_medida?: string;
  id_unidad?: string; // El campo real devuelto por la API
  id?: string;
  nombre: string;
  abreviatura: string;
  id_sucursal: string;
  id_status: string;
  status?: {
    id_status: string;
    std_descripcion: string;
  };
}

export interface CreateMedidaDTO {
  nombre: string;
  abreviatura: string;
  id_sucursal: string;
  id_status: string;
}

export const MedidaService = {
  getAll: async (): Promise<{ status: string; data: Medida[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.medidas.base);
    return data;
  },

  getById: async (id: string): Promise<{ status: string; data: Medida }> => {
    const { data } = await axiosClient.get(ENDPOINTS.medidas.byId(id));
    return data;
  },

  create: async (payload: CreateMedidaDTO): Promise<{ status: string; data: Medida }> => {
    const { data } = await axiosClient.post(ENDPOINTS.medidas.base, payload);
    return data;
  },

  update: async (id: string, payload: CreateMedidaDTO): Promise<{ status: string; data: Medida }> => {
    const { data } = await axiosClient.put(ENDPOINTS.medidas.byId(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.medidas.byId(id));
  }
};
