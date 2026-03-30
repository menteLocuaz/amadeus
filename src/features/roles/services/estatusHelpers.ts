// ─── Roles Feature — Estatus Helpers ──────────────────────────────────────────
// Lógica pura de transformación del catálogo maestro de estatus.
// Al ser funciones puras (sin side-effects) son fáciles de testear.

import type { EstatusItem } from "../types";

/**
 * Extrae y deduplica los items de estatus del catálogo maestro del backend.
 */
export const extractEstatusList = (
    catalogoData: Record<string, any>
): EstatusItem[] => {
    const seen   = new Set<string>();
    const result: EstatusItem[] = [];

    // Priorizamos los módulos relevantes para roles (1 = General, 3 = Usuarios/Roles, etc.)
    const preferredKeys = ["1", "3", "2", "4", "5", "13", "7"];
    const orderedKeys   = [
        ...preferredKeys.filter(k => k in catalogoData),
        ...Object.keys(catalogoData).filter(k => !preferredKeys.includes(k)),
    ];

    for (const key of orderedKeys) {
        const items: any[] = catalogoData[key]?.items ?? [];

        for (const item of items) {
            // Buscamos el ID por prioridad (usamos || para ignorar strings vacíos)
            const rawId = item.id || item.id_status || item.status_id;
            if (!rawId) continue;
            
            const strId = String(rawId);
            if (strId === "undefined") continue;

            if (!seen.has(strId)) {
                seen.add(strId);
                
                // Extraemos la descripción por prioridad de campos conocidos
                const label = item.descripcion || 
                            item.std_descripcion || 
                            item.nombre || 
                            item.name || 
                            item.label || 
                            `Estado ${strId}`;

                result.push({
                    id:          strId,
                    descripcion: label,
                    tipo:        item.tipo || item.stp_tipo_estado || "",
                });
            }
        }

        // Si el módulo preferido tiene datos, nos detenemos para no mezclar tipos de estados
        if ((key === "1" || key === "3") && result.length > 0) break;
    }

    return result;
};


/** Devuelve true si la descripción del estatus contiene palabras clave de activación */
export const isEstatusActivo = (descripcion?: string): boolean => {
    if (!descripcion) return false;
    const low = descripcion.toLowerCase();
    return low.includes("activ") || low.includes("stock") || low.includes("proceso");
};