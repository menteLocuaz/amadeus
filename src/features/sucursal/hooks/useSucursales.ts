import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { SucursalService, type SucursalAPI } from "../services/SucursalService";
import { sucursalSchema, type SucursalForm } from "../constants/sucursales";
import { EmpresaService, type EmpresaAPI } from "../../empresa/services/EmpresaService";

export const useSucursales = () => {
    const statusList = useCatalogStore(state => state.statusList);
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [sucursales, setSucursales] = useState<SucursalAPI[]>([]);
    const [empresas, setEmpresas] = useState<EmpresaAPI[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SucursalAPI | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SucursalForm>({
        resolver: yupResolver(sucursalSchema),
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
            const [sucList, empList] = await Promise.all([
                SucursalService.getAll(),
                EmpresaService.getAll()
            ]);
            setSucursales(sucList);
            setEmpresas(empList);
        } catch {
            setApiError("Error al sincronizar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchCatalogs]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (item?: SucursalAPI) => {
        setApiError(null);
        if (item) {
            setEditingItem(item);
            reset({
                id_empresa: item.id_empresa,
                nombre_sucursal: item.nombre_sucursal,
                id_status: item.id_status,
            });
        } else {
            setEditingItem(null);
            reset({ id_empresa: "", nombre_sucursal: "", id_status: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setApiError(null);
    };

    const onSubmit = async (data: SucursalForm) => {
        setIsSaving(true);
        setApiError(null);
        try {
            if (editingItem) {
                const updated = await SucursalService.update(editingItem.id_sucursal, data);
                setSucursales(prev => prev.map(s =>
                    s.id_sucursal === editingItem.id_sucursal ? { ...s, ...updated } : s
                ));
            } else {
                const created = await SucursalService.create(data);
                setSucursales(prev => [created, ...prev]);
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
        if (!window.confirm("¿Dar de baja esta sucursal?")) return;
        try {
            await SucursalService.delete(id);
            setSucursales(prev => prev.filter(s => s.id_sucursal !== id));
        } catch {
            alert("Error al eliminar.");
        }
    };

    /* ── Datos Derivados Memorizados ── */
    const filtered = useMemo(() => {
        const q = debouncedSearchTerm.toLowerCase().trim();
        return (sucursales || []).filter(s =>
            s.nombre_sucursal.toLowerCase().includes(q)
        );
    }, [sucursales, debouncedSearchTerm]);

    const empresaMap = useMemo(() => {
        const map: Record<string, string> = {};
        empresas.forEach(e => {
            map[e.id] = e.nombre;
        });
        return map;
    }, [empresas]);

    const statusMap = useMemo(() => {
        const map: Record<string, string> = {};
        statusList.forEach(s => {
            if (s.id_status) map[s.id_status] = s.std_descripcion || s.nombre;
        });
        return map;
    }, [statusList]);

    return {
        // States
        isLoading,
        isSaving,
        sucursales,
        empresas,
        searchTerm,
        isModalOpen,
        editingItem,
        apiError,
        statusList,
        statusMap,
        empresaMap,
        errors,

        // Derived
        filtered,

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
