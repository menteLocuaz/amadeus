import { useState, useMemo, useEffect } from 'react';
import { usePOSStore } from '../../pos/store/usePOSStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { FacturaService } from '../services/FacturaService';
import { EstatusService } from '../../auth/services/EstatusService';
import { ClienteService, type Cliente } from '../../cliente/services/ClienteService';
import { ProductService, type Product } from '../../products/services/ProductService';
import type {
  Impuesto, FormaPago, FacturaDetalle, FacturaPago, FacturaCabecera
} from '../types';
import { extractData } from '../../proveedor/hooks/useProveedoresQuery';
import Swal from 'sweetalert2';

export const useFacturacion = () => {
  const { id_estacion, activePeriodo } = usePOSStore();
  const { user } = useAuthStore();

  // Data lists
  const [clientes, setClientes]       = useState<Cliente[]>([]);
  const [productos, setProducts]      = useState<Product[]>([]);
  const [impuestos, setImpuestos]     = useState<Impuesto[]>([]);
  const [formasPago, setFormasPago]   = useState<FormaPago[]>([]);
  const [statusPagadaId, setStatusPagadaId] = useState<string>('');

  // Selection state
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [cart, setCart]               = useState<FacturaDetalle[]>([]);
  const [payments, setPayments]       = useState<FacturaPago[]>([]);
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading]         = useState(false);

  // Load catalog data independently — one 500 won't block the rest
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const [cRes, pRes, iRes, fRes, sRes] = await Promise.allSettled([
        ClienteService.getAll(),
        ProductService.getAll(),
        FacturaService.getImpuestos(),
        FacturaService.getFormasPago(),
        EstatusService.getByModulo(5),
      ]);

      if (cRes.status === 'fulfilled') setClientes(extractData(cRes.value));
      if (pRes.status === 'fulfilled') setProducts(extractData(pRes.value));
      if (iRes.status === 'fulfilled') setImpuestos(extractData(iRes.value));
      if (fRes.status === 'fulfilled') setFormasPago(extractData(fRes.value));
      if (sRes.status === 'fulfilled') {
        const items: any[] = Array.isArray(sRes.value?.data) ? sRes.value.data : [];
        const pagada = items.find((s) => s.std_descripcion === 'Pagada');
        if (pagada) setStatusPagadaId(pagada.id_status);
      }

      setLoading(false);
    };
    loadInitialData();
  }, []);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.subtotal, 0), [cart]);

  // API returns porcentaje as an integer (e.g. 19), convert to decimal rate for math
  const activeTax = useMemo(() => {
    if (!Array.isArray(impuestos) || impuestos.length === 0) return null;
    return impuestos.find(i => i.nombre?.toUpperCase().includes('IVA')) ?? impuestos[0];
  }, [impuestos]);

  const taxRate   = useMemo(() => (activeTax?.porcentaje ?? 0) / 100, [activeTax]);
  const taxValue  = useMemo(() => subtotal * taxRate, [subtotal, taxRate]);
  const total     = useMemo(() => subtotal + taxValue, [subtotal, taxValue]);

  // payments now use FacturaPago shape: { metodo_pago, monto, referencia }
  const totalPaid     = useMemo(() => payments.reduce((acc, p) => acc + p.monto, 0), [payments]);
  const pendingAmount = useMemo(() => Math.max(0, total - totalPaid), [total, totalPaid]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const price        = product.precio_venta ?? 0;
    const itemSubtotal = price * quantity;
    const itemTax      = itemSubtotal * taxRate;

    const newDetail: FacturaDetalle = {
      id_producto:      product.id_producto ?? (product as any).id,
      nombre_producto:  product.pro_nombre ?? product.nombre,
      cantidad:         quantity,
      precio_unitario:  price,       // API field name
      subtotal:         itemSubtotal,
      impuesto:         itemTax,
      total:            itemSubtotal + itemTax,
    };

    setCart(prev => {
      const existing = prev.find(i => i.id_producto === newDetail.id_producto);
      if (existing) {
        return prev.map(i => i.id_producto === newDetail.id_producto
          ? {
              ...i,
              cantidad:        i.cantidad + quantity,
              subtotal:        (i.cantidad + quantity) * price,
              impuesto:        (i.cantidad + quantity) * price * taxRate,
              total:           (i.cantidad + quantity) * price * (1 + taxRate),
            }
          : i
        );
      }
      return [...prev, newDetail];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.id_producto !== productId));
  };

  // metodo_pago is the string type (e.g. "EFECTIVO"), not the UUID
  const addPayment = (metodo_pago: string, amount: number, referencia?: string) => {
    if (amount <= 0) return;
    const newPayment: FacturaPago = { metodo_pago, monto: amount, referencia };
    setPayments(prev => [...prev, newPayment]);
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedCliente('');
    setCart([]);
    setPayments([]);
    setObservacion('');
  };

  const handleCreateInvoice = async () => {
    if (!id_estacion || !activePeriodo) {
      Swal.fire('Error', 'Debe tener una estación activa y un periodo abierto.', 'error');
      return;
    }
    if (!selectedCliente) {
      Swal.fire('Error', 'Debe seleccionar un cliente.', 'error');
      return;
    }
    if (cart.length === 0) {
      Swal.fire('Error', 'El carrito está vacío.', 'error');
      return;
    }
    if (pendingAmount > 0.01) {
      Swal.fire('Error', 'El monto pagado no cubre el total de la factura.', 'error');
      return;
    }

    const id_sucursal = user?.id_sucursal ?? user?.sucursal?.id_sucursal ?? '';

    setLoading(true);
    try {
      const cabecera: FacturaCabecera = {
        fac_numero:         'AUTO',
        subtotal,
        impuesto:           taxValue,
        total,
        observacion,
        id_estacion,
        id_sucursal,
        id_cliente:         selectedCliente,
        id_periodo:         activePeriodo.id_periodo,
        id_control_estacion: undefined,
        base_impuesto:      subtotal,
        valor_impuesto:     taxValue,
        id_status:          statusPagadaId,
      };

      await FacturaService.crearFacturaCompleta({ cabecera, detalles: cart, pagos: payments });

      Swal.fire('Éxito', 'Factura generada correctamente.', 'success');
      resetForm();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message ?? 'Error al crear factura', 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    clientes,
    productos,
    impuestos,
    formasPago,
    selectedCliente,
    setSelectedCliente,
    cart,
    addToCart,
    removeFromCart,
    payments,
    addPayment,
    removePayment,
    observacion,
    setObservacion,
    subtotal,
    taxValue,
    total,
    totalPaid,
    pendingAmount,
    loading,
    handleCreateInvoice,
    activeTax,
  };
};
