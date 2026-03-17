import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Empresa {
  id: string;
  nombre: string;
}

export const EmpresaService = {
  getAll: async (): Promise<{ success: boolean; data: Empresa[] }> => {
    // In endpoints.ts, empresas is just a string '/empresas' (the one I added)
    const { data } = await axiosClient.get(ENDPOINTS.empresas as any);
    return data;
  }
};
