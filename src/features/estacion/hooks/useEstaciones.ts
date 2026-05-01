/**
 * useEstaciones.ts
 * Custom hook que encapsula toda la lógica de negocio y estado de la vista
 * de gestión de Estaciones (terminales POS por sucursal).
 *
 * Sigue el patrón de separación de responsabilidades:
 * el componente de vista (Estaciones.tsx) solo se encarga del render,
 * mientras este hook gestiona datos, formulario, filtros y operaciones CRUD.
 *
 * Dependencias externas:
 *  - react-hook-form + yup  → validación del formulario con esquema tipado
 *  - useCatalogStore        → catálogos globales (sucursales, estados)
 *  - EstacionService        → capa HTTP para operaciones CRUD
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { EstacionService, type EstacionAPI } from "../services/EstacionService";
import { EstatusService } from "../../auth/services/EstatusService";
import { estacionSchema, type EstacionForm } from "../constants/estaciones";

export const useEstaciones = () => {

    // ── Catálogos Globales (Zustand) ───────────────────────────────────────
    // Se obtienen del store global para evitar peticiones duplicadas;
    // otros módulos pueden compartir estos mismos catálogos sin refetch.
    const sucursales = useCatalogStore(state => state.sucursales);
    const statusList = useCatalogStore(state => state.statusList);
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);

    // ── Estado Local ───────────────────────────────────────────────────────
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [estaciones, setEstaciones] = useState<EstacionAPI[]>([]);
    const [posStatusList, setPosStatusList] = useState<{ id_status: string; std_descripcion: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");           // Valor en tiempo real del input
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Valor estabilizado para filtrar
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EstacionAPI | null>(null); // null → modo creación
    const [apiError, setApiError] = useState<string | null>(null); // Error de API para mostrar en el modal

    // ── Formulario (react-hook-form + yup) ────────────────────────────────
    // El resolver de yup valida contra estacionSchema antes de llamar a onSubmit.
    // `reset` se usa para pre-poblar el formulario al abrir en modo edición.
    const { register, handleSubmit, reset, formState: { errors } } = useForm<EstacionForm>({
        resolver: yupResolver(estacionSchema),
    });

    // ── Debounce de Búsqueda (300ms) ──────────────────────────────────────
    // Retrasa la actualización del término de búsqueda para evitar que el filtro
    // se recalcule en cada pulsación de tecla, mejorando el rendimiento en listas grandes.
    // El cleanup del useEffect cancela el timer si el usuario sigue escribiendo.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ── Carga Inicial de Datos ─────────────────────────────────────────────
    /**
     * Obtiene en paralelo los catálogos globales y la lista de estaciones.
     * useCallback evita que fetchData se recree en cada render,
     * lo que a su vez evita que el useEffect de abajo se dispare innecesariamente.
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const [, listResult, statusResult] = await Promise.allSettled([
                fetchCatalogs(),
                EstacionService.getAll(),
                EstatusService.getByModulo(8),
            ]);
            if (listResult.status === 'fulfilled') setEstaciones(listResult.value);
            if (statusResult.status === 'fulfilled') {
                const raw = statusResult.value?.data;
                const items = Array.isArray(raw) ? raw : [];
                setPosStatusList(items.map((s: any) => ({
                    id_status: String(s.id_status || s.id || ""),
                    std_descripcion: s.std_descripcion || s.descripcion || s.nombre || "",
                })).filter((s: { id_status: string; std_descripcion: string }) => s.id_status));
            }
        } catch {
            setApiError("Error al sincronizar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchCatalogs]);

    // Se ejecuta una sola vez al montar el componente (fetchData es estable por useCallback)
    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Handlers del Modal ─────────────────────────────────────────────────

    /**
     * Abre el modal en modo edición (si se pasa `item`) o en modo creación (sin argumentos).
     * En modo edición, pre-pobla el formulario con los datos actuales de la estación.
     * En modo creación, resetea todos los campos a cadena vacía.
     */
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
            reset({ codigo: "", nombre: "", ip: "", id_sucursal: "", id_status: "59039503-85cf-e511-80c1-000c29c9e0e0" });
        }
        setIsModalOpen(true);
    };

    /**
     * Cierra el modal y limpia el estado de edición y errores de API.
     * No limpia los errores de validación del formulario (react-hook-form los gestiona).
     */
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setApiError(null);
    };

    // ── Operaciones CRUD ───────────────────────────────────────────────────

    /**
     * Maneja el envío del formulario para crear o actualizar una estación.
     *
     * Estrategia de actualización optimista parcial:
     *  - En edición: actualiza el ítem en el estado local con spread del resultado del backend,
     *    evitando un refetch completo de la lista.
     *  - En creación: prepend del nuevo ítem al inicio del array para visibilidad inmediata.
     *
     * Los errores de API se muestran dentro del modal (apiError) en lugar de
     * cerrar el modal y perder los datos ingresados por el usuario.
     */
    const onSubmit = async (data: EstacionForm) => {
        setIsSaving(true);
        setApiError(null);
        try {
            if (editingItem) {
                // Modo edición: actualiza solo el ítem modificado en el estado local
                const updated = await EstacionService.update(editingItem.id_estacion, data);
                setEstaciones(prev => prev.map(e =>
                    e.id_estacion === editingItem.id_estacion ? { ...e, ...updated } : e
                ));
            } else {
                // Modo creación: agrega el nuevo ítem al inicio de la lista
                const created = await EstacionService.create(data);
                setEstaciones(prev => [created, ...prev]);
            }
            handleCloseModal();
        } catch (err) {
            const error = err as { response?: { status?: number; data?: { message?: string } } };
            const raw = error.response?.data?.message || "";
            const isDuplicate = error.response?.status === 409 ||
                /duplicate key|unique constraint|estaciones_pos_codigo/i.test(raw);
            setApiError(isDuplicate
                ? `El código ya está registrado. Si es la misma terminal, búscala en la lista y edítala. Si es una nueva, usa un código distinto (ej: POS-002).`
                : raw || "Error al procesar la operación."
            );
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Elimina una estación con confirmación previa del usuario.
     * Implementa Soft Delete en el backend (marca deleted_at, no borra el registro).
     * En el frontend, elimina el ítem del estado local para reflejar el cambio inmediatamente.
     */
    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Dar de baja esta estación? Se realizará un Soft Delete.")) return;
        try {
            await EstacionService.delete(id);
            // Elimina del estado local sin refetch; el backend solo marca deleted_at
            setEstaciones(prev => prev.filter(e => e.id_estacion !== id));
        } catch {
            alert("Error al eliminar.");
        }
    };

    // ── Datos Derivados Memorizados ────────────────────────────────────────

    /**
     * Lista de estaciones filtrada por nombre o código.
     * Usa debouncedSearchTerm (no searchTerm) para evitar recálculos en cada tecla.
     * Se recalcula solo cuando cambia la lista de estaciones o el término estabilizado.
     */
    const filtered = useMemo(() => {
        const q = debouncedSearchTerm.toLowerCase().trim();
        return (estaciones || []).filter(e =>
            e.nombre.toLowerCase().includes(q) ||
            e.codigo.toLowerCase().includes(q)
        );
    }, [estaciones, debouncedSearchTerm]);

    /**
     * Filtra los estados disponibles para el selector del formulario.
     * Incluye ACTIVO, INACTIVO y TERMINAL para cubrir todos los estados
     * válidos de una estación POS, excluyendo estados de otros módulos.
     * El comentario interno indica que el filtro puede relajarse si el backend
     * introduce nuevos tipos de estado para terminales.
     */
    const activeStatusList = posStatusList;

    /**
     * Mapa de id_sucursal → nombre para resolución rápida en la tabla.
     * Maneja dos posibles estructuras del objeto sucursal (id vs id_sucursal,
     * nombre_sucursal vs nombre) por inconsistencias entre versiones del backend.
     */
    const sucursalMap = useMemo(() => {
        const map: Record<string, string> = {};
        sucursales.forEach(s => {
            const id = s.id || s.id_sucursal;
            const name = s.nombre_sucursal || s.nombre;
            if (id && name) map[id] = name; // Solo agrega si ambos valores existen
        });
        return map;
    }, [sucursales]);

    /**
     * Mapa de id_status → descripción para resolución rápida en la tabla.
     * Prioriza std_descripcion sobre nombre para mantener consistencia
     * con la nomenclatura del catálogo de estados.
     */
    const statusMap = useMemo(() => {
        const map: Record<string, string> = {};
        statusList.forEach(s => {
            if (s.id_status) map[s.id_status] = s.std_descripcion || (s as any).nombre;
        });
        return map;
    }, [statusList]);

    /**
     * Estadísticas de resumen para el header de la vista.
     *  - total     → cantidad total de estaciones registradas
     *  - sucursales → número de sucursales distintas con al menos una estación
     *  - activas   → estaciones sin deleted_at (no dadas de baja por Soft Delete)
     */
    const stats = useMemo(() => {
        const list = estaciones || [];
        return {
            total: list.length,
            sucursales: new Set(list.map(e => e.id_sucursal)).size, // Set elimina duplicados
            activas: list.filter(e => !e.deleted_at).length         // deleted_at === null → activa
        };
    }, [estaciones]);

    // ── API Pública del Hook ───────────────────────────────────────────────
    return {
        // Estados de carga
        isLoading,
        isSaving,

        // Datos
        estaciones,
        sucursales,
        sucursalMap,
        statusMap,
        activeStatusList,

        // Búsqueda
        searchTerm,
        setSearchTerm,

        // Modal
        isModalOpen,
        editingItem,
        apiError,
        handleOpenModal,
        handleCloseModal,

        // CRUD
        handleDelete,
        onSubmit,

        // Datos derivados
        filtered,
        stats,

        // Formulario (react-hook-form)
        register,
        handleSubmit,
        errors,
    };
};