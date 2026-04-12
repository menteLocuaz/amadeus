import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Proveedor {
  id_proveedor: string;
  razon_social: string;
  nit_rut: string;
  contacto_nombre?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  id_status: string;
  status?: { id_status: string; std_descripcion: string };
}

export interface ProveedorCreateRequest {
  razon_social: string;
  nit_rut: string;
  contacto_nombre?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  id_status: string;
}

export type ProveedorUpdateRequest = ProveedorCreateRequest;

export const ProveedorService = {
  getAll: async (): Promise<{ success: boolean; data: Proveedor[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.proveedores.base);
    return data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Proveedor }> => {
    const { data } = await axiosClient.get(ENDPOINTS.proveedores.byId(id));
    return data;
  },

  create: async (payload: ProveedorCreateRequest): Promise<{ success: boolean; data: Proveedor }> => {
    const { data } = await axiosClient.post(ENDPOINTS.proveedores.base, payload);
    return data;
  },

  update: async (id: string, payload: ProveedorUpdateRequest): Promise<{ success: boolean; data: Proveedor }> => {
    const { data } = await axiosClient.put(ENDPOINTS.proveedores.byId(id), payload);
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean; data: boolean }> => {
    const { data } = await axiosClient.delete(ENDPOINTS.proveedores.byId(id));
    return data;
  }
};
