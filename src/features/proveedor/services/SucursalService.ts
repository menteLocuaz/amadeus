import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Sucursal {
  id: string;
  nombre: string;
}

export const SucursalService = {
  getAll: async (): Promise<{ success: boolean; data: Sucursal[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.sucursales.base);
    return data;
  }
};
