import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export type TipoDispositivoEnum = "IMPRESORA" | "DATAFONO" | "KIOSKO" | "MONITOR" | "SCANNER" | "BASCULA" | "VISOR";

export interface DispositivoAPI {
    id_dispositivo:  string;
    nombre:          string;
    tipo_dispositivo: string;
    /** ip extraída de configuracion para conveniencia en la UI */
    ip?:             string;
    configuracion?:  Record<string, unknown>;
    id_estacion:     string;
    id_status:       string;
    created_at:      string;
    updated_at?:     string;
    deleted_at?:     string | null;
}

/** DTO para crear o actualizar — campos que acepta POST/PUT /api/v1/dispositivos-pos */
export interface CreateDispositivoDTO {
    nombre:           string;
    tipo_dispositivo: TipoDispositivoEnum;
    configuracion:    Record<string, unknown>;
    id_estacion:      string;
    id_status:        string;
}

export type UpdateDispositivoDTO = Partial<CreateDispositivoDTO>;

/* ── Service ── */
export const DispositivoService = {
    getAll: async (): Promise<DispositivoAPI[]> => {
        const { data } = await axiosClient.get(ENDPOINTS.dispositivosPos.base);
        const list = data.data ?? data;
        return Array.isArray(list) ? list : [];
    },

    getById: async (id: string): Promise<DispositivoAPI> => {
        const { data } = await axiosClient.get(ENDPOINTS.dispositivosPos.byId(id));
        return data.data ?? data;
    },

    create: async (dto: CreateDispositivoDTO): Promise<DispositivoAPI> => {
        const { data } = await axiosClient.post(ENDPOINTS.dispositivosPos.base, dto);
        return data.data ?? data;
    },

    update: async (id: string, dto: UpdateDispositivoDTO): Promise<DispositivoAPI> => {
        const { data } = await axiosClient.put(ENDPOINTS.dispositivosPos.byId(id), dto);
        return data.data ?? data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(ENDPOINTS.dispositivosPos.byId(id));
    },
};
