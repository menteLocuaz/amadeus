import axiosClient from '../api/axiosClient';
import { ENDPOINTS } from '../api/endpoints';

export interface RolItem {
  id_rol: string;
  rol_nombre: string;
  descripcion: string;
}

export interface SucursalItem {
  id_sucursal: string;
  id_empresa: string;
  nombre: string;
  direccion: string;
  telefono: string;
  codigo: string;
  created_at: string;
}

export interface UserMe {
  id_usuario: string;
  id_sucursal: string;
  id_rol: string;
  email: string;
  usu_nombre: string;
  usu_dni: string;
  usu_telefono: string;
  rol: {
      id_rol: string;
      nombre_rol: string;
  };
  sucursal: {
      id_sucursal: string;
      nombre_sucursal: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    usuario: UserMe;
    expires_at: number;
  };
}

export interface CreateUserDTO {
  nombre: string;
  email: string;
  password: string;
  id_rol: string;
  id_sucursal: string;
}

export const AuthService = {
  login: async (email: string, pass: string): Promise<LoginResponse> => {
    try {
      const { data } = await axiosClient.post<LoginResponse>(ENDPOINTS.auth.login, {
        email: email,
        password: pass
      });
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Credenciales incorrectas';
      throw new Error(message);
    }
  },

  getMe: async (): Promise<UserMe> => {
    try {
      const { data } = await axiosClient.get<UserMe>(ENDPOINTS.auth.me);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al obtener datos del usuario';
      throw new Error(message);
    }
  },

  createUser: async (userData: CreateUserDTO) => {
    try {
      const { data } = await axiosClient.post(ENDPOINTS.usuarios, userData);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear usuario';
      throw new Error(message);
    }
  },

  getRoles: async (): Promise<{ data: RolItem[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.roles);
    return data;
  },

  getSucursales: async (): Promise<{ data: SucursalItem[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.sucursales);
    return data;
  }
};
