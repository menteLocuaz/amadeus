import * as yup from "yup";

/* ═══════════════════════════════════════════════════════════
   VALIDACIÓN
   Basado en UsuarioCreateRequest / UsuarioUpdateRequest (Go)
═══════════════════════════════════════════════════════════ */
export const usuarioSchema = yup.object({
    id_sucursal: yup.string()
        .required("La sucursal es requerida"),
    id_rol: yup.string()
        .required("El rol es requerido"),
    email: yup.string()
        .required("El email es requerido")
        .email("Email inválido"),
    usu_nombre: yup.string()
        .required("El nombre es requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(100, "Máximo 100 caracteres"),
    usu_dni: yup.string()
        .required("El DNI es requerido")
        .min(8, "Mínimo 8 caracteres")
        .max(15, "Máximo 15 caracteres"),
    usu_telefono: yup.string()
        .max(20, "Máximo 20 caracteres")
        .optional(),
    password: yup.string()
        .when("$isEditing", {
            is: false,
            then: (schema) => schema.required("La contraseña es requerida").min(6, "Mínimo 6 caracteres"),
            otherwise: (schema) => schema.optional().transform(v => v === "" ? undefined : v).min(6, "Mínimo 6 caracteres"),
        }),
    id_status: yup.string()
        .required("El estatus es requerido"),
});

export interface UsuarioForm {
    id_sucursal: string;
    id_rol: string;
    email: string;
    usu_nombre: string;
    usu_dni: string;
    usu_telefono?: string;
    password?: string;
    id_status: string;
}
