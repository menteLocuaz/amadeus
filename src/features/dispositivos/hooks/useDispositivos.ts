/**
 * useDispositivos.ts
 * Custom hook que encapsula toda la lógica de negocio y estado del módulo
 * de gestión de Dispositivos POS (hardware físico vinculado a estaciones).
 *
 * Extiende el patrón de useEstaciones con dos capacidades adicionales:
 *  1. Estado de conexión por dispositivo (ONLINE / OFFLINE / DESCONOCIDO)
 *     gestionado localmente sin persistencia en el backend.
 *  2. Operación de Ping simulada para verificar conectividad de red.
 *
 * Dependencias externas:
 *  - react-hook-form + yup inline  → validación con schema definido en este archivo
 *  - useCatalogStore               → catálogo global de sucursales
 *  - DispositivoService            → CRUD de dispositivos
 *  - EstacionService               → catálogo de estaciones para el selector del modal
 *  - TIPO_META                     → metadatos de tipos de dispositivo (ícono, label, color)
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { DispositivoService, type DispositivoAPI } from "../services/DispositivoService";
import { EstacionService, type EstacionAPI } from "../../estacion/services/EstacionService";
import { TIPO_META } from "../constants/dispositivos";

// ── Tipos del Módulo ───────────────────────────────────────────────────────

/** Tipos de hardware POS soportados por el sistema. */
export type TipoDispositivo = "IMPRESORA" | "DATAFONO" | "KIOSKO" | "MONITOR" | "SCANNER" | "BASCULA" | "VISOR";

/**
 * Estado de conectividad de red del dispositivo.
 * Gestionado solo en el frontend (no persiste en el backend):
 *  - DESCONOCIDO → estado inicial antes del primer ping
 *  - ONLINE / OFFLINE → resultado del último ping ejecutado
 */
export type EstadoConexion = "ONLINE" | "OFFLINE" | "DESCONOCIDO";

/**
 * Extiende DispositivoAPI con el estado de conexión local.
 * El campo `estado` no viene del backend; se agrega al mapear
 * la respuesta de getAll() y se actualiza con handlePing.
 */
export type Dispositivo = DispositivoAPI & { estado: EstadoConexion };

// ── Schema de Validación (yup) ─────────────────────────────────────────────

/**
 * Schema definido inline (no en un archivo de constantes separado)
 * porque es específico de este hook y no se reutiliza en otros módulos.
 *
 * Validaciones notables:
 *  - `tipo`: oneOf con el union type literal para que yup y TypeScript
 *    compartan la misma lista de valores válidos.
 *  - `ip`: regex que valida el formato IPv4 básico (no valida rangos 0-255).
 */
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

/** Tipo inferido del schema para tipado del formulario sin duplicar definiciones. */
export type DispositivoForm = yup.InferType<typeof schema>;

// ── Hook Principal ─────────────────────────────────────────────────────────

export const useDispositivos = () => {

    // ── Catálogos Globales (Zustand) ───────────────────────────────────────
    const sucursales = useCatalogStore(state => state.sucursales);
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);

    // ── Estados de Carga ───────────────────────────────────────────────────
    const [isLoading,    setIsLoading]    = useState(true);
    const [isSaving,     setIsSaving]     = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // ID en eliminación; null si ninguno
    const [isPinging,    setIsPinging]    = useState<string | null>(null); // ID en ping; null si ninguno
    const [apiError,     setApiError]     = useState<string | null>(null);

    // ── Datos y UI ─────────────────────────────────────────────────────────
    const [dispositivos,        setDispositivos]        = useState<Dispositivo[]>([]);
    const [estaciones,          setEstaciones]          = useState<EstacionAPI[]>([]);
    const [searchTerm,          setSearchTerm]          = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Valor estabilizado para el filtro
    const [filterTipo,          setFilterTipo]          = useState<TipoDispositivo | "TODOS">("TODOS");
    const [isModalOpen,         setIsModalOpen]         = useState(false);
    const [editingItem,         setEditingItem]         = useState<Dispositivo | null>(null);

    // ── Formulario (react-hook-form + yup) ────────────────────────────────
    // defaultValues establece "IMPRESORA" como tipo inicial en modo creación
    // para que el selector no quede vacío al abrir el modal por primera vez.
    const { register, handleSubmit, reset, formState: { errors } } = useForm<DispositivoForm>({
        resolver: yupResolver(schema),
        defaultValues: { tipo: "IMPRESORA" }
    });

    // ── Debounce de Búsqueda (300ms) ──────────────────────────────────────
    // Evita recalcular el filtro en cada pulsación de tecla.
    // El cleanup cancela el timer si el usuario sigue escribiendo.
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ── Carga Inicial ──────────────────────────────────────────────────────
    /**
     * Obtiene en paralelo catálogos globales, dispositivos y estaciones.
     * Promise.all minimiza el tiempo de carga total al no serializar las peticiones.
     *
     * Al mapear la respuesta de dispositivos, se agrega `estado: "DESCONOCIDO"`
     * porque el backend no persiste el estado de conexión; es un campo local
     * que solo se actualiza mediante handlePing.
     */
    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            await fetchCatalogs();
            const [list, resEstaciones] = await Promise.all([
                DispositivoService.getAll(),
                EstacionService.getAll()
            ]);
            setEstaciones(resEstaciones);
            // Inicializa el estado de conexión como DESCONOCIDO para todos los dispositivos
            setDispositivos(list.map(d => ({ ...d, estado: "DESCONOCIDO" as EstadoConexion })));
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? "Error al cargar datos.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchCatalogs]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Handlers del Modal ─────────────────────────────────────────────────

    /**
     * Abre el modal en modo edición o creación.
     *
     * En modo creación, `id_estacion` se inicializa como cadena vacía si hay
     * estaciones disponibles, o como `undefined` si no las hay. Esto evita
     * que yup valide un campo que el usuario no puede completar aún.
     */
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
                nombre:      "",
                tipo:        "IMPRESORA",
                ip:          "",
                // undefined si no hay estaciones: evita validación de campo no completable
                id_estacion: (estaciones || []).length > 0 ? "" : undefined
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setApiError(null);
    };

    // ── Guardar (Crear o Editar) ───────────────────────────────────────────

    /**
     * Construye el DTO explícitamente (sin spread de `data`) para evitar
     * enviar campos extra al backend si el schema yup evoluciona.
     *
     * En modo edición, preserva el `estado` de conexión local del dispositivo
     * existente con `estado: d.estado`, ya que el backend no conoce este campo.
     *
     * En modo creación, el nuevo dispositivo inicia con estado "DESCONOCIDO"
     * y se agrega al inicio del array (prepend) para visibilidad inmediata.
     */
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
                        ? { ...d, ...updated, estado: d.estado } // Preserva el estado de conexión local
                        : d
                ));
            } else {
                const created = await DispositivoService.create(dto as any);
                // Prepend: el nuevo dispositivo aparece primero en la tabla
                setDispositivos(prev => [{ ...created, estado: "DESCONOCIDO" as EstadoConexion }, ...prev]);
            }
            handleCloseModal();
        } catch (err: any) {
            setApiError(err?.response?.data?.message ?? "Error al guardar el dispositivo.");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Eliminar ───────────────────────────────────────────────────────────

    /**
     * A diferencia de useEstaciones (Soft Delete), este módulo realiza
     * un Hard Delete: el dispositivo se elimina permanentemente del backend.
     *
     * `isDeletingId` almacena el ID específico en eliminación (no un booleano)
     * para que DeviceTable pueda mostrar el loader solo en la fila afectada,
     * sin bloquear las demás filas de la tabla.
     */
    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Eliminar este dispositivo definitivamente?")) return;
        setIsDeletingId(id);
        try {
            await DispositivoService.delete(id);
            setDispositivos(prev => prev.filter(d => d.id_dispositivo !== id));
        } catch (err: any) {
            alert(err?.response?.data?.message ?? "Error al eliminar el dispositivo.");
        } finally {
            setIsDeletingId(null); // Siempre limpia el ID, incluso si hay error
        }
    };

    // ── Ping de Conectividad ───────────────────────────────────────────────

    /**
     * Simula una verificación de conectividad de red para el dispositivo.
     * Implementación actual: delay de 1.5s + resultado aleatorio (70% ONLINE).
     *
     * TODO: Reemplazar con una llamada real al backend cuando el endpoint
     * de ping esté disponible (ej: GET /dispositivos/{id}/ping).
     *
     * El resultado actualiza solo el campo `estado` del dispositivo afectado,
     * preservando todos los demás campos con el spread `...d`.
     */
    const handlePing = async (id: string) => {
        setIsPinging(id);
        // Simulación de latencia de red
        await new Promise(r => setTimeout(r, 1500));
        setDispositivos(prev => prev.map(d =>
            d.id_dispositivo === id
                ? { ...d, estado: Math.random() > 0.3 ? "ONLINE" : "OFFLINE" }
                : d
        ));
        setIsPinging(null);
    };

    // ── Datos Derivados Memorizados ────────────────────────────────────────

    /**
     * Lista filtrada por término de búsqueda y tipo seleccionado.
     * La búsqueda incluye el nombre de la estación vinculada (no solo
     * los campos del dispositivo) para que el usuario pueda buscar
     * por ubicación sin conocer el nombre exacto del dispositivo.
     */
    const filtered = useMemo(() => {
        const q = debouncedSearchTerm.toLowerCase().trim();
        const list = Array.isArray(dispositivos) ? dispositivos : [];
        const ests = Array.isArray(estaciones) ? estaciones : [];

        return list.filter(d => {
            // Resuelve el nombre de la estación para incluirlo en la búsqueda
            const estacionNombre = ests.find(e => e.id_estacion === d.id_estacion)?.nombre || "";
            const matchSearch = d.nombre.toLowerCase().includes(q) ||
                                d.ip.includes(q) ||
                                estacionNombre.toLowerCase().includes(q);
            const matchTipo = filterTipo === "TODOS" || d.tipo === filterTipo;
            return matchSearch && matchTipo;
        });
    }, [dispositivos, estaciones, debouncedSearchTerm, filterTipo]);

    /**
     * Estadísticas por tipo de dispositivo para las tarjetas de resumen.
     * Itera sobre TIPO_META (no sobre los dispositivos) para garantizar
     * que todos los tipos aparezcan en las tarjetas, incluso si tienen count 0.
     * Incluye metadatos de presentación (ícono, label, color) desde TIPO_META.
     */
    const statsPerTipo = useMemo(() => {
        const list = Array.isArray(dispositivos) ? dispositivos : [];
        return (Object.keys(TIPO_META) as TipoDispositivo[]).map(tipo => ({
            tipo,
            count:  list.filter(d => d.tipo === tipo).length,
            online: list.filter(d => d.tipo === tipo && d.estado === "ONLINE").length,
            ...TIPO_META[tipo], // Spread de ícono, label y color del tipo
        }));
    }, [dispositivos]);

    /**
     * Mapa id_sucursal → nombre para resolución rápida en DeviceTable.
     * Maneja inconsistencias de campos entre versiones del backend
     * (id vs id_sucursal, nombre_sucursal vs nombre).
     */
    const sucursalMap = useMemo(() => {
        const map: Record<string, string> = {};
        (sucursales || []).forEach(s => {
            const id = s.id || s.id_sucursal;
            const name = s.nombre_sucursal || s.nombre;
            if (id && name) map[id] = name;
        });
        return map;
    }, [sucursales]);

    /**
     * Mapa id_estacion → { nombre, id_sucursal } para resolución en DeviceTable.
     * Incluye id_sucursal para que la tabla pueda mostrar la sucursal de la
     * estación sin necesidad de un JOIN adicional o una segunda petición.
     */
    const estacionMap = useMemo(() => {
        const map: Record<string, { nombre: string; id_sucursal: string }> = {};
        (estaciones || []).forEach(e => {
            map[e.id_estacion] = { nombre: e.nombre, id_sucursal: e.id_sucursal };
        });
        return map;
    }, [estaciones]);

    // ── API Pública del Hook ───────────────────────────────────────────────
    return {
        // Estados de carga
        isLoading,
        isSaving,
        isDeletingId,   // ID específico en eliminación (no booleano) para loader por fila
        isPinging,      // ID específico en ping (no booleano) para loader por fila

        // Datos
        apiError,
        dispositivos,
        estaciones,
        sucursalMap,
        estacionMap,

        // Búsqueda y filtros
        searchTerm,
        filterTipo,
        setSearchTerm,
        setFilterTipo,

        // Modal
        isModalOpen,
        editingItem,
        handleOpenModal,
        handleCloseModal,

        // CRUD y acciones
        handleDelete,
        handlePing,
        onSubmit,

        // Datos derivados
        filtered,
        statsPerTipo,

        // Formulario (react-hook-form)
        errors,
        register,
        handleSubmit,
    };
};