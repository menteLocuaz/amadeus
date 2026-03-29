import { create } from 'zustand';

export interface ActivePeriodo {
    id_periodo: string;
    id_caja: string;
    fecha_apertura: string;
    monto_apertura: number;
    estatus: string;
}

interface POSState {
    id_estacion: string | null;
    estacionNombre: string | null;
    activePeriodo: ActivePeriodo | null;
    isLoading: boolean;

    setEstacion: (id: string, nombre: string) => void;
    clearEstacion: () => void;
    setPeriodo: (periodo: ActivePeriodo | null) => void;
    initialize: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
    id_estacion: null,
    estacionNombre: null,
    activePeriodo: null,
    isLoading: false,

    setEstacion: (id, nombre) => {
        localStorage.setItem('id_estacion', id);
        localStorage.setItem('estacion_nombre', nombre);
        set({ id_estacion: id, estacionNombre: nombre });
    },

    clearEstacion: () => {
        localStorage.removeItem('id_estacion');
        localStorage.removeItem('estacion_nombre');
        set({ id_estacion: null, estacionNombre: null, activePeriodo: null });
    },

    setPeriodo: (periodo) => {
        set({ activePeriodo: periodo });
    },

    initialize: () => {
        const id = localStorage.getItem('id_estacion');
        const nombre = localStorage.getItem('estacion_nombre');
        if (id && nombre) {
            set({ id_estacion: id, estacionNombre: nombre });
        }
    }
}));
