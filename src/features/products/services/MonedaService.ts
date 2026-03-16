import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Moneda {
  id_moneda?: string;
  id_divisa?: string; // Posible nombre real en la API
  nombre: string;
  id_sucursal: string;
  id_status: string;
  status?: {
    id_status: string;
    std_descripcion: string;
  };
}

export interface CreateMonedaDTO {
  nombre: string;
  id_sucursal: string;
  id_status: string;
}

export const MonedaService = {
  getAll: async (): Promise<{ success: boolean; data: Moneda[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.monedas.base);
    return data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Moneda }> => {
    const { data } = await axiosClient.get(ENDPOINTS.monedas.byId(id));
    return data;
  },

  create: async (payload: CreateMonedaDTO): Promise<{ success: boolean; data: Moneda }> => {
    const { data } = await axiosClient.post(ENDPOINTS.monedas.base, payload);
    return data;
  },

  update: async (id: string, payload: CreateMonedaDTO): Promise<{ success: boolean; data: Moneda }> => {
    const { data } = await axiosClient.put(ENDPOINTS.monedas.byId(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.monedas.byId(id));
  }
};
