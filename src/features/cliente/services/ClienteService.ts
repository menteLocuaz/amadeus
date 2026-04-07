import axiosClient from "../../../core/api/axiosClient";
import { ENDPOINTS } from "../../../core/api/endpoints";

export interface Cliente {
  id_cliente?: string;
  empresa_cliente: string;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  id_status: string;
  created_at?: string;
  updated_at?: string;
}

export const ClienteService = {
  getAll: async () => {
    const response = await axiosClient.get(ENDPOINTS.clientes.base);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosClient.get(ENDPOINTS.clientes.byId(id));
    return response.data;
  },
  create: async (payload: Cliente) => {
    const response = await axiosClient.post(ENDPOINTS.clientes.base, payload);
    return response.data;
  },
  update: async (id: string, payload: Cliente) => {
    const response = await axiosClient.put(ENDPOINTS.clientes.byId(id), payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosClient.delete(ENDPOINTS.clientes.byId(id));
    return response.data;
  },
};
