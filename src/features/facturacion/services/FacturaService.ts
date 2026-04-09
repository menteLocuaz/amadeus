import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { 
  Impuesto, FormaPago, FacturaCompletaRequest, FacturaResponse 
} from '../types';

export const FacturaService = {
  getImpuestos: async (): Promise<Impuesto[]> => {
    const { data } = await axiosClient.get(ENDPOINTS.facturas.impuestos);
    return data.data || data;
  },

  getFormasPago: async (): Promise<FormaPago[]> => {
    const { data } = await axiosClient.get(ENDPOINTS.facturas.formasPago);
    return data.data || data;
  },

  getFacturas: async (params?: any): Promise<FacturaResponse[]> => {
    const { data } = await axiosClient.get(ENDPOINTS.facturas.base, { params });
    return data.data || data;
  },

  getFacturaById: async (id: string): Promise<FacturaResponse> => {
    const { data } = await axiosClient.get(`${ENDPOINTS.facturas.base}/${id}`);
    return data.data || data;
  },

  crearFacturaCompleta: async (payload: FacturaCompletaRequest): Promise<FacturaResponse> => {
    const { data } = await axiosClient.post(ENDPOINTS.facturas.completa, payload);
    return data.data || data;
  }
};
