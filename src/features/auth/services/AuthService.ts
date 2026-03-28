import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface RolItem {
  id_rol: string;
  nombre_rol: string;
  descripcion: string;
  id_sucursal?: string;
  id_status?: string;
}

export interface SucursalItem {
  id_sucursal: string;
  id_empresa: string;
  nombre_sucursal: string;
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
  status: 'success' | 'error';
  message: string;
  data: {
    token: string;
    usuario: UserMe;
    expires_at: string;
  };
}

export interface AdminUserDTO {
  email: string;
  usu_nombre: string;
  usu_dni: string;
  usu_pin_pos: string;
  id_sucursal: string;
  id_rol: string;
  id_status: string;
  sucursales_acceso: string[];
}

export interface CreateUserDTO {
  usu_nombre: string;
  email: string;
  usu_dni: string;
  usu_telefono: string;
  password: string;
  id_rol: string;
  id_sucursal: string;
  id_status: string;
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
      const { data } = await axiosClient.post(ENDPOINTS.usuarios.base, userData);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear usuario';
      throw new Error(message);
    }
  },

  administrarUser: async (userData: AdminUserDTO) => {
    try {
      const { data } = await axiosClient.post(ENDPOINTS.usuarios.administrar, userData);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error en gestión integral de usuario';
      throw new Error(message);
    }
  },

  getRoles: async (): Promise<{ status: string; data: RolItem[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.roles.base);
    return data;
  },

  getSucursales: async (): Promise<{ status: string; data: SucursalItem[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.sucursales.base);
    return data;
  },

  createRol: async (rolData: { nombre_rol: string; id_sucursal: string; id_status: string }) => {
    const { data } = await axiosClient.post(ENDPOINTS.roles.base, rolData);
    return data;
  },

  updateRol: async (id: string, rolData: Partial<{ nombre_rol: string; id_sucursal: string; id_status: string }>) => {
    const { data } = await axiosClient.put(ENDPOINTS.roles.byId(id), rolData);
    return data;
  },

  deleteRol: async (id: string) => {
    await axiosClient.delete(ENDPOINTS.roles.byId(id));
  },

  logout: async () => {
    try {
      await axiosClient.post(ENDPOINTS.auth.logout);
    } catch (error: unknown) {
      console.error('Error al cerrar sesión:', error);
    }
  }
};
