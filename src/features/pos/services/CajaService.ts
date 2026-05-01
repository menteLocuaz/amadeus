import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Caja {
    id_caja: string;
    nombre: string;
    id_sucursal: string;
    estado: number; // 1 = activa, 0 = inactiva
}

export interface CreateCajaDTO {
    nombre: string;
    id_sucursal: string;
    estado: number;
}

export const CajaService = {
    getCajas: async (): Promise<Caja[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.cajas.base);
        return data.data || [];
    },

    getByEstacion: async (id_estacion: string): Promise<Caja | null> => {
        try {
            const { data } = await axiosClient.get(ENDPOINTS.cajas.byEstacion(id_estacion));
            return data.data || data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    },

    crear: async (dto: CreateCajaDTO): Promise<Caja> => {
        const { data } = await axiosClient.post(ENDPOINTS.cajas.base, dto);
        return data.data || data;
    },
};
