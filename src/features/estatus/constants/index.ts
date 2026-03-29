// ─── Estatus Feature — Constantes ─────────────────────────────────────────────
// Único lugar de verdad para valores estáticos del módulo.
// Si el backend agrega un tipo nuevo, solo se edita este archivo.

import * as yup from "yup";

/* ── Módulos del sistema ──────────────────────────────────────────────────────
   Sincronizar con pkg/models/estatus_constants.go en el backend Go.
   El id corresponde a mdl_id en la tabla estatus.
*/
export const MODULOS = [
    { id: 1, nombre: "Ventas" },
    { id: 2, nombre: "Compras" },
    { id: 3, nombre: "Inventario" },
    { id: 4, nombre: "Caja / POS" },
    { id: 5, nombre: "Facturación" },
    { id: 6, nombre: "Clientes" },
    { id: 7, nombre: "Proveedores" },
    { id: 8, nombre: "Usuarios" },
] as const;

/* ── Paleta de color por tipo de estado ──────────────────────────────────────
   La clave debe estar en MAYÚSCULAS para coincidir con stp_tipo_estado del backend.
*/
export const TIPO_COLOR: Record<string, string> = {
    ACTIVO: "#10b981",
    INACTIVO: "#ef4444",
    PENDIENTE: "#f59e0b",
    PROCESO: "#3b82f6",
    CANCELADO: "#8b5cf6",
    CERRADO: "#6b7280",
};

/** Devuelve el color hex del tipo, o el naranja primario si no se reconoce */
export const getTipoColor = (tipo: string | null | undefined): string =>
    tipo ? (TIPO_COLOR[tipo.toUpperCase()] ?? "#FCA311") : "#FCA311";

/* ── Opciones del select "Tipo de Estado" ────────────────────────────────────
   Cada opción usa el value exacto que espera el backend (MAYÚSCULAS).
*/
export const TIPO_OPTIONS = [
    { value: "ACTIVO", label: "✅ ACTIVO" },
    { value: "INACTIVO", label: "🔴 INACTIVO" },
    { value: "PENDIENTE", label: "🟡 PENDIENTE" },
    { value: "PROCESO", label: "🔵 EN PROCESO" },
    { value: "CANCELADO", label: "🟣 CANCELADO" },
    { value: "CERRADO", label: "⚫ CERRADO" },
] as const;

/* ── Esquema de validación Yup ───────────────────────────────────────────────
   Centralizado aquí para que el hook y el componente lo importen del mismo sitio.
*/
export const estatusSchema = yup.object({
    std_descripcion: yup
        .string()
        .required("La descripción es requerida")
        .min(2, "Mínimo 2 caracteres"),
    stp_tipo_estado: yup
        .string()
        .required("El tipo de estado es requerido"),
    mdl_id: yup
        .number()
        .typeError("Selecciona un módulo")
        .required("El módulo es requerido")
        .min(1, "Selecciona un módulo válido"),
});

export type EstatusFormValues = yup.InferType<typeof estatusSchema>;