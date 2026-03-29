import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type UserMe, AuthService } from '../services/AuthService';

interface AuthState {
  user: UserMe | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  setSucursalActiva: (id_sucursal: string, nombre_sucursal: string) => void;
}

// Guard para evitar que logout se llame múltiples veces en paralelo
let _isLoggingOut = false;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, pass) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.login(email, pass);
          const { token, usuario } = response.data;
          set({ user: usuario, token, isLoading: false });
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
          set({ error: errorMessage, isLoading: false, user: null, token: null });
        }
      },

      logout: async () => {
        // Si ya estamos en proceso de logout, ignorar llamadas adicionales
        if (_isLoggingOut) return;
        _isLoggingOut = true;
        try {
          await AuthService.logout();
        } finally {
          set({ user: null, token: null });
          _isLoggingOut = false;
        }
      },

      clearSession: () => {
        set({ user: null, token: null, error: null });
      },

      setSucursalActiva: (id_sucursal, nombre_sucursal) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              id_sucursal,
              sucursal: {
                id_sucursal,
                nombre_sucursal
              }
            }
          };
        });
      }
    }),
    {
      name: 'auth-storage', // nombre de la clave en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos user y token
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);
