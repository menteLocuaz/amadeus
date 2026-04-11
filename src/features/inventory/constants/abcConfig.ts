/**
 * abcConfig.ts
 * Fuente única de verdad para colores y metadatos de la clasificación ABC.
 * Importar desde aquí en lugar de repetir hex en componentes.
 */

import type { RotacionABC } from '../services/InventoryService';

/** 'A' | 'B' | 'C' — derivado del tipo del servicio, no duplicado */
export type ClaseABC = keyof RotacionABC;

export const ABC_COLORS: Record<ClaseABC, string> = {
    A: '#ef4444',
    B: '#f59e0b',
    C: '#10b981',
} as const;

export const ABC_CONFIG: Record<ClaseABC, {
    label: string;
    descripcion: string;
    color: string;
    bgColor: string;
    borderColor: string;
    pct: string;
    regla: string;
}> = {
    A: {
        label: 'Clase A',
        descripcion: 'Alto valor · 80% del valor total',
        color: ABC_COLORS.A,
        bgColor: `${ABC_COLORS.A}15`,
        borderColor: `${ABC_COLORS.A}30`,
        pct: '~80%',
        regla: 'Máxima atención. Control de stock riguroso.',
    },
    B: {
        label: 'Clase B',
        descripcion: 'Valor medio · 15% del valor total',
        color: ABC_COLORS.B,
        bgColor: `${ABC_COLORS.B}15`,
        borderColor: `${ABC_COLORS.B}30`,
        pct: '~15%',
        regla: 'Revisión periódica. Gestión estándar.',
    },
    C: {
        label: 'Clase C',
        descripcion: 'Bajo valor · 5% del valor total',
        color: ABC_COLORS.C,
        bgColor: `${ABC_COLORS.C}15`,
        borderColor: `${ABC_COLORS.C}30`,
        pct: '~5%',
        regla: 'Baja prioridad. Reorden automático.',
    },
};
