import { type ProveedorCreateRequest } from "./services/ProveedorService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function validateProveedor(payload: Partial<ProveedorCreateRequest>) {
    const errors: Record<string, string> = {};

    const nombre = (payload.nombre || "").trim();
    if (!nombre) errors.nombre = "Nombre es requerido";
    else if (nombre.length < 3) errors.nombre = "Nombre mínimo 3 caracteres";

    const ruc = (payload.ruc || "").trim();
    if (!ruc) errors.ruc = "RUC es requerido";

    const email = (payload.email || "").trim();
    if (email && !emailRegex.test(email)) errors.email = "Email inválido";

    if (!payload.id_status) errors.id_status = "Selecciona estado";
    if (!payload.id_sucursal) errors.id_sucursal = "Selecciona sucursal";
    if (!payload.id_empresa) errors.id_empresa = "Selecciona empresa";

    return errors;
}
