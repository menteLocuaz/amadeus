import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface EstacionAPI {
    id_estacion: string;
    codigo: string;
    nombre: string;
    ip: string;
    id_sucursal: string;
    id_status: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface CreateEstacionDTO {
    codigo: string;
    nombre: string;
    ip: string;
    id_sucursal: string;
    id_status?: string;
}

export const EstacionService = {
    getAll: async (): Promise<EstacionAPI[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.estacionesPos.base);
        const list = data.data ?? data;
        return Array.isArray(list) ? list : [];
    },

    create: async (dto: CreateEstacionDTO): Promise<EstacionAPI> => {
        const payload: Partial<CreateEstacionDTO> = { ...dto };
        if (!payload.id_status) delete payload.id_status;
        const { data } = await axiosClient.post(ENDPOINTS.estacionesPos.base, payload);
        return data.data ?? data;
    },

    update: async (id: string, dto: Partial<CreateEstacionDTO>): Promise<EstacionAPI> => {
        const { data } = await axiosClient.put(ENDPOINTS.estacionesPos.byId(id), dto);
        return data.data ?? data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(ENDPOINTS.estacionesPos.byId(id));
    }
};
