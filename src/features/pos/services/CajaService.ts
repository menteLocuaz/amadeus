import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface AperturaCajaDTO {
    id_caja: string;
    id_usuario: string;
    monto_apertura: number;
    turno?: string;
    notas?: string;
}

export interface Caja {
    id: string;
    nombre: string;
    id_sucursal: string;
    estado: 'ABIERTA' | 'CERRADA';
}

export const CajaService = {
    /**
     * Listar cajas físicas disponibles
     */
    getCajas: async (): Promise<Caja[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.caja as any);
        return data.data || [];
    },

    /**
     * Abrir una sesión de caja
     */
    abrirCaja: async (dto: AperturaCajaDTO): Promise<any> => {
        const { data } = await axiosClient.post(`${ENDPOINTS.caja}/abrir`, dto);
        return data;
    },

    /**
     * Cerrar una sesión de caja con arqueo
     */
    cerrarCaja: async (id_sesion: string, monto_cierre: number): Promise<any> => {
        const { data } = await axiosClient.post(`${ENDPOINTS.caja}/cerrar/${id_sesion}`, { monto_cierre });
        return data;
    }
};
