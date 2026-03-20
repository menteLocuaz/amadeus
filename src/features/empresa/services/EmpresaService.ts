import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

/* ═══════════════════════════════════════════════════════════
   INTERFACES (Basadas en DTOs Go)
═══════════════════════════════════════════════════════════ */

export interface EmpresaAPI {
    id: string;
    nombre: string;
    rut: string;
    id_status: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

export interface CreateEmpresaDTO {
    nombre: string;
    rut: string;
    id_status: string;
}

export interface UpdateEmpresaDTO extends CreateEmpresaDTO {}

/* ═══════════════════════════════════════════════════════════
   SERVICIO
═══════════════════════════════════════════════════════════ */

export const EmpresaService = {
    getAll: async (): Promise<EmpresaAPI[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.empresas.base);
        // Manejo flexible de respuesta (data.data o data)
        const list = data.data ?? data;
        return Array.isArray(list) ? list : [];
    },

    create: async (dto: CreateEmpresaDTO): Promise<EmpresaAPI> => {
        const { data } = await axiosClient.post(ENDPOINTS.empresas.base, dto);
        return data.data ?? data;
    },

    update: async (id: string, dto: UpdateEmpresaDTO): Promise<EmpresaAPI> => {
        const { data } = await axiosClient.put(ENDPOINTS.empresas.byId(id), dto);
        return data.data ?? data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(ENDPOINTS.empresas.byId(id));
    }
};
