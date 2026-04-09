export interface Impuesto {
  id_impuesto: string;
  nombre: string;
  valor: number; // e.g. 0.15 for 15%
  id_status: string;
}

export interface FormaPago {
  id_forma_pago: string;
  nombre: string;
  tipo: string; // EFECTIVO, TARJETA, etc.
  id_status: string;
}

export interface FacturaCabecera {
  fac_numero: string;
  subtotal: number;
  iva: number;
  total: number;
  observacion?: string;
  id_estacion: string;
  id_orden_pedido?: string;
  id_cliente: string;
  id_periodo: string;
  id_control_estacion?: string;
  base_impuesto: number;
  impuesto: number;
  valor_impuesto: number;
  metadata?: any;
}

export interface FacturaDetalle {
  id_producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  impuesto: number;
  total: number;
  // Extras for UI
  nombre_producto?: string;
}

export interface FacturaPago {
  id_forma_pago: string;
  valor_billete: number;
  total_pagar: number;
}

export interface FacturaCompletaRequest {
  cabecera: FacturaCabecera;
  detalles: FacturaDetalle[];
  pagos: FacturaPago[];
}

export interface FacturaResponse {
  id_factura: string;
  fac_numero: string;
  fecha: string;
  total: number;
  id_status: string;
  cliente?: {
    nombre: string;
    ruc: string;
  };
  cabecera: FacturaCabecera;
  detalles: FacturaDetalle[];
  pagos: FacturaPago[];
}
