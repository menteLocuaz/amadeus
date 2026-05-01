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

export interface AbrirSesionDTO {
    id_caja: string;
    id_usuario: string;
    monto_apertura: number;
}

export interface AbrirSesionResult {
    id_control_estacion: string;
    id_caja: string;
    monto_apertura: number;
}

export const CajaSesionService = {
  abrir: async (payload: AbrirSesionDTO): Promise<AbrirSesionResult> => {
    const { data } = await axiosClient.post(ENDPOINTS.cajaSesiones.abrir, payload);
    return data.data || data;
  },

  cerrar: async (id_sesion: string, payload: CierrePayload): Promise<CierreResult> => {
    const { data } = await axiosClient.post(ENDPOINTS.cajaSesiones.cerrar(id_sesion), payload);
    return data.data || data;
  },
};
