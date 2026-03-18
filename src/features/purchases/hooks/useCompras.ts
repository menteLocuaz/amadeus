import { useState, useEffect, useMemo } from "react";
import { PurchaseService } from "../services/PurchaseService";
import { ProductService, type Product } from "../../products/services/ProductService";
import { ProveedorService, type Proveedor } from "../../proveedor/services/ProveedorService";
import { SucursalService, type Sucursal } from "../../proveedor/services/SucursalService";

import { useAuthStore } from "../../auth/store/useAuthStore";

export const useCompras = () => {
    const { user } = useAuthStore();
    const [items, setItems] = useState<any[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [query, setQuery] = useState("");

    const [openModal, setOpenModal] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [invRes, prodRes, supRes, sucRes] = await Promise.all([
                PurchaseService.getAll(),
                ProductService.getAll(),
                ProveedorService.getAll(),
                SucursalService.getAll(),
            ]);

            const extractData = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.items && Array.isArray(res.items)) return res.items;
                if (res.data && typeof res.data === 'object') {
                    const modData = res.data["2"] || res.data["1"] || res.data["3"];
                    if (modData && Array.isArray(modData.items)) return modData.items;
                    return Object.values(res.data).filter(v => typeof v === 'object') as any[];
                }
                return [];
            };

            const inventoryList = extractData(invRes);
            const productList = extractData(prodRes);
            const supplierList = extractData(supRes);
            const sucursalList = extractData(sucRes);

            // Merge: Show all products, but update with inventory values if they exist
            const mergedItems = productList.map((p: any) => {
                const inv = inventoryList.find((i: any) => (i.id_producto === (p.id || p.id_producto)));
                return {
                    id: inv?.id || `new-${p.id || p.id_producto}`, // virtual ID for new items
                    id_producto: p.id || p.id_producto,
                    nombre: p.nombre,
                    stock_actual: inv?.stock_actual || 0,
                    precio_compra: inv?.precio_compra || p.precio_compra || 0,
                    precio_venta: inv?.precio_venta || p.precio_venta || 0,
                    producto: p
                };
            });

            setItems(mergedItems);
            setProducts(productList);
            setSuppliers(supplierList);
            setSucursales(sucursalList);
        } catch (err) {
            console.error("Error loading Inventory/Compras data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(i =>
            (i.nombre || "").toLowerCase().includes(q) ||
            (i.id_producto || "").toLowerCase().includes(q)
        );
    }, [items, query]);

    const handleCreate = async (data: any) => {
        if (!user?.id_usuario) {
            alert("Usuario no autenticado");
            return;
        }
        await PurchaseService.create({
            ...data,
            id_usuario: user.id_usuario
        });
        await loadData();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Eliminar este registro de inventario?")) return;
        setIsDeletingId(id);
        try {
            await PurchaseService.delete(id);
            await loadData();
        } catch (err) {
            console.error("Error deleting item:", err);
        } finally {
            setIsDeletingId(null);
        }
    };

    return {
        items: filtered,
        products,
        suppliers,
        sucursales,
        isLoading,
        isDeletingId,
        query,
        setQuery,
        openModal,
        openCreate: () => setOpenModal(true),
        closeModal: () => setOpenModal(false),
        loadData,
        handleCreate,
        handleDelete
    };
};
