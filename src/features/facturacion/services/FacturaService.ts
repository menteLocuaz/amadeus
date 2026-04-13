import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import type {
  Impuesto, ImpuestoDTO, FormaPago, FacturaCompletaRequest, FacturaResponse
} from '../types';

export const FacturaService = {
  // ── Impuestos CRUD ────────────────────────────────────────────────────────────
  getImpuestos: async (): Promise<Impuesto[]> => {
    const { data } = await axiosClient.get(ENDPOINTS.facturas.impuestos.base);
    return data.data ?? data;
  },

  getImpuestoById: async (id: string): Promise<Impuesto> => {
    const { data } = await axiosClient.get(ENDPOINTS.facturas.impuestos.byId(id));
    return data.data ?? data;
  },

  createImpuesto: async (payload: ImpuestoDTO): Promise<Impuesto> => {
    const { data } = await axiosClient.post(ENDPOINTS.facturas.impuestos.base, payload);
    return data.data ?? data;
  },

  updateImpuesto: async (id: string, payload: ImpuestoDTO): Promise<Impuesto> => {
    const { data } = await axiosClient.put(ENDPOINTS.facturas.impuestos.byId(id), payload);
    return data.data ?? data;
  },

  deleteImpuesto: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.facturas.impuestos.byId(id));
  },

  // ── Formas de Pago ────────────────────────────────────────────────────────────
  getFormasPago: async (): Promise<FormaPago[]> => {
    const { data } = await axiosClient.get(ENDPOINTS.facturas.formasPago);
    return data.data ?? data;
  },

  // ── Facturas ──────────────────────────────────────────────────────────────────
  getFacturas: async (params?: Record<string, unknown>): Promise<FacturaResponse[]> => {
    const { data } = await axiosClient.get(ENDPOINTS.facturas.base, { params });
    return data.data ?? data;
  },

  getFacturaById: async (id: string): Promise<FacturaResponse> => {
    const { data } = await axiosClient.get(`${ENDPOINTS.facturas.base}/${id}`);
    return data.data ?? data;
  },

  crearFacturaCompleta: async (payload: FacturaCompletaRequest): Promise<FacturaResponse> => {
    const { data } = await axiosClient.post(ENDPOINTS.facturas.completa, payload);
    return data.data ?? data;
  },
};
