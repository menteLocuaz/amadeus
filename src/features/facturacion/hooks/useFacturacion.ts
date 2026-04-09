import { useState, useMemo, useEffect } from 'react';
import { usePOSStore } from '../../pos/store/usePOSStore';
import { FacturaService } from '../services/FacturaService';
import { ClienteService, type Cliente } from '../../cliente/services/ClienteService';
import { ProductService, type Product } from '../../products/services/ProductService';
import { 
  Impuesto, FormaPago, FacturaDetalle, FacturaPago, FacturaCabecera 
} from '../types';
import { extractData } from '../../proveedor/hooks/useProveedoresQuery';
import Swal from 'sweetalert2';

export const useFacturacion = () => {
  const { id_estacion, activePeriodo } = usePOSStore();
  
  // Data lists
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProducts] = useState<Product[]>([]);
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  
  // Selection state
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [cart, setCart] = useState<FacturaDetalle[]>([]);
  const [payments, setPayments] = useState<FacturaPago[]>([]);
  const [observacion, setObservacion] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [cRes, pRes, iRes, fRes] = await Promise.all([
          ClienteService.getAll(),
          ProductService.getAll(),
          FacturaService.getImpuestos(),
          FacturaService.getFormasPago()
        ]);
        setClientes(extractData(cRes));
        setProducts(extractData(pRes));
        setImpuestos(extractData(iRes));
        setFormasPago(extractData(fRes));
      } catch (error) {
        console.error('Error loading facturacion data', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.subtotal, 0), [cart]);
  
  // For simplicity, we assume one primary tax (IVA) for now, but the API supports more complex mapping
  const activeTax = useMemo(() => {
    if (!Array.isArray(impuestos) || impuestos.length === 0) return null;
    return impuestos.find(i => i.nombre?.toUpperCase().includes('IVA')) || impuestos[0];
  }, [impuestos]);
  
  const taxValue = useMemo(() => {
    if (!activeTax) return 0;
    return subtotal * activeTax.valor;
  }, [subtotal, activeTax]);

  const total = useMemo(() => subtotal + taxValue, [subtotal, taxValue]);

  const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.valor_billete, 0), [payments]);
  const pendingAmount = useMemo(() => Math.max(0, total - totalPaid), [total, totalPaid]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const price = product.precio_venta || 0;
    const taxRate = activeTax?.valor || 0;
    
    const itemSubtotal = price * quantity;
    const itemTax = itemSubtotal * taxRate;
    
    const newDetail: FacturaDetalle = {
      id_producto: product.id_producto || (product as any).id,
      nombre_producto: product.nombre,
      cantidad: quantity,
      precio: price,
      subtotal: itemSubtotal,
      impuesto: itemTax,
      total: itemSubtotal + itemTax
    };

    setCart(prev => {
      const existing = prev.find(i => i.id_producto === newDetail.id_producto);
      if (existing) {
        return prev.map(i => i.id_producto === newDetail.id_producto 
          ? { ...i, 
              cantidad: i.cantidad + quantity, 
              subtotal: (i.cantidad + quantity) * price,
              impuesto: (i.cantidad + quantity) * price * taxRate,
              total: (i.cantidad + quantity) * price * (1 + taxRate)
            } 
          : i);
      }
      return [...prev, newDetail];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.id_producto !== productId));
  };

  const addPayment = (id_forma_pago: string, amount: number) => {
    if (amount <= 0) return;
    const newPayment: FacturaPago = {
      id_forma_pago,
      valor_billete: amount,
      total_pagar: total // This field in API seems to be the invoice total linked to this payment
    };
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

    setLoading(true);
    try {
      const cabecera: FacturaCabecera = {
        fac_numero: `FAC-${Date.now()}`, // Fallback if server doesn't generate
        subtotal,
        iva: taxValue,
        total,
        observacion,
        id_estacion,
        id_cliente: selectedCliente,
        id_periodo: activePeriodo.id_periodo,
        base_impuesto: subtotal,
        impuesto: activeTax?.valor || 0,
        valor_impuesto: taxValue
      };

      await FacturaService.crearFacturaCompleta({
        cabecera,
        detalles: cart,
        pagos: payments
      });

      Swal.fire('Éxito', 'Factura generada correctamente.', 'success');
      resetForm();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Error al crear factura', 'error');
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
    activeTax
  };
};
