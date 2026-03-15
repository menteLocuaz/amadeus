import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Estatus {
  id_status: string;
  moduloID: number;
  nombre: string;
  tipo: string;
}

export const EstatusService = {
  getAll: async (): Promise<Estatus[]> => {
    const { data } = await axiosClient.get<Estatus[]>(ENDPOINTS.estatus.base);
    return data;
  },

  getCatalogo: async () => {
    const { data } = await axiosClient.get(ENDPOINTS.estatus.catalogo);
    return data;
  },

  getByTipo: async (tipo: string): Promise<Estatus[]> => {
    const { data } = await axiosClient.get<Estatus[]>(ENDPOINTS.estatus.porTipo(tipo));
    return data;
  },

  getByModulo: async (id: number): Promise<Estatus[]> => {
    const { data } = await axiosClient.get<Estatus[]>(ENDPOINTS.estatus.porModulo(id));
    return data;
  },

  create: async (payload: { moduloID: number; nombre: string; tipo: string }) => {
    const { data } = await axiosClient.post(ENDPOINTS.estatus.base, payload);
    return data;
  }
};
