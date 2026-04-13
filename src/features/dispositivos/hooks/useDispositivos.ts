/**
 * useDispositivos.ts - Refactorizado con TanStack Query
 * 
 * Beneficios:
 * 1. Caching automático: No se recargan datos innecesariamente.
 * 2. Sincronización: La tabla se actualiza sola tras crear/editar/borrar.
 * 3. Código Limpio: Eliminamos ~100 líneas de gestión manual de estados.
 */

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { DispositivoService, type DispositivoAPI } from "../services/DispositivoService";
import { EstacionService } from "../../estacion/services/EstacionService";
import { TIPO_META } from "../constants/dispositivos";

// --- Tipos y Esquemas ---
export type TipoDispositivo = "IMPRESORA" | "DATAFONO" | "KIOSKO" | "MONITOR" | "SCANNER" | "BASCULA" | "VISOR";
export type EstadoConexion = "ONLINE" | "OFFLINE" | "DESCONOCIDO";
export type Dispositivo = DispositivoAPI & { estado: EstadoConexion };

const schema = yup.object({
    nombre: yup.string().required("El nombre es requerido").min(3),
    tipo: yup.string()
        .oneOf(["IMPRESORA", "DATAFONO", "KIOSKO", "MONITOR", "SCANNER", "BASCULA", "VISOR"] as const)
        .required("Selecciona un tipo"),
    ip: yup.string()
        .required("La dirección IP es requerida")
        .matches(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato inválido (ej: 192.168.1.50)"),
    id_estacion: yup.string().required("Vínculo con Estación POS requerido"),
});

export type DispositivoForm = yup.InferType<typeof schema>;

export const useDispositivos = () => {
    const queryClient = useQueryClient();
    
    // --- Estados de UI locales ---
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterTipo, setFilterTipo] = useState<TipoDispositivo | "TODOS">("TODOS");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Dispositivo | null>(null);
    const [isPinging, setIsPinging] = useState<string | null>(null);
    const [pingResults, setPingResults] = useState<Record<string, EstadoConexion>>({});

    // --- Catálogos (Zustand) ---
    const sucursales   = useCatalogStore(state => state.sucursales);
    const statusList   = useCatalogStore(state => state.statusList);
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);

    // ID del estatus "Activo" para asignarlo al crear/editar
    const activoStatusId = useMemo(
        () => statusList.find(s => s.std_descripcion?.toLowerCase() === "activo")?.id_status ?? "",
        [statusList]
    );

    // Debounce manual para la búsqueda
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // --- Queries (TanStack Query) ---
    
    // Dispositivos
    const { data: dispositivosRaw = [], isLoading: isLoadingDisp, error: errorDisp } = useQuery({
        queryKey: ['dispositivos'],
        queryFn: DispositivoService.getAll,
        staleTime: 1000 * 60 * 5, // 5 min
    });

    // Estaciones (Catálogo local del módulo)
    const { data: estaciones = [], isLoading: isLoadingEst } = useQuery({
        queryKey: ['estaciones'],
        queryFn: EstacionService.getAll,
    });

    // Cargar catálogos globales de sucursales si no están
    useEffect(() => { if (sucursales.length === 0) fetchCatalogs(); }, [sucursales, fetchCatalogs]);

    // --- Mutations ---

    // Crear / Editar
    const saveMutation = useMutation({
        mutationFn: (data: any) => editingItem 
            ? DispositivoService.update(editingItem.id_dispositivo, data)
            : DispositivoService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dispositivos'] });
            toast.success(editingItem ? "Dispositivo actualizado" : "Dispositivo creado");
            handleCloseModal();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? "Error al guardar");
        }
    });

    // Eliminar
    const deleteMutation = useMutation({
        mutationFn: DispositivoService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dispositivos'] });
            toast.success("Dispositivo eliminado");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message ?? "Error al eliminar");
        }
    });

    // --- Formulario ---
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<DispositivoForm>({
        resolver: yupResolver(schema),
        defaultValues: { tipo: "IMPRESORA" }
    });

    // --- Handlers ---
    const handleOpenModal = (item?: Dispositivo) => {
        if (item) {
            setEditingItem(item);
            reset({
                nombre: item.nombre,
                tipo: item.tipo_dispositivo as TipoDispositivo,
                ip: (item.ip ?? (item.configuracion?.ip as string) ?? ""),
                id_estacion: item.id_estacion
            });
        } else {
            setEditingItem(null);
            reset({ nombre: "", tipo: "IMPRESORA", ip: "", id_estacion: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handlePing = async (id: string) => {
        setIsPinging(id);
        await new Promise(r => setTimeout(r, 1200)); // Simulación
        const result: EstadoConexion = Math.random() > 0.3 ? "ONLINE" : "OFFLINE";
        setPingResults(prev => ({ ...prev, [id]: result }));
        setIsPinging(null);
    };

    // --- Datos Derivados (Memoizados) ---

    // Lista de dispositivos con estado de ping local
    const dispositivos = useMemo(() => 
        dispositivosRaw.map(d => ({
            ...d,
            estado: pingResults[d.id_dispositivo] || "DESCONOCIDO"
        })), [dispositivosRaw, pingResults]);

    const filtered = useMemo(() => {
        const q = debouncedSearch.toLowerCase().trim();
        return dispositivos.filter(d => {
            const ip = d.ip ?? (d.configuracion?.ip as string) ?? "";
            const matchSearch = d.nombre.toLowerCase().includes(q) || ip.includes(q);
            const matchTipo = filterTipo === "TODOS" || d.tipo_dispositivo === filterTipo;
            return matchSearch && matchTipo;
        });
    }, [dispositivos, debouncedSearch, filterTipo]);

    const statsPerTipo = useMemo(() => {
        return (Object.keys(TIPO_META) as TipoDispositivo[]).map(tipo => ({
            tipo,
            count: dispositivos.filter(d => d.tipo_dispositivo === tipo).length,
            online: dispositivos.filter(d => d.tipo_dispositivo === tipo && d.estado === "ONLINE").length,
            ...TIPO_META[tipo],
        }));
    }, [dispositivos]);

    const sucursalMap = useMemo(() => {
        const map: Record<string, string> = {};
        sucursales.forEach(s => map[s.id || s.id_sucursal] = s.nombre_sucursal || s.nombre);
        return map;
    }, [sucursales]);

    const estacionMap = useMemo(() => {
        const map: Record<string, { nombre: string; id_sucursal: string }> = {};
        estaciones.forEach(e => map[e.id_estacion] = { nombre: e.nombre, id_sucursal: e.id_sucursal });
        return map;
    }, [estaciones]);

    return {
        // Estados
        isLoading: isLoadingDisp || isLoadingEst,
        isSaving: saveMutation.isPending,
        isDeletingId: deleteMutation.isPending ? deleteMutation.variables : null,
        isPinging,
        apiError: errorDisp ? (errorDisp as any).message : null,

        // Datos
        dispositivos,
        estaciones,
        sucursalMap,
        estacionMap,
        filtered,
        statsPerTipo,

        // Filtros
        searchTerm,
        filterTipo,
        setSearchTerm,
        setFilterTipo,

        // Modal y CRUD
        isModalOpen,
        editingItem,
        handleOpenModal,
        handleCloseModal,
        handleDelete: deleteMutation.mutate,
        handlePing,
        onSubmit: (data: DispositivoForm) => saveMutation.mutate({
            nombre:           data.nombre,
            tipo_dispositivo: data.tipo as TipoDispositivo,
            configuracion:    { ip: data.ip, puerto: 9100 },
            id_estacion:      data.id_estacion,
            id_status:        activoStatusId,
        }),

        // Form
        register,
        handleSubmit,
        errors,
        watch
    };
};
