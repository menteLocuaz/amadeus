import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { type Caja } from './CajaService';
import { type ActivePeriodo } from '../store/usePOSStore';

export interface POSEstadoResponse {
    estacion: {
        id_estacion: string;
        nombre: string;
        id_sucursal: string;
    };
    caja: Caja | null;
    periodo: ActivePeriodo | null;
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
