import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface POSEstadoResponse {
    id_control_estacion?: string; // UUID (opcional si está cerrada)
    nombre_estacion: string;
    fondo_base: number;
    id_status?: string;          // UUID
    status_descripcion: string;  // Ej: "Cerrada", "Fondo Asignado", "Abierta"
    fecha_inicio?: string;       // ISO Date string
}

export interface OpenPOSDTO {
    id_estacion: string;
    id_user_pos: string;
    fondo_base: number;
}

export const POSService = {
    /**
     * Obtiene el estado actual de una terminal POS (estación, caja y periodo)
     */
    getEstado: async (id_estacion: string): Promise<POSEstadoResponse> => {
        try {
            const { data } = await axiosClient.get(ENDPOINTS.pos.estado(id_estacion));
            return data.data || data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error("La estación de trabajo no existe en el sistema.");
            }
            if (error.response?.status === 500) {
                throw new Error("Error interno del servidor al consultar el estado de la caja.");
            }
            throw new Error(error.response?.data?.message || "Error al obtener el estado de la caja");
        }
    },

    /**
     * Apertura de caja (Fondo Base)
     * Backend expects: { id_estacion: string, fondo_base: number, id_user_pos: string }
     */
    abrir: async (payload: OpenPOSDTO): Promise<any> => {
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
