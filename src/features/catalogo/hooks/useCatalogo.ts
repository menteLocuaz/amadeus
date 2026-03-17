import { useState, useEffect, useMemo } from "react";
import { ProductService, type Product } from "../../products/services/ProductService";
import { CategoryService, type Category } from "../../products/services/CategoryService";
import { SucursalService, type Sucursal } from "../../proveedor/services/SucursalService";
import { EstatusService, type Estatus } from "../../auth/services/EstatusService";

export const useCatalogo = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [statuses, setStatuses] = useState<Estatus[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [search, setSearch] = useState("");
    const [selectedCat, setSelectedCat] = useState("all");
    const [selectedSuc, setSelectedSuc] = useState("all");
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out

    const loadData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes, sRes, stRes] = await Promise.all([
                ProductService.getAll(),
                CategoryService.getAll(),
                SucursalService.getAll(),
                EstatusService.getCatalogo() // Using getCatalogo for grouped data
            ]);
            
            setProducts(pRes?.data || []);
            setCategories(cRes?.data || []);
            setSucursales(sRes?.data || []);
            
            // Extract module 4 (stock/products) if grouped, otherwise fallback to others
            const stData = stRes?.data;
            if (stData && typeof stData === 'object' && !Array.isArray(stData)) {
                setStatuses(stData["4"]?.items || stData["2"]?.items || stData["1"]?.items || []);
            } else {
                setStatuses(stRes?.data || []);
            }
        } catch (err) {
            console.error("Error loading catalogue data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                (p.id_producto || "").toLowerCase().includes(search.toLowerCase());
            
            const matchesCat = selectedCat === "all" || p.id_categoria === selectedCat;
            const matchesSuc = selectedSuc === "all" || p.id_sucursal === selectedSuc;

            let matchesStock = true;
            const stock = p.stock || 0;
            const min = 5; // Default generic min stock
            if (stockFilter === "low") matchesStock = stock > 0 && stock <= min;
            if (stockFilter === "out") matchesStock = stock <= 0;

            return matchesSearch && matchesCat && matchesSuc && matchesStock;
        });
    }, [products, search, selectedCat, selectedSuc, stockFilter]);

    const getStatusLabel = (p: Product) => {
        if (p.status?.std_descripcion) return p.status.std_descripcion;
        const s = statuses.find(st => st.id_status === p.id_status);
        return s?.std_descripcion || s?.nombre || p.id_status?.toUpperCase() || "ACTIVO";
    };

    return {
        products: filtered,
        categories,
        sucursales,
        loading,
        search,
        setSearch,
        selectedCat,
        setSelectedCat,
        selectedSuc,
        setSelectedSuc,
        stockFilter,
        setStockFilter,
        loadData,
        getStatusLabel
    };
};
