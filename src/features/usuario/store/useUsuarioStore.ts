import { create } from "zustand";
import { type UsuarioAPI } from "../services/UsuarioService";

interface UsuarioFilters {
    search: string;
    id_rol: string | null;
    id_sucursal: string | null;
    id_status: string | null;
}

interface UsuarioState {
    // Basic Data
    usuarios: UsuarioAPI[];
    isLoading: boolean;
    error: string | null;

    // Filters & Pagination
    filters: UsuarioFilters;
    currentPage: number;
    pageSize: number;

    // Actions
    setUsuarios: (usuarios: UsuarioAPI[]) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setFilters: (filters: Partial<UsuarioFilters>) => void;
    setPage: (page: number) => void;
    resetFilters: () => void;

    // Computed (via selectors usually, but define basic here)
    getFilteredUsuarios: () => UsuarioAPI[];
}

export const useUsuarioStore = create<UsuarioState>((set, get) => ({
    usuarios: [],
    isLoading: false,
    error: null,

    filters: {
        search: "",
        id_rol: null,
        id_sucursal: null,
        id_status: null,
    },
    currentPage: 1,
    pageSize: 8,

    setUsuarios: (usuarios) => set({ usuarios, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters },
        currentPage: 1 // Reset to page 1 on filter change
    })),
    setPage: (currentPage) => set({ currentPage }),
    resetFilters: () => set({
        filters: { search: "", id_rol: null, id_sucursal: null, id_status: null },
        currentPage: 1
    }),

    getFilteredUsuarios: () => {
        const { usuarios, filters } = get();
        let list = [...usuarios];

        if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(u => 
                u.nombre.toLowerCase().includes(q) || 
                (u.email || u.correo || "").toLowerCase().includes(q) || 
                u.username.toLowerCase().includes(q)
            );
        }

        if (filters.id_rol) {
            list = list.filter(u => u.id_rol === filters.id_rol);
        }

        if (filters.id_sucursal) {
            list = list.filter(u => u.id_sucursal === filters.id_sucursal);
        }

        if (filters.id_status) {
            list = list.filter(u => u.id_status === filters.id_status);
        }

        return list;
    }
}));
