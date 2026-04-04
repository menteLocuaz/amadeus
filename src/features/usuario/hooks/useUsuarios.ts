import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";
import { useShallow } from "zustand/react/shallow";
import { useCatalogStore, selectUserStatusList, selectStatusMap } from "../../../shared/store/useCatalogStore";
import { useUsuarioStore } from "../store/useUsuarioStore";
import { UsuarioService, type UsuarioAPI } from "../services/UsuarioService";
import { AuthService, type RolItem } from "../../auth/services/AuthService";
import { usuarioSchema, type UsuarioForm } from "../constants/usuarios";

export const useUsuarios = () => {
    // ── Stores ────────────────────────────────────────────────────────────────
    const fetchCatalogs = useCatalogStore(state => state.fetchCatalogs);
    const statusList    = useCatalogStore(useShallow(selectUserStatusList));
    const statusMap     = useCatalogStore(useShallow(selectStatusMap));
    const globalSucursales = useCatalogStore(state => state.sucursales);

    const {
        usuarios, isLoading, setLoading, setUsuarios, 
        filters, setFilters, resetFilters, 
        currentPage, setPage, pageSize, getFilteredUsuarios
    } = useUsuarioStore();

    // ── Local UI State ────────────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<UsuarioAPI | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [roles, setRoles] = useState<RolItem[]>([]);

    // ── Formulario ────────────────────────────────────────────────────────────
    const {
        register, handleSubmit, reset, control,
        formState: { errors },
        watch,
        setValue
    } = useForm<UsuarioForm>({
        resolver: yupResolver(usuarioSchema) as any,
        context: { isEditing: !!editingItem },
    });

    // ── Fetching ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            await fetchCatalogs(true);
            const [uList, rRes] = await Promise.all([
                UsuarioService.getAll(),
                AuthService.getRoles(),
            ]);
            setUsuarios(uList);
            setRoles(rRes.data ?? []);
        } catch (err) {
            console.error("Error fetching data:", err);
            Swal.fire("Error", "No se pudo sincronizar con el servidor.", "error");
        } finally {
            setLoading(false);
        }
    }, [fetchCatalogs, setLoading, setUsuarios]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Derivados ─────────────────────────────────────────────────────────────
    const filtered = useMemo(() => getFilteredUsuarios(), [getFilteredUsuarios, usuarios, filters]);
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const sucursalMap = useMemo(() => {
        const map: Record<string, string> = {};
        globalSucursales.forEach((s: any) => { map[s.id_sucursal] = s.nombre_sucursal; });
        return map;
    }, [globalSucursales]);

    const rolMap = useMemo(() => {
        const map: Record<string, string> = {};
        roles.forEach(r => { map[r.id_rol] = r.nombre_rol; });
        return map;
    }, [roles]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingItem(null);
        reset({ 
            nombre: "", apellido: "", email: "", username: "", 
            usu_telefono: "", password: "", confirmPassword: "", 
            id_sucursal: "", id_rol: "", id_status: "1" 
        });
        setViewMode('form');
    };

    const openEdit = (item: UsuarioAPI) => {
        setEditingItem(item);
        // Assuming nombre might contain full name if apellido is not separated in API yet
        // In Image 2 they are separate. Let's try to split or just use what we have.
        const nameParts = item.nombre.split(" ");
        reset({
            nombre: nameParts[0] || "",
            apellido: nameParts.slice(1).join(" ") || "",
            email: item.email || item.correo || "",
            username: item.username,
            usu_dni: item.usu_dni || "",
            usu_telefono: item.usu_telefono ?? "",
            usu_tarjeta_nfc: item.usu_tarjeta_nfc || "",
            usu_pin_pos: item.usu_pin_pos || "",
            nombre_ticket: item.nombre_ticket || "",
            sucursales_acceso: item.sucursales_acceso || [],
            password: "",
            confirmPassword: "",
            id_sucursal: item.id_sucursal,
            id_rol: item.id_rol,
            id_status: item.id_status
        });
        setViewMode('form');
    };

    const goBack = () => {
        if (isSaving) return;
        setViewMode('list');
        setEditingItem(null);
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción dará de baja al usuario en el sistema.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#7c3aed",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                await UsuarioService.delete(id);
                setUsuarios(usuarios.filter(u => u.id_usuario !== id));
                Swal.fire("Eliminado", "El usuario ha sido eliminado correctamente.", "success");
            } catch (err) {
                Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
            }
        }
    };

    const onSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            // Map inputs to API requirements
            const payload = { 
                ...data, 
                usu_nombre: `${data.nombre} ${data.apellido}`.trim()
            };

            // Remove internal/confirm fields
            delete payload.confirmPassword;
            if (editingItem && !payload.password) delete payload.password;

            if (editingItem) {
                const updated = await UsuarioService.update(editingItem.id_usuario, payload);
                // Ensure we update with the returned data or keep the expected structure
                setUsuarios(usuarios.map(u => u.id_usuario === editingItem.id_usuario ? { ...u, ...updated, nombre: updated.usu_nombre || updated.nombre } : u));
                Swal.fire("¡Éxito!", "Usuario actualizado correctamente.", "success");
            } else {
                const created = await UsuarioService.create(payload);
                // The API might return usu_nombre, we map it to 'nombre' for UI consistency if needed
                const newUser = { ...created, nombre: created.usu_nombre || created.nombre };
                setUsuarios([newUser, ...usuarios]);
                Swal.fire("¡Éxito!", "Usuario creado correctamente.", "success");
            }
            setViewMode('list');
        } catch (err: any) {
            Swal.fire("Error", err?.response?.data?.message ?? "Error en la operación.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        // Data & State
        usuarios, paginated, filteredCount: filtered.length,
        isLoading, isSaving, viewMode, editingItem,
        statusList, sucursales: globalSucursales, roles,
        statusMap, sucursalMap, rolMap,
        
        // Filters & Pagination
        filters, setFilters, resetFilters,
        currentPage, totalPages, setPage,
        
        // Form
        register, handleSubmit, control, errors, watch, setValue,
        
        // Actions
        openCreate, openEdit, goBack, handleDelete, onSubmit
    };
};
