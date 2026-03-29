import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

/* ──────────────────────────────────────────────
   DTOs exactos del modelo Go
────────────────────────────────────────────── */
export interface EstatusResponse {
    id_status: string;
    std_descripcion: string;
    stp_tipo_estado: string | null;   // ← el backend puede omitirlo
    mdl_id: number;
    created_at: string;
    updated_at: string;
}

export interface EstatusModuleGroup {
    modulo: string;
    items: EstatusResponse[];
}

/** Catálogo maestro: clave = mdl_id */
export type EstatusMasterCatalog = Record<number, EstatusModuleGroup>;

export interface CreateEstatusDTO {
    std_descripcion: string;
    stp_tipo_estado: string;
    mdl_id: number;
}

export type UpdateEstatusDTO = CreateEstatusDTO;

/* ── Service ── */
export const EstatusService = {
    /** GET /estatus → lista plana */
    getAll: async (): Promise<EstatusResponse[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.estatus.base);
        return data.data ?? data ?? [];
    },

    /** GET /estatus/catalogo → catálogo agrupado por módulo */
    getCatalog: async (): Promise<EstatusMasterCatalog> => {
        const { data } = await axiosClient.get(ENDPOINTS.estatus.catalogo);
        return data.data ?? data ?? {};
    },

    /** GET /estatus/tipo/:tipo */
    getByTipo: async (tipo: string): Promise<EstatusResponse[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.estatus.porTipo(tipo));
        return data.data ?? data ?? [];
    },

    /** GET /estatus/modulo/:id */
    getByModule: async (mdl_id: number): Promise<EstatusResponse[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.estatus.porModulo(mdl_id));
        return data.data ?? data ?? [];
    },

    /** POST /estatus */
    create: async (dto: CreateEstatusDTO): Promise<EstatusResponse> => {
        const { data } = await axiosClient.post(ENDPOINTS.estatus.base, dto);
        return data.data ?? data;
    },

    /** PUT /estatus/:id */
    update: async (id: string, dto: UpdateEstatusDTO): Promise<EstatusResponse> => {
        const { data } = await axiosClient.put(`${ENDPOINTS.estatus.base}/${id}`, dto);
        return data.data ?? data;
    },

    /** DELETE /estatus/:id */
    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(`${ENDPOINTS.estatus.base}/${id}`);
    },
};
