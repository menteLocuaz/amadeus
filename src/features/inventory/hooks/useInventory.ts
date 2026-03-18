import { useState, useEffect, useMemo } from "react";
import { InventoryService, type InventoryItem } from "../services/InventoryService";
import { useAuthStore } from "../../auth/store/useAuthStore";

export const useInventory = () => {
    const { user } = useAuthStore();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await InventoryService.getAll();
            
            // Reusing the robust extraction logic from useCompras
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

            setItems(extractData(res));
        } catch (error) {
            console.error("Error loading inventory:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter(it => {
            const matchesSearch = !q || 
                it.producto?.nombre?.toLowerCase().includes(q) || 
                it.id_producto?.toLowerCase().includes(q);
            const matchesCat = catFilter === "all" || it.producto?.categoria?.nombre === catFilter;
            return matchesSearch && matchesCat;
        });
    }, [items, search, catFilter]);

    const handleAdjust = async (id: string, payload: Partial<InventoryItem>, motivo?: string) => {
        if (!user?.id_usuario) {
            alert("Usuario no autenticado");
            return;
        }
        setIsSaving(true);
        try {
            // 1. Update the inventory record (stock, min, max, prices)
            await InventoryService.update(id, payload);

            // 2. Register the movement for Kardex history if stock changed
            const original = items.find(i => i.id === id);
            if (payload.stock_actual !== undefined && original && payload.stock_actual !== original.stock_actual) {
                const diff = payload.stock_actual - original.stock_actual;
                await InventoryService.createMovement({
                    id_producto: original.id_producto,
                    tipo_movimiento: 'AJUSTE',
                    cantidad: Math.abs(diff),
                    id_usuario: user.id_usuario,
                    referencia: motivo || "AJUSTE MANUAL"
                });
            }

            await loadData();
        } catch (error) {
            console.error("Error adjusting stock:", error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const categories = useMemo(() => 
        [...new Set(items.map(i => i.producto?.categoria?.nombre).filter(Boolean))], 
    [items]);

    return {
        items: filteredItems,
        totalCount: items.length,
        categories,
        isLoading,
        isSaving,
        search,
        setSearch,
        catFilter,
        setCatFilter,
        refresh: loadData,
        handleAdjust
    };
};
