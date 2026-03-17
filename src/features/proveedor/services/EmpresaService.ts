import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Empresa {
  id: string;
  nombre: string;
}

export const EmpresaService = {
  getAll: async (): Promise<Empresa[]> => {
    // In endpoints.ts, empresas is just a string '/empresas' (the one I added)
    const { data } = await axiosClient.get<Empresa[]>(ENDPOINTS.empresas as any);
    return data;
  }
};
