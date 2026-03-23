import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Empresa {
  id: string;
  nombre: string;
}

export const EmpresaService = {
  getAll: async (): Promise<{ success: boolean; data: Empresa[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.empresas.base);
    return data;
  }
};
