import { type ProveedorCreateRequest } from "./services/ProveedorService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function validateProveedor(payload: Partial<ProveedorCreateRequest>) {
    const errors: Record<string, string> = {};

    const razon_social = (payload.razon_social || "").trim();
    if (!razon_social) errors.razon_social = "Razón social es requerida";
    else if (razon_social.length < 3) errors.razon_social = "Mínimo 3 caracteres";

    const nit_rut = (payload.nit_rut || "").trim();
    if (!nit_rut) errors.nit_rut = "NIT/RUT es requerido";

    const email = (payload.email || "").trim();
    if (email && !emailRegex.test(email)) errors.email = "Email inválido";

    if (!payload.id_status) errors.id_status = "Selecciona un estado";

    return errors;
}
