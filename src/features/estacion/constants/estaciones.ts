import * as yup from "yup";
import { type EstacionAPI } from "../services/EstacionService";

/* ═══════════════════════════════════════════════════════════
   VALIDACIÓN
═══════════════════════════════════════════════════════════ */
export const estacionSchema = yup.object({
    codigo:      yup.string().required("El código (ej: POS-01) es requerido"),
    nombre:      yup.string().required("El nombre es requerido").min(3),
    ip:          yup.string()
                    .required("La dirección IP es requerida")
                    .matches(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato inválido (ej: 192.168.1.10)"),
    id_sucursal: yup.string().required("Selecciona una sucursal"),
    id_status:   yup.string().required("Selecciona un estado"),
});

export type EstacionForm = yup.InferType<typeof estacionSchema>;

export interface Estacion extends EstacionAPI {}
