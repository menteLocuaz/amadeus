import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    id_control_estacion: string | null;
    activePeriodo: ActivePeriodo | null;
    isLoading: boolean;

    setEstacion: (id: string, nombre: string) => void;
    setControlEstacion: (id: string) => void;
    clearEstacion: () => void;
    setPeriodo: (periodo: ActivePeriodo | null) => void;
    initialize: () => void; // Mantener para compatibilidad, aunque persist lo maneja
}

export const usePOSStore = create<POSState>()(
    persist(
        (set) => ({
            id_estacion: null,
            estacionNombre: null,
            id_control_estacion: null,
            activePeriodo: null,
            isLoading: false,

            setEstacion: (id, nombre) => {
                set({ id_estacion: id, estacionNombre: nombre });
            },

            setControlEstacion: (id) => {
                set({ id_control_estacion: id });
            },

            clearEstacion: () => {
                set({ id_estacion: null, estacionNombre: null, id_control_estacion: null, activePeriodo: null });
            },

            setPeriodo: (periodo) => {
                set({ activePeriodo: periodo });
            },

            initialize: () => {
                // El middleware persist ya carga los datos automáticamente al hidratar el store
            }
        }),
        {
            name: 'pos-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                id_estacion: state.id_estacion,
                estacionNombre: state.estacionNombre,
                id_control_estacion: state.id_control_estacion,
                activePeriodo: state.activePeriodo
            }),
        }
    )
);
