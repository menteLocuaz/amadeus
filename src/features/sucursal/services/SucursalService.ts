import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

/* ═══════════════════════════════════════════════════════════
   INTERFACES (Basadas en DTOs Go)
═══════════════════════════════════════════════════════════ */

export interface SucursalAPI {
    id_sucursal: string;
    id_empresa: string;
    nombre_sucursal: string;
    id_status: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface CreateSucursalDTO {
    id_empresa: string;
    nombre_sucursal: string;
    id_status: string;
}

export interface UpdateSucursalDTO extends CreateSucursalDTO {}

/* ═══════════════════════════════════════════════════════════
   SERVICIO
═══════════════════════════════════════════════════════════ */

export const SucursalService = {
    getAll: async (): Promise<SucursalAPI[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.sucursales.base);
        const list = data.data ?? data;
        return Array.isArray(list) ? list : [];
    },

    create: async (dto: CreateSucursalDTO): Promise<SucursalAPI> => {
        const { data } = await axiosClient.post(ENDPOINTS.sucursales.base, dto);
        return data.data ?? data;
    },

    update: async (id: string, dto: UpdateSucursalDTO): Promise<SucursalAPI> => {
        const { data } = await axiosClient.put(ENDPOINTS.sucursales.byId(id), dto);
        return data.data ?? data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(ENDPOINTS.sucursales.byId(id));
    }
};
