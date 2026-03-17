import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Sucursal {
  id: string;
  nombre: string;
}

export const SucursalService = {
  getAll: async (): Promise<Sucursal[]> => {
    // In endpoints.ts, sucursales is just a string '/sucursales'
    const { data } = await axiosClient.get<Sucursal[]>(ENDPOINTS.sucursales as any);
    return data;
  }
};
