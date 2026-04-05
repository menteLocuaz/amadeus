import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { EmpresaService, type EmpresaAPI } from "../services/EmpresaService";
import { empresaSchema, type EmpresaForm } from "../constants/empresas";

export const useEmpresas = () => {
    const statusList = useCatalogStore(state => state.statusList);
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [empresas, setEmpresas] = useState<EmpresaAPI[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EmpresaAPI | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EmpresaForm>({
        resolver: yupResolver(empresaSchema),
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
            const list = await EmpresaService.getAll();
            setEmpresas(list);
        } catch {
            setApiError("Error al sincronizar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchCatalogs]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (item?: EmpresaAPI) => {
        setApiError(null);
        if (item) {
            setEditingItem(item);
            reset({
                nombre: item.nombre,
                rut: item.rut,
                id_status: item.id_status,
            });
        } else {
            setEditingItem(null);
            reset({ nombre: "", rut: "", id_status: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setApiError(null);
    };

    const onSubmit = async (data: EmpresaForm) => {
        setIsSaving(true);
        setApiError(null);
        try {
            if (editingItem) {
                const updated = await EmpresaService.update(editingItem.id, data);
                setEmpresas(prev => prev.map(e =>
                    e.id === editingItem.id ? { ...e, ...updated } : e
                ));
            } else {
                const created = await EmpresaService.create(data);
                setEmpresas(prev => [created, ...prev]);
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
        if (!window.confirm("¿Dar de baja esta empresa?")) return;
        try {
            await EmpresaService.delete(id);
            setEmpresas(prev => prev.filter(e => e.id !== id));
        } catch {
            alert("Error al eliminar.");
        }
    };

    /* ── Datos Derivados Memorizados ── */
    const filtered = useMemo(() => {
        const q = debouncedSearchTerm.toLowerCase().trim();
        return (empresas || []).filter(e =>
            e.nombre.toLowerCase().includes(q) ||
            e.rut.toLowerCase().includes(q)
        );
    }, [empresas, debouncedSearchTerm]);

    const statusMap = useMemo(() => {
        const map: Record<string, string> = {};
        statusList.forEach(s => {
            if (s.id_status) map[s.id_status] = s.std_descripcion || (s as any).nombre;
        });
        return map;
    }, [statusList]);

    return {
        // States
        isLoading,
        isSaving,
        empresas,
        searchTerm,
        isModalOpen,
        editingItem,
        apiError,
        statusList,
        statusMap,
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
