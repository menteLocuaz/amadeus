import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Moneda {
  id_moneda: string;
  nombre: string;
  id_sucursal: string;
  id_status: string;
  // Metadata fields that may come from API
  status?: {
    id_status: string;
    std_descripcion: string;
  };
}

export interface CreateMonedaDTO {
  nombre: string;
  id_sucursal: string;
  id_status: string;
}

export const MonedaService = {
  /**
   * Fetches all currencies.
   */
  getAll: async (): Promise<{ status: string; data: any[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.monedas.base);
    return data;
  },

  /**
   * Fetches a single currency by ID.
   */
  getById: async (id: string): Promise<{ status: string; data: Moneda }> => {
    const { data } = await axiosClient.get(ENDPOINTS.monedas.byId(id));
    return data;
  },

  /**
   * Creates a new currency.
   */
  create: async (payload: CreateMonedaDTO): Promise<{ status: string; data: Moneda }> => {
    const { data } = await axiosClient.post(ENDPOINTS.monedas.base, payload);
    return data;
  },

  /**
   * Updates an existing currency.
   * Uses Partial<CreateMonedaDTO> to allow flexible updates.
   */
  update: async (id: string, payload: Partial<CreateMonedaDTO>): Promise<{ status: string; data: Moneda }> => {
    const { data } = await axiosClient.put(ENDPOINTS.monedas.byId(id), payload);
    return data;
  },

  /**
   * Deletes a currency by ID.
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.monedas.byId(id));
  }
};
