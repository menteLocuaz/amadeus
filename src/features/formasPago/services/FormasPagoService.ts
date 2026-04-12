import axiosClient from "../../../core/api/axiosClient";
import { ENDPOINTS } from "../../../core/api/endpoints";

export interface FormaPago {
  id_forma_pago: string;
  nombre: string;
  requiere_ref: boolean;
  id_status: string;
  status?: {
    id_status: string;
    std_descripcion: string;
  };
}

export interface FormaPagoPayload {
  nombre: string;
  requiere_ref: boolean;
  id_status: string;
}

export const FormasPagoService = {
  getAll: async (): Promise<{ success: boolean; message: string; data: FormaPago[] }> => {
    const response = await axiosClient.get(ENDPOINTS.facturas.formasPago);
    return response.data;
  },

  create: async (payload: FormaPagoPayload) => {
    const response = await axiosClient.post(ENDPOINTS.facturas.formasPago, payload);
    return response.data;
  },

  update: async (id: string, payload: FormaPagoPayload) => {
    const response = await axiosClient.put(`${ENDPOINTS.facturas.formasPago}/${id}`, payload);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete(`${ENDPOINTS.facturas.formasPago}/${id}`);
    return response.data;
  },
};
