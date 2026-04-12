import axiosClient from "../../../core/api/axiosClient";
import { ENDPOINTS } from "../../../core/api/endpoints";

export type TipoDocumento = "CEDULA" | "RUC" | "PASAPORTE";

export interface ClienteMetadata {
  categoria_fidelidad?: string;
  fecha_nacimiento?: string;
  limite_credito?: number;
}

export interface Cliente {
  id_cliente?: string;
  nombre_completo: string;
  tipo_documento: TipoDocumento;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  id_status: string;
  metadata?: ClienteMetadata;
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
  create: async (payload: Omit<Cliente, "id_cliente" | "created_at" | "updated_at">) => {
    const response = await axiosClient.post(ENDPOINTS.clientes.base, payload);
    return response.data;
  },
  update: async (id: string, payload: Omit<Cliente, "id_cliente" | "created_at" | "updated_at">) => {
    const response = await axiosClient.put(ENDPOINTS.clientes.byId(id), payload);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosClient.delete(ENDPOINTS.clientes.byId(id));
    return response.data;
  },
};
