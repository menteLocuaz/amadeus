import * as yup from "yup";
import { FiSearch, FiShield, FiMapPin, FiActivity } from "react-icons/fi";

// ─── Paleta de colores (vibrant dark mode tokens) ─────────────────────────────
export const USER_COLORS = {
    bg:        '#0f1117',
    surface:   '#1a1d2e',
    surface2:  '#222538',
    border:    '#2a2d3e',
    accent:    '#7c3aed',
    accentHov: '#6d28d9',
    accentSoft:'rgba(124,58,237,0.15)',
    text:      '#e2e8f0',
    textMuted: '#6b7280',
    success:   '#10b981',
    danger:    '#ef4444',
    warning:   '#f59e0b',
    info:      '#3b82f6',
};

// ── Icons for Filters ─────────────────────────────────────────────────────────
export const FILTER_ICONS = {
    search: FiSearch,
    rol: FiShield,
    sucursal: FiMapPin,
    status: FiActivity,
};

// ─── Helpers de Diseño ────────────────────────────────────────────────────────
const AVATAR_PALETTE = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#7c3aed'];

export const getAvatarColor = (name: string): string => {
    if (!name || name.length === 0) return AVATAR_PALETTE[0];
    return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
};

export const getInitials = (nombre: string): string => {
    if (!nombre || nombre.trim().length === 0) return "?";
    const parts = nombre.trim().split(" ");
    if (parts.length >= 2 && parts[0] && parts[parts.length-1]) {
        return `${parts[0][0]}${parts[parts.length-1][0]}`.toUpperCase();
    }
    return nombre[0]?.toUpperCase() || "?";
};

export const getStatusStyle = (statusName: string) => {
    const map: Record<string, any> = {
        'Activa':      { bg: 'rgba(16,185,129,.15)', color: '#10b981', dot: '#10b981' },
        'Activo':      { bg: 'rgba(16,185,129,.15)', color: '#10b981', dot: '#10b981' },
        'Inactiva':    { bg: 'rgba(107,114,128,.15)', color: '#9ca3af', dot: '#9ca3af' },
        'Bloqueada':   { bg: 'rgba(239,68,68,.15)', color: '#ef4444', dot: '#ef4444' },
        'Suspendida':  { bg: 'rgba(239,68,68,.15)', color: '#ef4444', dot: '#ef4444' },
    };
    return map[statusName] || { bg: 'rgba(107,114,128,.15)', color: '#9ca3af', dot: '#9ca3af' };
};

export const getRolStyle = (rolName: string) => {
    const map: Record<string, any> = {
        'Administrador':   { bg: 'rgba(124,58,237,.15)', color: '#a78bfa' },
        'Supervisor':      { bg: 'rgba(59,130,246,.15)', color: '#60a5fa' },
        'Cajero':          { bg: 'rgba(245,158,11,.15)', color: '#fbbf24' },
        'Mesero':          { bg: 'rgba(16,185,129,.15)', color: '#34d399' },
    };
    return map[rolName] || { bg: USER_COLORS.surface2, color: USER_COLORS.textMuted };
};

// ─── Esquema de Validación ────────────────────────────────────────────────────
export const usuarioSchema = yup.object({
    nombre: yup.string()
        .required("El nombre es requerido")
        .min(2, "Mínimo 2 caracteres"),
    apellido: yup.string()
        .required("El apellido es requerido")
        .min(2, "Mínimo 2 caracteres"),
    email: yup.string()
        .required("El email es requerido")
        .email("Email inválido"),
    username: yup.string()
        .required("El username es requerido")
        .min(4, "Mínimo 4 caracteres"),
    usu_dni: yup.string()
        .required("El DNI es requerido")
        .min(8, "Mínimo 8 caracteres"),
    usu_telefono: yup.string().optional(),
    usu_tarjeta_nfc: yup.string().optional(),
    usu_pin_pos: yup.string().optional(),
    nombre_ticket: yup.string().optional(),
    sucursales_acceso: yup.array()
        .transform((val) => {
            if (!val || val === false) return [];
            return Array.isArray(val) ? val : [val];
        })
        .of(yup.string())
        .optional(),
    password: yup.string().when("$isEditing", {
        is: true,
        then: s => s.optional().transform(v => v === "" ? undefined : v).min(6, "Mínimo 6 caracteres"),
        otherwise: s => s.required("La contraseña es requerida").min(6, "Mínimo 6 caracteres"),
    }),
    confirmPassword: yup.string().when("$isEditing", {
        is: false,
        then: s => s.required("Confirma tu contraseña")
                   .oneOf([yup.ref('password')], "Las contraseñas no coinciden"),
        otherwise: s => s.optional().oneOf([yup.ref('password')], "Las contraseñas no coinciden")
    }),
    id_sucursal: yup.string().required("Selecciona una sucursal"),
    id_rol: yup.string().required("Selecciona un rol"),
    id_status: yup.string().required("Selecciona un estado"),
});

export type UsuarioForm = yup.InferType<typeof usuarioSchema>;
