// ─── Roles Feature — RolService ───────────────────────────────────────────────
// Capa de acceso a datos exclusiva del módulo de roles.
// Separa la lógica de roles de AuthService (que debe ocuparse solo de auth).

import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

// ─── DTOs ──────────────────────────────────────────────────────────────────────

export interface RolItem {
    id_rol:        string;
    nombre_rol:    string;
    id_sucursal?:  string;
    id_status?:    string;
    /** Descripción amigable opcional que puede venir del backend */
    std_descripcion?: string;
}

export interface RolCreateDTO {
    nombre_rol:  string;
    id_sucursal: string;
    id_status:   string;
}

export type RolUpdateDTO = Partial<RolCreateDTO>;

// ─── Forma genérica de respuesta de la API PRUNUS ──────────────────────────────

interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data: T;
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const RolService = {

    /** Obtiene todos los roles registrados */
    getAll: async (): Promise<RolItem[]> => {
        const { data } = await axiosClient.get<ApiResponse<RolItem[]>>(
            ENDPOINTS.roles.base
        );
        return data.data ?? [];
    },

    /** Crea un nuevo rol */
    create: async (payload: RolCreateDTO): Promise<RolItem> => {
        const { data } = await axiosClient.post<ApiResponse<RolItem>>(
            ENDPOINTS.roles.base,
            payload
        );
        return data.data;
    },

    /** Actualiza un rol existente por su id */
    update: async (id: string, payload: RolUpdateDTO): Promise<RolItem> => {
        const { data } = await axiosClient.put<ApiResponse<RolItem>>(
            ENDPOINTS.roles.byId(id),
            payload
        );
        return data.data;
    },

    /** Soft-delete: el backend marca el rol como inactivo */
    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(ENDPOINTS.roles.byId(id));
    },
};