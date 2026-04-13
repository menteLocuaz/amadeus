import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { dispositivoSchema, type DispositivoForm } from "../constants/validations";
import { TIPO_META, type TipoDispositivo } from "../constants/dispositivos";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";

/**
 * Hook Especializado: Gestión de Interfaz (Filtros, Modales, Ping)
 * Se encarga del estado visual y volátil (UI State).
 */
export const useDispositivosUI = (dispositivosRaw: any[], estaciones: any[]) => {
    // --- Estado de UI ---
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterTipo, setFilterTipo] = useState<any>("TODOS");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isPinging, setIsPinging] = useState<string | null>(null);
    const [pingResults, setPingResults] = useState<Record<string, string>>({});

    // --- Catálogos (Zustand) ---
    const sucursales = useCatalogStore(state => state.sucursales);
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // --- Formulario (Configuración base) ---
    const methods = useForm<DispositivoForm>({
        resolver: yupResolver(dispositivoSchema),
        defaultValues: { tipo: "IMPRESORA", id_status: "" }
    });

    // --- Handlers ---
    const openModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            // Al editar, mapea tipo_dispositivo → tipo para que coincida con el campo del form
            methods.reset({
                nombre:      item.nombre,
                tipo:        item.tipo_dispositivo,
                ip:          item.ip ?? (item.configuracion?.ip as string) ?? "",
                id_estacion: item.id_estacion,
                id_status:   item.id_status,
            });
        } else {
            setEditingItem(null);
            methods.reset({ nombre: "", tipo: "IMPRESORA", ip: "", id_estacion: "", id_status: "" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const ping = async (id: string) => {
        setIsPinging(id);
        await new Promise(r => setTimeout(r, 1200));
        setPingResults(prev => ({ ...prev, [id]: Math.random() > 0.3 ? "ONLINE" : "OFFLINE" }));
        setIsPinging(null);
    };

    // --- Datos Derivados (Filtros y Mapas) ---
    const dispositivos = useMemo(() => 
        dispositivosRaw.map(d => ({ ...d, estado: pingResults[d.id_dispositivo] || "DESCONOCIDO" })),
        [dispositivosRaw, pingResults]
    );

    const filtered = useMemo(() => {
        const q = debouncedSearch.toLowerCase().trim();
        return dispositivos.filter(d => {
            const ip = d.ip ?? (d.configuracion?.ip as string) ?? "";
            const matchSearch = d.nombre.toLowerCase().includes(q) || ip.includes(q);
            const matchTipo = filterTipo === "TODOS" || d.tipo_dispositivo === filterTipo;
            return matchSearch && matchTipo;
        });
    }, [dispositivos, debouncedSearch, filterTipo]);

    const stats = useMemo(() =>
        (Object.keys(TIPO_META) as TipoDispositivo[]).map(tipo => ({
            tipo,
            count: dispositivos.filter((d: any) => d.tipo_dispositivo === tipo).length,
            ...TIPO_META[tipo as TipoDispositivo],
        })), [dispositivos]
    );

    const sucursalMap = useMemo(() => {
        const map: any = {};
        sucursales.forEach(s => map[s.id || s.id_sucursal] = s.nombre_sucursal || s.nombre);
        return map;
    }, [sucursales]);

    const estacionMap = useMemo(() => {
        const map: any = {};
        estaciones.forEach(e => map[e.id_estacion] = { nombre: e.nombre, id_sucursal: e.id_sucursal });
        return map;
    }, [estaciones]);

    return {
        methods,
        ui: {
            searchTerm, setSearchTerm,
            filterTipo, setFilterTipo,
            isModalOpen, openModal, closeModal,
            editingItem,
            isPinging, ping,
            dispositivos, // Lista completa con estados de ping
            filtered, stats,
            sucursalMap, estacionMap,
            fetchCatalogs
        }
    };
};
