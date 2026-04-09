import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { type ActivePeriodo } from '../store/usePOSStore';

export interface AbrirPeriodoDTO {
    id_caja: string;
    monto_apertura: number;
    comentario?: string;
}

export const PeriodoService = {
    /**
     * Abrir un nuevo periodo (turno) global
     */
    abrir: async (): Promise<ActivePeriodo> => {
        const { data } = await axiosClient.post(ENDPOINTS.periodos.abrir);
        return data.data || data;
    },

    /**
     * Cerrar un periodo contable por ID
     */
    cerrar: async (id: string): Promise<void> => {
        await axiosClient.post(ENDPOINTS.periodos.cerrar(id));
    },

    /**
     * Obtener el periodo actual activo
     */
    getActivo: async (): Promise<ActivePeriodo | null> => {
        try {
            const { data } = await axiosClient.get(ENDPOINTS.periodos.activo);
            return data.data || data;
        } catch (error) {
            // Si no hay periodo activo, el backend podría devolver 404 o null
            return null;
        }
    }
};
