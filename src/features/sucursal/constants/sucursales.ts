import * as yup from "yup";

/* ═══════════════════════════════════════════════════════════
   VALIDACIÓN
   Basado en SucursalCreateRequest (Go)
═══════════════════════════════════════════════════════════ */
export const sucursalSchema = yup.object({
    id_empresa: yup.string()
        .required("La empresa es requerida"),
    nombre_sucursal: yup.string()
        .required("El nombre de la sucursal es requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(150, "Máximo 150 caracteres"),
    id_status: yup.string()
        .required("El estatus es requerido"),
});

export type SucursalForm = yup.InferType<typeof sucursalSchema>;
