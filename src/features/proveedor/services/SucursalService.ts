import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Sucursal {
  id: string;
  nombre: string;
}

export const SucursalService = {
  getAll: async (): Promise<{ success: boolean; data: Sucursal[] }> => {
    // In endpoints.ts, sucursales is just a string '/sucursales'
    const { data } = await axiosClient.get(ENDPOINTS.sucursales as any);
    return data;
  }
};
