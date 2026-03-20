import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

/* ──────────────────────────────────────────────
   Respuesta exacta del modelo Go:
   IDDispositivo uuid.UUID  `json:"id_dispositivo"`
   Nombre        string     `json:"nombre"`
   Tipo          string     `json:"tipo"`
   IP            string     `json:"ip"`
   IDEstacion    uuid.UUID  `json:"id_estacion"`
   CreatedAt     time.Time  `json:"created_at"`
   UpdatedAt     time.Time  `json:"updated_at"`
   DeletedAt     *time.Time `json:"deleted_at,omitempty"`
────────────────────────────────────────────── */
export interface DispositivoAPI {
    id_dispositivo: string;
    nombre:         string;
    tipo:           string;
    ip:             string;
    id_estacion:    string;
    created_at:     string;
    updated_at?:    string;
    deleted_at?:    string | null;
}

/** DTO para crear o actualizar — solo los campos que acepta la API */
export interface CreateDispositivoDTO {
    nombre:      string;
    tipo:        "IMPRESORA" | "DATAFONO" | "KIOSKO" | "MONITOR";
    ip:          string;
    id_estacion: string;
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
