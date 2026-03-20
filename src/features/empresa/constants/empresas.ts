import * as yup from "yup";

/* ═══════════════════════════════════════════════════════════
   VALIDACIÓN
   Basado en EmpresaCreateRequest y EmpresaUpdateRequest (Go)
═══════════════════════════════════════════════════════════ */
export const empresaSchema = yup.object({
    nombre: yup.string()
        .required("El nombre es requerido")
        .min(3, "Mínimo 3 caracteres")
        .max(150, "Máximo 150 caracteres"),
    rut: yup.string()
        .required("El RUT es requerido")
        .max(20, "Máximo 20 caracteres"),
    id_status: yup.string()
        .required("El estatus es requerido"),
});

export type EmpresaForm = yup.InferType<typeof empresaSchema>;
