import * as yup from "yup";

/**
 * Esquema de validación para Dispositivos POS.
 * Centralizado para ser reutilizado en el hook y otros componentes si es necesario.
 */
export const dispositivoSchema = yup.object({
    nombre: yup.string()
        .required("El nombre es requerido")
        .min(3, "El nombre debe tener al menos 3 caracteres"),
    tipo: yup.string()
        .oneOf(["IMPRESORA", "DATAFONO", "KIOSKO", "MONITOR", "SCANNER", "BASCULA", "VISOR"] as const)
        .required("Selecciona un tipo de dispositivo"),
    ip: yup.string()
        .required("La dirección IP es requerida")
        .matches(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato de IP inválido (ej: 192.168.1.50)"),
    id_estacion: yup.string()
        .required("Vínculo con Estación POS requerido"),
});

export type DispositivoForm = yup.InferType<typeof dispositivoSchema>;
