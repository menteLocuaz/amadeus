import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { EstacionService, type EstacionAPI } from "../services/EstacionService";
import { estacionSchema, type EstacionForm } from "../constants/estaciones";

export const useEstaciones = () => {
    const sucursales = useCatalogStore(state => state.sucursales);
    const statusList = useCatalogStore(state => state.statusList);
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [estaciones, setEstaciones] = useState<EstacionAPI[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EstacionAPI | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EstacionForm>({
        resolver: yupResolver(estacionSchema),
    });

    /* ── Debounce de Búsqueda ── */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            await fetchCatalogs();
            const list = await EstacionService.getAll();
            setEstaciones(list);
        } catch {
            setApiError("Error al sincronizar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchCatalogs]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (item?: EstacionAPI) => {
        setApiError(null);
        if (item) {
            setEditingItem(item);
            reset({
                codigo: item.codigo,
                nombre: item.nombre,
                ip: item.ip,
                id_sucursal: item.id_sucursal,
                id_status: item.id_status,
            });
        } else {
            setEditingItem(null);
            reset({ codigo: "", nombre: "", ip: "", id_sucursal: "", id_status: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setApiError(null);
    };

    const onSubmit = async (data: EstacionForm) => {
        setIsSaving(true);
        setApiError(null);
        try {
            if (editingItem) {
                const updated = await EstacionService.update(editingItem.id_estacion, data);
                setEstaciones(prev => prev.map(e =>
                    e.id_estacion === editingItem.id_estacion ? { ...e, ...updated } : e
                ));
            } else {
                const created = await EstacionService.create(data);
                setEstaciones(prev => [created, ...prev]);
            }
            handleCloseModal();
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setApiError(error.response?.data?.message || "Error al procesar la operación.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Dar de baja esta estación? Se realizará un Soft Delete.")) return;
        try {
            await EstacionService.delete(id);
            setEstaciones(prev => prev.filter(e => e.id_estacion !== id));
        } catch {
            alert("Error al eliminar.");
        }
    };

    /* ── Datos Derivados Memorizados ── */
    const filtered = useMemo(() => {
        const q = debouncedSearchTerm.toLowerCase().trim();
        return (estaciones || []).filter(e =>
            e.nombre.toLowerCase().includes(q) ||
            e.codigo.toLowerCase().includes(q)
        );
    }, [estaciones, debouncedSearchTerm]);

    const activeStatusList = useMemo(() =>
        statusList.filter(s => s.stp_tipo_estado === "ACTIVO" || s.stp_tipo_estado === "INACTIVO"),
        [statusList]
    );

    const sucursalMap = useMemo(() => {
        const map: Record<string, string> = {};
        sucursales.forEach(s => {
            const id = s.id || s.id_sucursal;
            if (id) map[id] = s.nombre;
        });
        return map;
    }, [sucursales]);

    const stats = useMemo(() => {
        const list = estaciones || [];
        return {
            total: list.length,
            sucursales: new Set(list.map(e => e.id_sucursal)).size,
            activas: list.filter(e => !e.deleted_at).length
        };
    }, [estaciones]);

    return {
        // States
        isLoading,
        isSaving,
        estaciones,
        searchTerm,
        isModalOpen,
        editingItem,
        apiError,
        sucursales,
        sucursalMap,
        activeStatusList,
        errors,

        // Derived
        filtered,
        stats,

        // Handlers
        setSearchTerm,
        handleOpenModal,
        handleCloseModal,
        handleDelete,
        onSubmit,

        // Form
        register,
        handleSubmit
    };
};
