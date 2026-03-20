import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { UsuarioService, type UsuarioAPI } from "../services/UsuarioService";
import { usuarioSchema, type UsuarioForm } from "../constants/usuarios";
import { SucursalService, type SucursalAPI } from "../../sucursal/services/SucursalService";
import { AuthService, type RolItem } from "../../auth/services/AuthService";

export const useUsuarios = () => {
    const statusList = useCatalogStore(state => state.statusList);
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [usuarios, setUsuarios] = useState<UsuarioAPI[]>([]);
    const [sucursales, setSucursales] = useState<SucursalAPI[]>([]);
    const [roles, setRoles] = useState<RolItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<UsuarioAPI | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<UsuarioForm>({
        resolver: yupResolver(usuarioSchema) as any,
        context: { isEditing: !!editingItem }
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
            const [uList, sList, rRes] = await Promise.all([
                UsuarioService.getAll(),
                SucursalService.getAll(),
                AuthService.getRoles()
            ]);
            setUsuarios(uList);
            setSucursales(sList);
            setRoles(rRes.data || []);
        } catch (err) {
            console.error("Error al sincronizar datos:", err);
            setApiError("Error al sincronizar con el servidor.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchCatalogs]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (item?: UsuarioAPI) => {
        setApiError(null);
        if (item) {
            setEditingItem(item);
            reset({
                id_sucursal: item.id_sucursal,
                id_rol: item.id_rol,
                email: item.email,
                usu_nombre: item.usu_nombre,
                usu_dni: item.usu_dni,
                usu_telefono: item.usu_telefono || "",
                password: "", // No mostrar password al editar
                id_status: item.id_status,
            });
        } else {
            setEditingItem(null);
            reset({
                id_sucursal: "",
                id_rol: "",
                email: "",
                usu_nombre: "",
                usu_dni: "",
                usu_telefono: "",
                password: "",
                id_status: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setApiError(null);
    };

    const onSubmit = async (data: UsuarioForm) => {
        setIsSaving(true);
        setApiError(null);
        try {
            // Limpiar password si está vacío en edición
            const payload = { ...data };
            if (editingItem && !payload.password) {
                delete payload.password;
            }

            if (editingItem) {
                const updated = await UsuarioService.update(editingItem.id_usuario, payload as any);
                setUsuarios(prev => prev.map(u =>
                    u.id_usuario === editingItem.id_usuario ? { ...u, ...updated } : u
                ));
            } else {
                const created = await UsuarioService.create(payload as any);
                setUsuarios(prev => [created, ...prev]);
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
        if (!window.confirm("¿Dar de baja este usuario?")) return;
        try {
            await UsuarioService.delete(id);
            setUsuarios(prev => prev.filter(u => u.id_usuario !== id));
        } catch {
            alert("Error al eliminar.");
        }
    };

    /* ── Datos Derivados ── */
    const filtered = useMemo(() => {
        const q = debouncedSearchTerm.toLowerCase().trim();
        return (usuarios || []).filter(u =>
            u.usu_nombre.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.usu_dni.includes(q)
        );
    }, [usuarios, debouncedSearchTerm]);

    const sucursalMap = useMemo(() => {
        const map: Record<string, string> = {};
        sucursales.forEach(s => { map[s.id_sucursal] = s.nombre_sucursal; });
        return map;
    }, [sucursales]);

    const rolMap = useMemo(() => {
        const map: Record<string, string> = {};
        roles.forEach(r => { map[r.id_rol] = r.nombre_rol; });
        return map;
    }, [roles]);

    const statusMap = useMemo(() => {
        const map: Record<string, string> = {};
        statusList.forEach(s => {
            if (s.id_status) map[s.id_status] = s.std_descripcion || s.nombre;
        });
        return map;
    }, [statusList]);

    return {
        isLoading,
        isSaving,
        usuarios,
        sucursales,
        roles,
        searchTerm,
        isModalOpen,
        editingItem,
        apiError,
        statusList,
        statusMap,
        sucursalMap,
        rolMap,
        errors,
        filtered,
        setSearchTerm,
        handleOpenModal,
        handleCloseModal,
        handleDelete,
        onSubmit,
        register,
        handleSubmit
    };
};
