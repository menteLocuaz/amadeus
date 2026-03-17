import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Estatus {
  id_status: string;
  nombre: string;
  tipo: string;
  std_descripcion?: string; // Friendly description
  stp_tipo_estado?: string; // State type (e.g. STOCK)
  mdl_id?: number;          // Module ID
  moduloID?: number;        // Legacy field
}

export const EstatusService = {
  getAll: async (): Promise<{ success: boolean; data: Estatus[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.estatus.base);
    return data;
  },

  getCatalogo: async () => {
    const { data } = await axiosClient.get(ENDPOINTS.estatus.catalogo);
    return data;
  },

  getByTipo: async (tipo: string): Promise<{ success: boolean; data: Estatus[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.estatus.porTipo(tipo));
    return data;
  },

  getByModulo: async (id: number): Promise<{ success: boolean; data: Estatus[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.estatus.porModulo(id));
    return data;
  },

  create: async (payload: { moduloID: number; nombre: string; tipo: string }) => {
    const { data } = await axiosClient.post(ENDPOINTS.estatus.base, payload);
    return data;
  }
};
