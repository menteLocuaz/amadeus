import axiosClient from "../../../core/api/axiosClient";
import { ENDPOINTS } from "../../../core/api/endpoints";

/**
 * Interface for the Dashboard Resume data.
 */
export interface DashboardResumen {
  valor_inventario_total: number;
  productos_bajo_stock: number;
  ventas_vs_compras: {
    mes: string;
    ventas: number;
    compras: number;
  }[];
  top_productos: {
    nombre: string;
    rentabilidad: number;
    cantidad: number;
  }[];
  punto_equilibrio: number;
  gastos_mensuales: number;
  ciclo_conversion_efectivo: number;
  dio: number;
  dso: number;
  dpo: number;
}

/**
 * Interface for Debt Aging data.
 */
export interface AntiguedadDeuda {
  rango: string; // "0-30", "31-60", etc.
  monto: number;
}

/**
 * Interface for Inventory Composition by Category.
 */
export interface InventarioCategoria {
  categoria: string;
  valor: number;
  porcentaje: number;
}

/**
 * Interface for a single Shrinkage/Expiration item.
 */
export interface MermaItem {
  id_producto: string;
  pro_nombre: string;
  pro_codigo: string;
  cantidad_merma: number;
  motivo: string;
  costo_total: number;
  fecha: string;
}

/**
 * Interface for the full Shrinkage/Expiration response.
 */
export interface MermasResponse {
  total_mermas: number;
  moneda: string;
  items: MermaItem[];
}

/**
 * Helper to ensure we extract an array from various API response formats.
 */
const extractArray = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && typeof res.data === 'object') {
    // If it has an 'items' property that is an array
    if (Array.isArray(res.data.items)) return res.data.items;
    // Look for any property that is an array (often module-specific keys like "1", "2", etc)
    const possibleArray = Object.values(res.data).find(v => Array.isArray(v));
    if (possibleArray) return possibleArray as any[];
    // If the data object itself has items in a sub-property
    const subItems = Object.values(res.data).find(v => v && typeof v === 'object' && Array.isArray((v as any).items));
    if (subItems) return (subItems as any).items;
  }
  return [];
};

/**
 * Service to interact with Dashboard endpoints.
 */
export const DashboardService = {
  getResumen: async (): Promise<DashboardResumen> => {
    const response = await axiosClient.get(ENDPOINTS.dashboard.resumen);
    const data = response.data?.data || response.data || {};
    
    // Normalize nested arrays
    return {
      ...data,
      ventas_vs_compras: extractArray({ data: data.ventas_vs_compras }),
      top_productos: extractArray({ data: data.top_productos }),
    } as DashboardResumen;
  },

  getAntiguedadDeuda: async (): Promise<AntiguedadDeuda[]> => {
    const response = await axiosClient.get(ENDPOINTS.dashboard.antiguedadDeuda);
    return extractArray(response.data);
  },

  getComposicionCategoria: async (): Promise<InventarioCategoria[]> => {
    const response = await axiosClient.get(ENDPOINTS.dashboard.composicionCategoria);
    return extractArray(response.data);
  },

  getMermas: async (): Promise<MermasResponse> => {
    const response = await axiosClient.get(ENDPOINTS.dashboard.mermas);
    const data = response.data?.data || response.data || {};
    return {
      total_mermas: data.total_mermas ?? 0,
      moneda: data.moneda ?? "USD",
      items: extractArray({ data: data.items ?? data }),
    };
  },
};
