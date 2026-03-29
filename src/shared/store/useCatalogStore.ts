import { create } from "zustand";
import { CategoryService } from "../../features/products/services/CategoryService";
import { MedidaService } from "../../features/products/services/MedidaService";
import { MonedaService } from "../../features/products/services/MonedaService";
import { EstatusService } from "../../features/auth/services/EstatusService";
import { SucursalService } from "../../features/proveedor/services/SucursalService";

interface CatalogState {
  categories: any[];
  units: any[];
  currencies: any[];
  statusList: any[];
  sucursales: any[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  fetchCatalogs: (force?: boolean) => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  units: [],
  currencies: [],
  statusList: [],
  sucursales: [],
  isLoading: false,
  isInitialized: false,
  error: null,

  fetchCatalogs: async (force = false) => {
    // Si ya está inicializado y no se fuerza, no hacemos nada (ahorro de red)
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

      const sucursalesRaw = resSuc.data || (Array.isArray(resSuc) ? resSuc : []);

      set({
        categories: resCats.data || (Array.isArray(resCats) ? resCats : []),
        units: (resUnits.data || (Array.isArray(resUnits) ? resUnits : [])).map((u: any) => ({ 
          ...u, 
          id_unidad: u.id_unidad || u.id_medida || u.id 
        })),
        currencies: (resCurrs.data || (Array.isArray(resCurrs) ? resCurrs : [])).map((c: any) => ({ 
          ...c, 
          id_moneda: c.id_moneda || c.id_divisa || c.id 
        })),
        statusList: (resStatus.status === 'success')
          ? (resStatus.data["2"]?.items || resStatus.data["1"]?.items || resStatus.data["13"]?.items || Object.values(resStatus.data).flatMap((v: any) => v.items || [])) 
          : (Array.isArray(resStatus) ? resStatus : []),
        sucursales: sucursalesRaw.map((s: any) => ({
          ...s,
          id_sucursal: s.id_sucursal || s.id,
          nombre_sucursal: s.nombre_sucursal || s.nombre
        })),
        isLoading: false,
        isInitialized: true
      });
    } catch (err: any) {
      set({ 
        error: err.message || "Error al cargar catálogos", 
        isLoading: false 
      });
    }
  }
}));
