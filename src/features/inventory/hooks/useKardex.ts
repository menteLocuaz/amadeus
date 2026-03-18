import { useState, useMemo } from 'react';
import { KardexService, type MovimientoKardex } from '../services/KardexService';
import { ProductService, type Product } from '../../products/services/ProductService';
import { SucursalService, type Sucursal } from '../../proveedor/services/SucursalService';

export const useKardex = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [movimientos, setMovimientos] = useState<MovimientoKardex[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    
    // Load initial data (Products for the dropdown)
    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [pRes, sRes] = await Promise.all([
                ProductService.getAll(),
                SucursalService.getAll()
            ]);
            
            const extract = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.data?.items) return res.data.items;
                return [];
            };
            
            setProducts(extract(pRes));
            setSucursales(extract(sRes));
        } catch (error) {
            console.error('Error loading initial Kardex data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch movements when user clicks search
    const handleSearch = async () => {
        if (!selectedProduct) {
            alert('Por favor seleccione un producto');
            return;
        }
        
        setIsSearching(true);
        try {
            const res = await KardexService.getMovimientos(selectedProduct, startDate, endDate);
            
            // Handle mock data extraction if API fails or returns non-array
            if (res.success && Array.isArray(res.data)) {
                setMovimientos(res.data);
            } else if (Array.isArray(res)) {
                setMovimientos(res);
            } else {
                setMovimientos([]);
                console.warn('Estructura de movimientos inesperada o vacía', res);
            }
        } catch (error) {
            console.error('Error fetching Kardex movements:', error);
            alert('Error al obtener el historial de movimientos');
            setMovimientos([]);
        } finally {
            setIsSearching(false);
        }
    };
    
    // Calculate running balance for UI display if backend doesn't provide it
    const movimientosConSaldo = useMemo(() => {
        let currentBalance = 0;
        return [...movimientos].sort((a, b) => new Date(a.fecha || a.created_at || 0).getTime() - new Date(b.fecha || b.created_at || 0).getTime()).map(mov => {
            const type = (mov.tipo || '').toUpperCase();
            if (type === 'ENTRADA' || type === 'COMPRA') currentBalance += Number(mov.cantidad);
            else if (type === 'SALIDA' || type === 'VENTA') currentBalance -= Number(mov.cantidad);
            else if (type === 'AJUSTE') currentBalance = Number(mov.cantidad); // Assuming ajuste overrides balance
            
            return {
                ...mov,
                saldo_calculado: currentBalance
            };
        });
    }, [movimientos]);

    return {
        products,
        sucursales,
        movimientos: movimientosConSaldo,
        isLoading,
        isSearching,
        selectedProduct,
        setSelectedProduct,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loadInitialData,
        handleSearch
    };
};
