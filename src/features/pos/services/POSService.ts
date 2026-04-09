import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface POSEstadoResponse {
    id_control_estacion: string;
    nombre_estacion: string;
    fondo_base: number;
    id_status: string;
    status_descripcion: string;
    fecha_inicio: string;
}

export const POSService = {
    /**
     * Obtiene el estado actual de una terminal POS (estación, caja y periodo)
     */
    getEstado: async (id_estacion: string): Promise<POSEstadoResponse> => {
        const { data } = await axiosClient.get(ENDPOINTS.pos.estado(id_estacion));
        return data.data || data;
    },

    /**
     * Apertura de caja (Fondo Base)
     */
    abrir: async (payload: { id_estacion: string; monto_base: number }): Promise<any> => {
        const { data } = await axiosClient.post(ENDPOINTS.pos.abrir, payload);
        return data.data || data;
    },

    /**
     * Cierre de sesión de cajero
     */
    desmontar: async (payload: { id_estacion: string }): Promise<any> => {
        const { data } = await axiosClient.post(ENDPOINTS.pos.desmontar, payload);
        return data.data || data;
    },

    /**
     * Declaración de arqueo (Efectivo/Tarjetas)
     */
    actualizarValores: async (payload: { id_periodo: string; efectivo: number; tarjetas: number }): Promise<any> => {
        const { data } = await axiosClient.post(ENDPOINTS.pos.actualizarValores, payload);
        return data.data || data;
    }
};
