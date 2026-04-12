import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface CierrePayload {
  monto_cierre: number;
}

export interface CierreResult {
  ventas_sistema: number;
  efectivo_fisico: number;
  diferencia: number;
  resultado: 'CUADRADO' | 'FALTANTE' | 'SOBRANTE';
  mensaje: string;
}

export const CajaSesionService = {
  cerrar: async (id_sesion: string, payload: CierrePayload): Promise<CierreResult> => {
    const { data } = await axiosClient.put(ENDPOINTS.cajaSesiones.byId(id_sesion), payload);
    return data.data || data;
  },
};
