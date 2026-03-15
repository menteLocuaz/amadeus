import { create } from 'zustand';
import { type UserMe, AuthService } from '../services/AuthService';

interface AuthState {
  user: UserMe | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(email, pass);
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      set({ user: usuario, isLoading: false });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.getMe();
      set({ user, isLoading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      set({ error: errorMessage, isLoading: false, user: null });
    }
  },

  logout: async () => {
    try {
      await AuthService.logout();
    } finally {
      localStorage.removeItem('token');
      set({ user: null });
    }
  }
}));
