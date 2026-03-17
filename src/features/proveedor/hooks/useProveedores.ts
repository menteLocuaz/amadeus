import { useState, useEffect, useMemo } from "react";
import { ProveedorService, type Proveedor, type ProveedorCreateRequest } from "../services/ProveedorService";
import { EstatusService, type Estatus } from "../../auth/services/EstatusService";
import { SucursalService, type Sucursal } from "../services/SucursalService";
import { EmpresaService, type Empresa } from "../services/EmpresaService";

const getStatusName = (st: any) => st?.nombre || st?.std_descripcion || "";

export const useProveedores = () => {
    const [items, setItems] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Proveedor | null>(null);
    const [form, setForm] = useState<Partial<ProveedorCreateRequest>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [statuses, setStatuses] = useState<Estatus[]>([]);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [resProv, resStat, resSuc, resEmp] = await Promise.all([
                ProveedorService.getAll(),
                EstatusService.getByModulo(2),
                SucursalService.getAll(),
                EmpresaService.getAll(),
            ]);

            const extractData = (res: any) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.data && Array.isArray(res.data.items)) return res.data.items;
                if (res.data && typeof res.data === 'object') {
                    const modData = res.data["2"] || res.data["1"] || res.data["3"];
                    if (modData && Array.isArray(modData.items)) return modData.items;
                    return Object.values(res.data).filter(v => typeof v === 'object') as any[];
                }
                return [];
            };

            setItems(extractData(resProv));
            setStatuses(extractData(resStat));
            setSucursales(extractData(resSuc));
            setEmpresas(extractData(resEmp));
        } catch (err) {
            console.error("Error loading Proveedores data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(
            (p) =>
                (p.nombre || "").toLowerCase().includes(q) ||
                (p.ruc || "").toLowerCase().includes(q) ||
                (p.email || "").toLowerCase().includes(q)
        );
    }, [items, query]);

    const openCreate = () => {
        setEditing(null);
        const activeStatus = statuses.find(s => getStatusName(s).toLowerCase().includes("activ"));
        setForm({
            nombre: "",
            ruc: "",
            telefono: "",
            direccion: "",
            email: "",
            id_status: activeStatus?.id_status || statuses[0]?.id_status || "",
            id_sucursal: sucursales[0]?.id || (sucursales[0] as any)?.id_sucursal || "",
            id_empresa: empresas[0]?.id || (empresas[0] as any)?.id_empresa || "",
        });
        setErrors({});
        setOpen(true);
    };

    const openEdit = (p: Proveedor) => {
        setEditing(p);
        setForm({
            nombre: p.nombre,
            ruc: p.ruc,
            telefono: p.telefono || "",
            direccion: p.direccion || "",
            email: p.email || "",
            id_status: p.id_status,
            id_sucursal: p.id_sucursal,
            id_empresa: p.id_empresa,
        });
        setErrors({});
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditing(null);
        setForm({});
        setErrors({});
    };

    const handleSave = async (validate: (f: any) => any) => {
        const val = validate(form);
        setErrors(val);
        if (Object.keys(val).length > 0) return;

        setSaving(true);
        try {
            if (editing) {
                await ProveedorService.update(editing.id, form as any);
            } else {
                await ProveedorService.create(form as any);
            }
            await loadAll();
            handleClose();
        } catch (err) {
            console.error(err);
            alert("Error guardando proveedor");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("\u00bfEliminar proveedor?")) return;
        setDeletingId(id);
        try {
            await ProveedorService.delete(id);
            setItems((prev) => prev.filter((it) => it.id !== id));
        } catch (err) {
            console.error(err);
            alert("Error eliminando proveedor");
        } finally {
            setDeletingId(null);
        }
    };

    return {
        items: filtered,
        loading,
        saving,
        deletingId,
        query,
        setQuery,
        open,
        editing,
        form,
        setForm,
        errors,
        statuses,
        sucursales,
        empresas,
        openCreate,
        openEdit,
        handleClose,
        handleSave,
        handleDelete,
        getStatusName,
        getStatusLabel: (p: Proveedor) => {
            const label = getStatusName(p.status);
            if (label) return label;
            const found = statuses.find(s => String(s.id_status) === String(p.id_status));
            return getStatusName(found) || p.id_status;
        }
    };
};
