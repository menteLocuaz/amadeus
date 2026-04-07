// ─── Shared Store — useCatalogStore ───────────────────────────────────────────
// Almacén global de catálogos (categorías, unidades, monedas, estatus, sucursales).
// Combinamos todos los módulos de estatus en una lista plana para acceso fácil.

import { create } from "zustand";
import { CategoryService } from "../../features/products/services/CategoryService";
import { MedidaService } from "../../features/products/services/MedidaService";
import { MonedaService } from "../../features/moneda/services/MonedaService";
import { EstatusService } from "../../features/auth/services/EstatusService";
import { SucursalService } from "../../features/proveedor/services/SucursalService";

// ─── Definición de Tipos ───────────────────────────────────────────────────────

export interface StatusItem {
    id_status:       string;
    std_descripcion: string;
    std_tipo_estado: string;
    mdl_id:          number;
    is_active:       boolean;
    created_at?:     string;
    updated_at?:     string;
}

interface CatalogState {
    categories:     any[];
    units:          any[];
    currencies:     any[];
    statusList:     StatusItem[];
    sucursales:     any[];
    statusMap:      Record<string, string>;
    sucursalMap:    Record<string, string>;
    isLoading:      boolean;
    isInitialized:  boolean;
    error:          string | null;
    fetchCatalogs:  (force?: boolean) => Promise<void>;
}

// ─── Ayudantes ─────────────────────────────────────────────────────────────────

/**
 * Genera un mapa de ID -> Nombre para búsquedas O(1).
 */
const createMap = (items: any[], idKey: string, nameKey: string) => {
    const map: Record<string, string> = {};
    items.forEach(item => {
        const id = item[idKey];
        if (id) map[id] = item[nameKey] || item.nombre || "";
    });
    return map;
};

/**
 * Aplana el catálogo de estatus (agrupado por el backend) en una lista única.
 */
const flattenStatuses = (data: Record<string, any>): StatusItem[] => {
    const seen   = new Set<string>();
    const result: StatusItem[] = [];

    const preferred = ["3", "1", "8", "2"];
    const keys = [
        ...preferred.filter(k => k in data),
        ...Object.keys(data).filter(k => !preferred.includes(k))
    ];

    for (const key of keys) {
        const items = data[key]?.items || [];
        for (const item of items) {
            const id = String(item.id_status || item.id || "");
            if (!id || seen.has(id)) continue;
            
            seen.add(id);
            result.push({
                id_status:       id,
                std_descripcion: item.std_descripcion || item.nombre || "",
                std_tipo_estado: item.std_tipo_estado || "GENERAL",
                mdl_id:          Number(item.mdl_id || key),
                is_active:       Boolean(item.is_active ?? true),
                created_at:      item.created_at,
                updated_at:      item.updated_at
            });
        }
    }
    return result;
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCatalogStore = create<CatalogState>((set, get) => ({
    categories:    [],
    units:         [],
    currencies:    [],
    statusList:    [],
    sucursales:    [],
    statusMap:     {},
    sucursalMap:   {},
    isLoading:     false,
    isInitialized: false,
    error:         null,

    fetchCatalogs: async (force = false) => {
        if (get().isInitialized && !force) return;

        set({ isLoading: true, error: null });
        try {
            const [resCats, resUnits, resCurrs, resStatus, resSuc] = await Promise.all([
                CategoryService.getAll(),
                MedidaService.getAll(),
                MonedaService.getAll(),
                EstatusService.getCatalogo(),
                SucursalService.getAll()
            ]);

            // Normalización de Estatus
            const resSt  = resStatus as any;
            const isOk   = resSt.status === 'success' || resSt.success === true;
            const stData = resSt.data || {};
            const statusList = isOk ? flattenStatuses(stData) : (Array.isArray(resStatus) ? resStatus : []);

            // Normalización de Sucursales
            const rawSuc = resSuc.data || (Array.isArray(resSuc) ? resSuc : []);
            const sucursales = rawSuc.map((s: any) => ({
                ...s,
                id_sucursal:     s.id_sucursal     || s.id,
                nombre_sucursal: s.nombre_sucursal || s.nombre
            }));

            set({
                categories:    resCats.data || (Array.isArray(resCats) ? resCats : []),
                units:         (resUnits.data || []).map((u: any) => ({ ...u, id_unidad: u.id_unidad || u.id })),
                currencies:    (resCurrs.data || []).map((c: any) => ({ ...c, id_moneda: c.id_moneda || c.id })),
                statusList,
                sucursales,
                statusMap:     createMap(statusList, "id_status", "std_descripcion"),
                sucursalMap:   createMap(sucursales, "id_sucursal", "nombre_sucursal"),
                isLoading:     false,
                isInitialized: true
            });
        } catch (err: any) {
            set({ error: err.message || "Error al sincronizar catálogos", isLoading: false });
        }
    }
}));

// ─── Selectores ────────────────────────────────────────────────────────────────

export const selectUserStatusList = (state: CatalogState) =>
    state.statusList.filter(s => s.mdl_id === 3);

export const selectProductStatusList = (state: CatalogState) =>
    state.statusList.filter(s => s.mdl_id === 4);

/**
 * Selectors for Maps (Stable References)
 */
export const selectStatusMap = (state: CatalogState) => state.statusMap;
export const selectSucursalMap = (state: CatalogState) => state.sucursalMap;
