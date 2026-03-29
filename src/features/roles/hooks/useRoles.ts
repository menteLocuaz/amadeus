// ─── Roles Feature — useRoles Hook ────────────────────────────────────────────
// Encapsula TODA la lógica de estado y efectos secundarios de la página.
// El componente de UI sólo llama funciones y renderiza lo que este hook devuelve.

import { useCallback, useEffect, useState } from "react";
import { AuthService, type SucursalItem } from "../../../features/auth/services/AuthService";
import { EstatusService }                 from "../../../features/auth/services/EstatusService";
import { RolService, type RolItem }       from "../services/RolService";
import { extractEstatusList }             from "../services/estatusHelpers";
import { EMPTY_FORM, type EstatusItem, type RolFormData, type RolFormErrors } from "../types";

// ─── Sub-estado del modal ──────────────────────────────────────────────────────

interface ModalState {
    open:      boolean;
    isEditing: boolean;
    editId:    string | null;
    form:      RolFormData;
    errors:    RolFormErrors;
}

const INITIAL_MODAL: ModalState = {
    open:      false,
    isEditing: false,
    editId:    null,
    form:      EMPTY_FORM,
    errors:    {},
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useRoles = () => {
    // ── Datos del servidor ───────────────────────────────────────────────────
    const [roles,        setRoles]        = useState<RolItem[]>([]);
    const [sucursales,   setSucursales]   = useState<SucursalItem[]>([]);
    const [estatusList,  setEstatusList]  = useState<EstatusItem[]>([]);

    // ── Estados de carga independientes ─────────────────────────────────────
    const [isLoading,    setIsLoading]    = useState(false);          // carga inicial
    const [isSaving,     setIsSaving]     = useState(false);          // crear / actualizar
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // id eliminándose

    // ── Estado del modal (forma + errores + modo edición) ────────────────────
    const [modal, setModal] = useState<ModalState>(INITIAL_MODAL);

    // ── Carga inicial ────────────────────────────────────────────────────────

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);

            const [roles, resSucursales, resCatalogo] = await Promise.all([
                RolService.getAll(),
                AuthService.getSucursales(),
                EstatusService.getCatalogo(),
            ]);

            setRoles(roles);
            setSucursales(resSucursales.data ?? []);

            if (resCatalogo.status === "success" && resCatalogo.data) {
                setEstatusList(extractEstatusList(resCatalogo.data));
            }
        } catch (err) {
            console.error("[useRoles] Error al cargar datos:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Helpers de lookup ────────────────────────────────────────────────────

    /** Busca el nombre de una sucursal por su id */
    const getSucursalNombre = useCallback(
        (id: string) =>
            sucursales.find(s => String(s.id_sucursal) === String(id))
                ?.nombre_sucursal ?? "N/A",
        [sucursales]
    );

    /** Busca el objeto EstatusItem por su id */
    const getEstatus = useCallback(
        (id: string) =>
            estatusList.find(e => String(e.id) === String(id)),
        [estatusList]
    );

    // ── Validación del formulario ────────────────────────────────────────────

    const validate = (form: RolFormData): RolFormErrors => {
        const e: RolFormErrors = {};
        const name = form.nombre_rol.trim();

        if (name.length < 3)   e.nombre_rol  = "Mínimo 3 caracteres.";
        if (name.length > 100) e.nombre_rol  = "Máximo 100 caracteres.";
        if (!form.id_sucursal) e.id_sucursal = "Seleccione una sucursal.";
        if (!form.id_status)   e.id_status   = "Seleccione un estado.";

        return e;
    };

    // ── Acciones del modal ───────────────────────────────────────────────────

    /** Abre el modal en modo "crear" */
    const openCreate = () =>
        setModal({ open: true, isEditing: false, editId: null, form: EMPTY_FORM, errors: {} });

    /** Abre el modal en modo "editar" precargando los datos del rol */
    const openEdit = (rol: RolItem) =>
        setModal({
            open:      true,
            isEditing: true,
            editId:    rol.id_rol,
            form: {
                nombre_rol:  rol.nombre_rol,
                id_sucursal: String(rol.id_sucursal ?? ""),
                id_status:   String(rol.id_status   ?? ""),
            },
            errors: {},
        });

    /** Cierra el modal (no hace nada si hay un guardado en curso) */
    const closeModal = () => {
        if (isSaving) return;
        setModal(INITIAL_MODAL);
    };

    /** Actualiza un campo del formulario y limpia su error */
    const setField = <K extends keyof RolFormData>(key: K, value: string) =>
        setModal(prev => ({
            ...prev,
            form:   { ...prev.form,   [key]: value },
            errors: { ...prev.errors, [key]: undefined },
        }));

    // ── CRUD ─────────────────────────────────────────────────────────────────

    /** Guarda el rol (crear o actualizar según el modo del modal) */
    const handleSave = async () => {
        const errors = validate(modal.form);

        // Si hay errores, los muestra y detiene el guardado
        if (Object.keys(errors).length > 0) {
            setModal(prev => ({ ...prev, errors }));
            return;
        }

        try {
            setIsSaving(true);

            if (modal.isEditing && modal.editId) {
                await RolService.update(modal.editId, modal.form);
            } else {
                await RolService.create(modal.form);
            }

            setModal(INITIAL_MODAL);
            await loadData(); // Refresca la tabla tras guardar
        } catch (err: any) {
            // Muestra el error de API dentro del modal en lugar de un alert
            setModal(prev => ({
                ...prev,
                errors: { nombre_rol: err.message ?? "Error al guardar el rol." },
            }));
        } finally {
            setIsSaving(false);
        }
    };

    /** Elimina un rol (soft delete) después de confirmación */
    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            "¿Eliminar este rol? Se marcará como inactivo."
        );
        if (!confirmed) return;

        try {
            setIsDeletingId(id);
            await RolService.delete(id);
            await loadData();
        } catch {
            alert("Error al eliminar el rol.");
        } finally {
            setIsDeletingId(null);
        }
    };

    // ── API pública del hook ─────────────────────────────────────────────────
    return {
        // Datos
        roles,
        sucursales,
        estatusList,

        // Estados de carga
        isLoading,
        isSaving,
        isDeletingId,

        // Modal
        modal,
        openCreate,
        openEdit,
        closeModal,
        setField,
        handleSave,
        handleDelete,

        // Helpers
        loadData,
        getSucursalNombre,
        getEstatus,
    };
};