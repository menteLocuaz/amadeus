import { useState, useEffect, useMemo } from "react";
import { PurchaseService, type PurchaseOrder } from "../services/PurchaseService";
import { ProductService, type Product } from "../../products/services/ProductService";
import { ProveedorService, type Proveedor } from "../../proveedor/services/ProveedorService";

export const useCompras = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    const [openOrderModal, setOpenOrderModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

    const [openReceiveModal, setOpenReceiveModal] = useState(false);
    const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [ordRes, prodRes, supRes] = await Promise.all([
                PurchaseService.getAll(),
                ProductService.getAll(),
                ProveedorService.getAll(),
            ]);

            const extractData = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.data && Array.isArray(res.data.items)) return res.data.items;
                if (res.data && typeof res.data === 'object') {
                    const vals = Object.values(res.data).filter(v => typeof v === 'object') as any[];
                    if (vals.length > 0 && Array.isArray(vals[0]?.items)) return vals[0].items;
                }
                return [];
            };

            setOrders(extractData(ordRes));
            setProducts(extractData(prodRes));
            setSuppliers(extractData(supRes));
        } catch (err) {
            console.error("Error loading Compras data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return orders;
        return orders.filter(o =>
            (o.codigo_orden || "").toLowerCase().includes(q) ||
            (o.proveedor?.nombre || "").toLowerCase().includes(q)
        );
    }, [orders, query]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Eliminar esta orden de compra?")) return;
        setIsDeletingId(id);
        try {
            await PurchaseService.delete(id);
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch (err) {
            console.error("Error deleting order:", err);
            alert("Error eliminando orden");
        } finally {
            setIsDeletingId(null);
        }
    };

    const handleReceive = (o: PurchaseOrder) => {
        setReceivingOrder(o);
        setOpenReceiveModal(true);
    };

    const openCreateOrder = () => {
        setEditingOrder(null);
        setOpenOrderModal(true);
    };

    const openEditOrder = (o: PurchaseOrder) => {
        setEditingOrder(o);
        setOpenOrderModal(true);
    };

    const closeOrderModal = () => setOpenOrderModal(false);
    const closeReceiveModal = () => setOpenReceiveModal(false);

    return {
        orders: filtered,
        products,
        suppliers,
        isLoading,
        isDeletingId,
        query,
        setQuery,
        openOrderModal,
        editingOrder,
        openReceiveModal,
        receivingOrder,
        loadData,
        handleDelete,
        handleReceive,
        openCreateOrder,
        openEditOrder,
        closeOrderModal,
        closeReceiveModal,
        setOpenOrderModal, // Keep for backward compatibility or direct control
        setOpenReceiveModal,
    };
};
