import axiosClient from "../../../core/api/axiosClient";

const API_URL = "/usuarios";

export interface UsuarioAPI {
    id_usuario: string;
    nombre: string;
    usu_nombre?: string;
    usu_dni?: string;
    correo?: string;
    email: string;
    usu_telefono: string | null;
    usu_tarjeta_nfc?: string;
    usu_pin_pos?: string;
    nombre_ticket?: string;
    sucursales_acceso?: string[];
    id_sucursal: string;
    id_rol: string;
    id_status: string;
    username: string;
    created_at?: string;
    updated_at?: string;
}

export const UsuarioService = {
    getAll: async (): Promise<UsuarioAPI[]> => {
        const res = await axiosClient.get(API_URL);
        return res.data?.data || [];
    },

    getById: async (id: string): Promise<UsuarioAPI> => {
        const res = await axiosClient.get(`${API_URL}/${id}`);
        return res.data?.data || res.data;
    },

    create: async (data: Partial<UsuarioAPI>): Promise<UsuarioAPI> => {
        const res = await axiosClient.post(API_URL, data);
        return res.data?.data || res.data;
    },

    update: async (id: string, data: Partial<UsuarioAPI>): Promise<UsuarioAPI> => {
        const res = await axiosClient.put(`${API_URL}/${id}`, data);
        return res.data?.data || res.data;
    },

    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(`${API_URL}/${id}`);
    }
};