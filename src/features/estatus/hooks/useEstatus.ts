// ─── Estatus Feature — useEstatus Hook ────────────────────────────────────────
// Encapsula TODA la lógica asíncrona y de estado del módulo.
// El componente de página sólo llama funciones y renderiza lo que el hook devuelve.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
    EstatusService,
    type EstatusResponse,
    type EstatusMasterCatalog,
} from "../services/EstatusService";

import { estatusSchema, type EstatusFormValues } from "../constants";

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useEstatus = () => {

    // ── Datos del servidor ───────────────────────────────────────────────────
    const [allItems, setAllItems] = useState<EstatusResponse[]>([]);
    const [catalog, setCatalog] = useState<EstatusMasterCatalog>({});

    // ── Estados de carga independientes ─────────────────────────────────────
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    // ── Estado del modal ─────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EstatusResponse | null>(null);

    // ── Búsqueda ─────────────────────────────────────────────────────────────
    const [searchTerm, setSearchTerm] = useState("");

    // ── React Hook Form ──────────────────────────────────────────────────────
    const form = useForm<EstatusFormValues>({
        resolver: yupResolver(estatusSchema),
    });

    // ── Carga inicial ────────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            // Peticiones paralelas: lista plana (para stats) + catálogo agrupado (para tabla)
            const [flat, grouped] = await Promise.all([
                EstatusService.getAll(),
                EstatusService.getCatalog(),
            ]);
            setAllItems(flat);
            setCatalog(grouped);
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? "Error al cargar los estatus.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Modal: abrir / cerrar ────────────────────────────────────────────────

    const openCreate = () => {
        setApiError(null);
        setEditingItem(null);
        form.reset({ std_descripcion: "", stp_tipo_estado: "", mdl_id: undefined });
        setIsModalOpen(true);
    };

    const openEdit = (item: EstatusResponse) => {
        setApiError(null);
        setEditingItem(item);
        // Precarga los valores en el formulario
        // stp_tipo_estado puede ser null/undefined en registros legacy → fallback ""
        form.setValue("std_descripcion", item.std_descripcion);
        form.setValue("stp_tipo_estado", item.stp_tipo_estado ?? "");
        form.setValue("mdl_id", item.mdl_id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (isSaving) return; // no cierra si hay guardado en curso
        setIsModalOpen(false);
        setEditingItem(null);
        setApiError(null);
    };

    // ── Guardar (crear o actualizar) ─────────────────────────────────────────

    const handleSave = async (values: EstatusFormValues) => {
        setIsSaving(true);
        setApiError(null);
        try {
            const dto = {
                std_descripcion: values.std_descripcion,
                stp_tipo_estado: values.stp_tipo_estado.toUpperCase(), // el backend espera MAYÚSCULAS
                mdl_id: Number(values.mdl_id),
            };

            if (editingItem) {
                await EstatusService.update(editingItem.id_status, dto);
            } else {
                await EstatusService.create(dto);
            }

            closeModal();
            await fetchData(); // refresca catálogo y lista plana
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? "Error al guardar el estatus.");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Eliminar ─────────────────────────────────────────────────────────────

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Eliminar este estatus definitivamente?")) return;
        setIsDeletingId(id);
        try {
            await EstatusService.delete(id);
            await fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.message ?? "Error al eliminar.");
        } finally {
            setIsDeletingId(null);
        }
    };

    // ── Catálogo filtrado (derivado de catalog + searchTerm) ─────────────────

    const filteredCatalog = useMemo((): EstatusMasterCatalog => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return catalog;

        const result: EstatusMasterCatalog = {};
        Object.entries(catalog).forEach(([key, group]) => {
            const matches = group.items.filter(i =>
                i.std_descripcion.toLowerCase().includes(q) ||
                (i.stp_tipo_estado ?? "").toLowerCase().includes(q)
            );
            if (matches.length > 0) {
                result[Number(key)] = { ...group, items: matches };
            }
        });
        return result;
    }, [catalog, searchTerm]);

    // ── Stats por tipo (derivado de allItems) ────────────────────────────────
    // Omite items sin stp_tipo_estado para no generar una clave "undefined" en el mapa.

    const tipoStats = useMemo((): [string, number][] => {
        const map: Record<string, number> = {};
        allItems.forEach(i => {
            if (!i.stp_tipo_estado) return;
            const key = i.stp_tipo_estado.toUpperCase();
            map[key] = (map[key] ?? 0) + 1;
        });
        // Ordena de mayor a menor para que los tipos más usados aparezcan primero
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [allItems]);

    // ── API pública del hook ─────────────────────────────────────────────────
    return {
        // Datos derivados
        filteredCatalog,
        tipoStats,

        // Estados de carga
        isLoading,
        isSaving,
        isDeletingId,
        apiError,

        // Modal
        isModalOpen,
        editingItem,
        openCreate,
        openEdit,
        closeModal,

        // Búsqueda
        searchTerm,
        setSearchTerm,

        // Formulario (se pasa entero para que el componente no gestione lógica)
        form,
        handleSave,
        handleDelete,
        fetchData,
    };
};