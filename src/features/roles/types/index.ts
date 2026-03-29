// ─── Roles Feature — Shared Types ─────────────────────────────────────────────
// Centralizar los tipos aquí evita importaciones circulares y mantiene
// un único lugar de verdad para las formas de datos del módulo.

export interface EstatusItem {
    id: string;
    descripcion: string;
    tipo?: string;
}


export interface RolFormData {
    nombre_rol: string;
    id_sucursal: string;
    id_status: string;
}

/** Estado vacío del formulario — usado al abrir el modal en modo "crear" */
export const EMPTY_FORM: RolFormData = {
    nombre_rol: "",
    id_sucursal: "",
    id_status: "",
};

/** Errores de validación campo a campo */
export type RolFormErrors = Partial<Record<keyof RolFormData, string>>;