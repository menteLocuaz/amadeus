import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DispositivoService, type DispositivoAPI } from "../services/DispositivoService";
import { EstacionService, type EstacionAPI } from "../../estacion/services/EstacionService";
import { TIPO_META } from "../constants/dispositivos";

/* ═══════════════════════════════════════════════════════════
   TIPOS
═══════════════════════════════════════════════════════════ */
export type TipoDispositivo = "IMPRESORA" | "DATAFONO" | "KIOSKO" | "MONITOR";
export type EstadoConexion  = "ONLINE" | "OFFLINE" | "DESCONOCIDO";

export type Dispositivo = DispositivoAPI & { estado: EstadoConexion };

/* ═══════════════════════════════════════════════════════════
   SCHEMA YUP
═══════════════════════════════════════════════════════════ */
const schema = yup.object({
    nombre:      yup.string().required("El nombre es requerido").min(3),
    tipo:        yup.string().oneOf(["IMPRESORA","DATAFONO","KIOSKO","MONITOR"] as const).required("Selecciona un tipo"),
    ip:          yup.string()
                    .required("La dirección IP es requerida")
                    .matches(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato inválido (ej: 192.168.1.50)"),
    id_estacion: yup.string().required("Vínculo con Estación POS requerido"),
});

export type DispositivoForm = yup.InferType<typeof schema>;

export const useDispositivos = () => {
    /* ── Estado de carga ── */
    const [isLoading,    setIsLoading]    = useState(true);
    const [isSaving,     setIsSaving]     = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [isPinging,    setIsPinging]    = useState<string | null>(null);
    const [apiError,     setApiError]     = useState<string | null>(null);

    /* ── Datos y UI ── */
    const [dispositivos,  setDispositivos]  = useState<Dispositivo[]>([]);
    const [estaciones,    setEstaciones]    = useState<EstacionAPI[]>([]);
    const [searchTerm,    setSearchTerm]    = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterTipo,    setFilterTipo]    = useState<TipoDispositivo | "TODOS">("TODOS");

    /* ── Debounce de Búsqueda ── */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const [isModalOpen,   setIsModalOpen]   = useState(false);
    const [editingItem,   setEditingItem]   = useState<Dispositivo | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<DispositivoForm>({
        resolver: yupResolver(schema),
        defaultValues: { tipo: "IMPRESORA" }
    });

    /* ── Carga inicial desde la API ── */
    const fetchAll = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const [list, resEstaciones] = await Promise.all([
                DispositivoService.getAll(),
                EstacionService.getAll()
            ]);
            setEstaciones(resEstaciones);
            setDispositivos(list.map(d => ({ ...d, estado: "DESCONOCIDO" as EstadoConexion })));
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? "Error al cargar datos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    /* ── Abrir modal ── */
    const handleOpenModal = (item?: Dispositivo) => {
        setApiError(null);
        if (item) {
            setEditingItem(item);
            reset({
                nombre:      item.nombre,
                tipo:        item.tipo as TipoDispositivo,
                ip:          item.ip,
                id_estacion: item.id_estacion
            });
        } else {
            setEditingItem(null);
            reset({ 
                nombre: "", 
                tipo: "IMPRESORA", 
                ip: "", 
                id_estacion: estaciones.length > 0 ? "" : undefined 
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { 
        setIsModalOpen(false); 
        setEditingItem(null); 
        setApiError(null); 
    };

    /* ── Guardar (crear o editar) ── */
    const onSubmit = async (data: DispositivoForm) => {
        setIsSaving(true);
        setApiError(null);
        try {
            const dto = {
                nombre:      data.nombre,
                tipo:        data.tipo as TipoDispositivo,
                ip:          data.ip,
                id_estacion: data.id_estacion,
            };

            if (editingItem) {
                const updated = await DispositivoService.update(editingItem.id_dispositivo, dto);
                setDispositivos(prev => prev.map(d =>
                    d.id_dispositivo === editingItem.id_dispositivo
                        ? { ...d, ...updated, estado: d.estado }
                        : d
                ));
            } else {
                const created = await DispositivoService.create(dto as any);
                setDispositivos(prev => [{ ...created, estado: "DESCONOCIDO" as EstadoConexion }, ...prev]);
            }
            handleCloseModal();
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? "Error al guardar el dispositivo.");
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Eliminar ── */
    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Eliminar este dispositivo definitivamente?")) return;
        setIsDeletingId(id);
        try {
            await DispositivoService.delete(id);
            setDispositivos(prev => prev.filter(d => d.id_dispositivo !== id));
        } catch (err: any) {
            alert(err?.response?.data?.message ?? "Error al eliminar el dispositivo.");
        } finally {
            setIsDeletingId(null);
        }
    };

    /* ── Ping ── */
    const handlePing = async (id: string) => {
        setIsPinging(id);
        await new Promise(r => setTimeout(r, 1500));
        setDispositivos(prev => prev.map(d =>
            d.id_dispositivo === id
                ? { ...d, estado: Math.random() > 0.3 ? "ONLINE" : "OFFLINE" }
                : d
        ));
        setIsPinging(null);
    };

    /* ── Filtros Memorizados ── */
    const filtered = useMemo(() => {
        const q = debouncedSearchTerm.toLowerCase().trim();
        return dispositivos.filter(d => {
            const estacionNombre = estaciones.find(e => e.id_estacion === d.id_estacion)?.nombre || "";
            const matchSearch = d.nombre.toLowerCase().includes(q) ||
                                d.ip.includes(q) ||
                                estacionNombre.toLowerCase().includes(q);
            const matchTipo   = filterTipo === "TODOS" || d.tipo === filterTipo;
            return matchSearch && matchTipo;
        });
    }, [dispositivos, estaciones, debouncedSearchTerm, filterTipo]);

    const statsPerTipo = useMemo(() => {
        return (Object.keys(TIPO_META) as TipoDispositivo[]).map(tipo => ({
            tipo,
            count:  dispositivos.filter(d => d.tipo === tipo).length,
            online: dispositivos.filter(d => d.tipo === tipo && d.estado === "ONLINE").length,
            ...TIPO_META[tipo],
        }));
    }, [dispositivos]);

    return {
        // States
        isLoading,
        isSaving,
        isDeletingId,
        isPinging,
        apiError,
        dispositivos,
        estaciones,
        searchTerm,
        filterTipo,
        isModalOpen,
        editingItem,
        errors,
        
        // Derived
        filtered,
        statsPerTipo,
        
        // Setters
        setSearchTerm,
        setFilterTipo,
        
        // Handlers
        handleOpenModal,
        handleCloseModal,
        handleDelete,
        handlePing,
        onSubmit,
        
        // Form
        register,
        handleSubmit
    };
};
