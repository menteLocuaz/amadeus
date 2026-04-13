export interface Impuesto {
  id_impuesto: string;
  nombre: string;
  porcentaje: number; // e.g. 19 for 19% (API field name)
  id_status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ImpuestoDTO {
  nombre: string;
  porcentaje: number;
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
  impuesto: number;        // was incorrectly "iva"
  total: number;
  observacion?: string;
  id_estacion: string;
  id_sucursal: string;     // required by API, was missing
  id_cliente: string;
  id_periodo: string;
  id_control_estacion?: string;
  base_impuesto: number;
  valor_impuesto: number;
  metadata?: any;
}

export interface FacturaDetalle {
  id_producto: string;
  cantidad: number;
  precio_unitario: number; // API field name (was "precio")
  subtotal: number;
  impuesto: number;
  total: number;
  // UI-only extras
  nombre_producto?: string;
}

// Matches the API payload shape: metodo_pago + monto + referencia
export interface FacturaPago {
  metodo_pago: string;     // "EFECTIVO" | "TARJETA" | etc.
  monto: number;
  referencia?: string;
}

export interface FacturaCompletaRequest {
  cabecera: FacturaCabecera;
  detalles: FacturaDetalle[];
  pagos: FacturaPago[];
}

export interface FacturaResponse {
  id_factura: string;
  fac_numero: string;
  fecha_operacion: string; // API field name (was "fecha")
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
