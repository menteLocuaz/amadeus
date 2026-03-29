import axiosClient from '../../../core/api/axiosClient';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Product {
  id_producto?: string;
  id?: string;
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_actual?: number;

  fecha_vencimiento?: string;
  imagen?: string;
  id_status: string;
  id_sucursal: string;
  id_categoria: string;
  id_moneda: string;
  id_unidad: string;
  categoria?: { nombre: string };
  moneda?: { nombre: string };
  unidad?: { nombre: string };
  status?: { std_descripcion: string };
}

export interface CreateProductDTO {
  nombre: string;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  fecha_vencimiento?: string;
  imagen?: string;
  id_status: string;
  id_sucursal: string;
  id_categoria: string;
  id_moneda: string;
  id_unidad: string;
}

export const ProductService = {
  getAll: async (): Promise<{ status: string; data: Product[] }> => {
    const { data } = await axiosClient.get(ENDPOINTS.productos.base);
    return data;
  },

  getById: async (id: string): Promise<{ status: string; data: Product }> => {
    const { data } = await axiosClient.get(ENDPOINTS.productos.byId(id));
    return data;
  },

  create: async (payload: CreateProductDTO): Promise<{ status: string; data: Product }> => {
    const { data } = await axiosClient.post(ENDPOINTS.productos.base, payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateProductDTO>): Promise<{ status: string; data: Product }> => {
    const { data } = await axiosClient.put(ENDPOINTS.productos.byId(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(ENDPOINTS.productos.byId(id));
  }
};
