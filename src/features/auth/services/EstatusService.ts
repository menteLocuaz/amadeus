import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Estatus {
  id_status: string;
  nombre?: string;
  descripcion?: string;     // API returns this field (e.g. "PENDIENTE", "RECIBIDO")
  tipo?: string;
  tipo_estado?: string;     // e.g. "COMPRA"
  std_descripcion?: string; // Friendly description
  stp_tipo_estado?: string; // State type (e.g. "STOCK")
  mdl_id?: number;          // Module ID
  moduloID?: number;        // Legacy field
}

export interface CatalogModule {
  modulo: string;
  items: Array<{
    id: string;
    descripcion: string;
    tipo: string;
  }>;
}

export interface CatalogResponse {
  status: 'success' | 'error';
  data: Record<string, CatalogModule>;
}

export const EstatusService = {
  getAll: async (): Promise<{ status: string; data: Estatus[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.estatus.base);
    return data;
  },

  getCatalogo: async (): Promise<CatalogResponse> => {
    const { data } = await axiosClient.get<CatalogResponse>(ENDPOINTS.estatus.catalogo);
    return data;
  },

  getByTipo: async (tipo: string): Promise<{ status: string; data: Estatus[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.estatus.porTipo(tipo));
    return data;
  },

  getByModulo: async (id: number): Promise<{ status: string; data: Estatus[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.estatus.porModulo(id));
    return data;
  },

  create: async (payload: { moduloID: number; nombre: string; tipo: string }) => {
    const { data } = await axiosClient.post(ENDPOINTS.estatus.base, payload);
    return data;
  }
};
