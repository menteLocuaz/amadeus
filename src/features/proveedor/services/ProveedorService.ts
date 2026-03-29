import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Proveedor {
  id: string;
  id_proveedor?: string;
  nombre: string;
  ruc: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  id_status: string;
  id_sucursal: string;
  id_empresa: string;
  status?: { nombre: string };
  sucursal?: { nombre: string };
  empresa?: { nombre: string };
}

export interface ProveedorCreateRequest {
  nombre: string;
  ruc: string;
  telefono: string;
  direccion: string;
  email: string;
  id_status: string;
  id_sucursal: string;
  id_empresa: string;
}

export interface ProveedorUpdateRequest {
  nombre: string;
  ruc: string;
  telefono: string;
  direccion: string;
  email: string;
  id_status: string;
  id_sucursal: string;
  id_empresa: string;
}

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
