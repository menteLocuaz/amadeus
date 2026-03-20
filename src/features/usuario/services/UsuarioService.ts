import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

/* ═══════════════════════════════════════════════════════════
   INTERFACES (Basadas en DTOs Go)
═══════════════════════════════════════════════════════════ */

export interface UsuarioAPI {
    id_usuario: string;
    id_sucursal: string;
    id_rol: string;
    email: string;
    usu_nombre: string;
    usu_dni: string;
    usu_telefono: string;
    id_status: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface CreateUsuarioDTO {
    id_sucursal: string;
    id_rol: string;
    email: string;
    usu_nombre: string;
    usu_dni: string;
    usu_telefono?: string;
    password?: string;
    id_status: string;
}

export interface UpdateUsuarioDTO extends CreateUsuarioDTO {}

/* ═══════════════════════════════════════════════════════════
   SERVICIO
═══════════════════════════════════════════════════════════ */

export const UsuarioService = {
    getAll: async (): Promise<UsuarioAPI[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.usuarios.base);
        const list = data.data ?? data;
        return Array.isArray(list) ? list : [];
    },

    create: async (dto: CreateUsuarioDTO): Promise<UsuarioAPI> => {
        const { data } = await axiosClient.post(ENDPOINTS.usuarios.base, dto);
        return data.data ?? data;
    },

    update: async (id: string, dto: UpdateUsuarioDTO): Promise<UsuarioAPI> => {
        const { data } = await axiosClient.put(ENDPOINTS.usuarios.byId(id), dto);
        return data.data ?? data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(ENDPOINTS.usuarios.byId(id));
    }
};
