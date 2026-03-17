import axiosClient from '../../../core/api/axiosClient';

// Based on the provided DB schema, this aligns with MOVIMIENTOS_INVENTARIO
export interface MovimientoKardex {
  id?: string;
  id_producto: string;
  id_sucursal?: string;
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'; // Assuming these types exist
  cantidad: number;
  saldo_resultante?: number;
  referencia?: string; // e.g., Factura ID, Orden Pedido ID
  id_usuario?: string;
  created_at?: string;
}

export const KardexService = {
  getMovimientos: async (idProducto: string, fechaInicio?: string, fechaFin?: string): Promise<{ success: boolean; data: MovimientoKardex[] }> => {
    // Construct query params
    const params = new URLSearchParams();
    if (fechaInicio) params.append('startDate', fechaInicio);
    if (fechaFin) params.append('endDate', fechaFin);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    // Assuming a RESTful endpoint structure based on the DB schema
    // If the endpoint differs in practice, this can be updated later.
    const url = `/inventario/producto/${idProducto}/movimientos${queryString}`;
    
    // Fallback/Mock for now if endpoint isn't fully ready, but structured to call real API
    try {
       const { data } = await axiosClient.get(url);
       return data;
    } catch (error) {
       console.warn("Kardex endpoint might not be available yet. Returning empty or mock data.", error);
       return { success: false, data: [] };
    }
  }
};
