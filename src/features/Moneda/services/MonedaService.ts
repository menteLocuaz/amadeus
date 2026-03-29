import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Moneda {
  id_moneda?: string;
  id_divisa?: string;
  nombre?: string;
  nombre_moneda?: string; // Nombre real probable en la API
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
}

export const MonedaService = {
  getAll: async (): Promise<{ status: string; data: Moneda[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.monedas.base);
    return data;
  },

  getById: async (id: string): Promise<{ status: string; data: Moneda }> => {
    const { data } = await axiosClient.get(ENDPOINTS.monedas.byId(id));
    return data;
  },

  create: async (payload: CreateMonedaDTO): Promise<{ status: string; data: Moneda }> => {
    const { data } = await axiosClient.post(ENDPOINTS.monedas.base, payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateMonedaDTO>): Promise<{ status: string; data: Moneda }> => {
    const { data } = await axiosClient.put(ENDPOINTS.monedas.byId(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.monedas.byId(id));
  }
};
