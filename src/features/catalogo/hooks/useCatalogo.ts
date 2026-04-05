/**
 * useCatalogo.ts
 * Custom hook que centraliza toda la lógica de datos y filtros
 * para la vista de Inventario & Catálogo.
 *
 * Responsabilidades:
 *  - Cargar productos, categorías, sucursales y estatus desde la API.
 *  - Exponer estados de filtro (búsqueda, categoría, sucursal, stock).
 *  - Devolver la lista de productos ya filtrada mediante useMemo.
 *  - Proveer helpers para resolver etiquetas de estado y sucursal.
 */
import { useState, useEffect, useMemo } from "react";
import { ProductService, type Product } from "../../products/services/ProductService";
import { CategoryService, type Category } from "../../products/services/CategoryService";
import { SucursalService } from "../../sucursal/services/SucursalService";
import { EstatusService, type Estatus } from "../../auth/services/EstatusService";
import { extractData } from "../../proveedor/hooks/useProveedoresQuery";

export const useCatalogo = () => {
    // ── Estado principal de datos ──────────────────────────────────────────
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<Estatus[]>([]);
    const [loading, setLoading] = useState(false);

    // ── Estados de filtro ──────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [selectedCat, setSelectedCat] = useState("all");
    const [selectedSuc, setSelectedSuc] = useState("all");
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out

    /**
     * loadData
     * Dispara todas las peticiones a la API en paralelo con Promise.all
     * para minimizar el tiempo de espera total.
     * Usa la función compartida `extractData` para normalizar las distintas
     * estructuras de respuesta que puede devolver el backend.
     */
    const loadData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes, sRes, stRes] = await Promise.all([
                ProductService.getAll(),
                CategoryService.getAll(),
                SucursalService.getAll(),
                EstatusService.getCatalogo()
            ]);
            
            setProducts(extractData(pRes));
            setCategories(extractData(cRes));
            setSucursales(extractData(sRes));
            
            /**
             * Los estatus tienen un tratamiento especial:
             * EstatusService.getCatalogo() devuelve un objeto indexado por módulo
             * (ej: { "4": { items: [...] } }). Se intenta extraer el módulo 4
             * (Inventario/Catálogo) y se cae en cascada a módulos alternativos.
             * Si la respuesta ya es un array, se usa extractData() directamente.
             */
            const stData = stRes?.data || stRes;
            if (stData && typeof stData === 'object' && !Array.isArray(stData)) {
                setStatuses((stData["4"]?.items || stData["2"]?.items || stData["1"]?.items || extractData(stRes)) as unknown as Estatus[]);
            } else {
                setStatuses(extractData(stRes));
            }
        } catch (err) {
            console.error("Error loading catalogue data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Carga inicial de datos al montar el hook
    useEffect(() => {
        loadData();
    }, []);

    /**
     * filtered
     * Lista de productos derivada que aplica todos los filtros activos.
     * Se recalcula solo cuando cambia alguna dependencia (useMemo),
     * evitando iteraciones innecesarias en cada render.
     */
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

    /**
     * getStatusLabel
     * Resuelve el texto legible del estado de un producto.
     */
    const getStatusLabel = (p: Product) => {
        if (p.status?.std_descripcion) return p.status.std_descripcion;
        const s = statuses.find(st => String(st.id_status) === String(p.id_status));
        return s?.nombre || s?.std_descripcion || p.id_status?.toUpperCase() || "ACTIVO";
    };

    /**
     * getSucursalLabel
     * Resuelve el nombre de la sucursal de un producto.
     * Soporta múltiples estructuras de API (id, id_sucursal, nombre, nombre_sucursal).
     */
    const getSucursalLabel = (p: Product) => {
        const s = sucursales.find(suc => (suc.id || suc.id_sucursal) === p.id_sucursal);
        return s?.nombre || s?.nombre_sucursal || "N/A";
    };

    // ── API pública del hook ───────────────────────────────────────────────
    return {
        products: filtered,   // Lista filtrada lista para renderizar
        categories,           // Para poblar el select de categorías
        sucursales,           // Para poblar el select de sucursales
        loading,              // true mientras se cargan los datos
        search,
        setSearch,
        selectedCat,
        setSelectedCat,
        selectedSuc,
        setSelectedSuc,
        stockFilter,
        setStockFilter,
        loadData,             // Permite refrescar manualmente desde la vista
        getStatusLabel,
        getSucursalLabel
    };
};