import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Caja {
    id: string;
    nombre: string;
    id_sucursal: string;
    id_estacion?: string;
    estado: 'ABIERTA' | 'CERRADA';
}

export const CajaService = {
    /**
     * Listar todas las cajas
     */
    getCajas: async (): Promise<Caja[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.cajas.base);
        return data.data || [];
    },

    /**
     * Obtener la caja vinculada a una estación POS
     */
    getByEstacion: async (id_estacion: string): Promise<Caja | null> => {
        try {
            const { data } = await axiosClient.get(ENDPOINTS.cajas.byEstacion(id_estacion));
            return data.data || data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.warn(`La estación ${id_estacion} no tiene una caja vinculada.`);
                return null;
            }
            throw error;
        }
    }
};
