import { useEffect, useState, useMemo, useCallback } from "react";
import { MonedaService, type Moneda } from "../services/MonedaService";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";

export interface MonedaFormData {
  nombre:      string;
  id_sucursal: string;
}

/** Normaliza el ID de moneda independientemente del campo que venga del API */
const normalizeMoneda = (m: any): Moneda => ({
  ...m,
  id_moneda: m.id_moneda ?? m.id_divisa ?? m.id,
  nombre: m.nombre ?? m.nombre_moneda ?? "S/N",
});

export function useMonedaPage() {
  const { user } = useAuthStore();
  const { sucursales, fetchCatalogs } = useCatalogStore();


  // ── Estado principal ──
  const [monedas,     setMonedas]     = useState<Moneda[]>([]);
  const [search,      setSearch]      = useState("");

  // ── Estado del modal ──
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editingMoneda,  setEditingMoneda]  = useState<Moneda | null>(null);
  const [formData,       setFormData]       = useState<MonedaFormData>({ nombre: "", id_sucursal: "" });

  // ── Estado de operaciones async ──
  const [isLoading,    setIsLoading]    = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // ── Carga inicial ──
  useEffect(() => {
    loadData();
    fetchCatalogs();
  }, [fetchCatalogs]);

  /** Obtiene todas las monedas y normaliza los IDs */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await MonedaService.getAll();
      setMonedas((res.data || []).map(normalizeMoneda));
    } catch (err) {
      console.error("Error al cargar monedas:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Filtrado reactivo por texto ──
  const filteredMonedas = useMemo(
    () => monedas.filter(m => m.nombre?.toLowerCase().includes(search.toLowerCase())),
    [monedas, search]
  );

  /** Mapeo id_sucursal → nombre para mostrar en tabla */
  const sucursalMap = useMemo(() => {
    const map: Record<string, string> = {};
    sucursales.forEach((s: any) => {
      map[s.id_sucursal] = s.nombre_sucursal;
    });
    return map;
  }, [sucursales]);

  // ── Acciones del modal ──
  const openModal = useCallback((moneda?: Moneda) => {
    if (moneda) {
      setEditingMoneda(moneda);
      setFormData({ 
        nombre: moneda.nombre ?? "", 
        id_sucursal: moneda.id_sucursal ?? user?.id_sucursal ?? "" 
      });
    } else {
      setEditingMoneda(null);
      setFormData({ 
        nombre: "", 
        id_sucursal: user?.id_sucursal ?? "" 
      });
    }
    setIsModalOpen(true);
  }, [user?.id_sucursal]);

  const closeModal = () => setIsModalOpen(false);

  // ── CRUD ──
  const handleSave = async () => {
    const nombre = formData.nombre.trim();
    if (!nombre)              return alert("El nombre es obligatorio");
    if (!formData.id_sucursal) return alert("La sucursal es obligatoria");

    setIsSaving(true);
    try {
      const payload = { 
        nombre, 
        id_sucursal: formData.id_sucursal
      };

      if (editingMoneda) {
        const id = String(editingMoneda.id_moneda ?? "");
        if (!id) throw new Error("ID de moneda no encontrado");
        await MonedaService.update(id, payload);
        alert("¡Moneda actualizada con éxito!");
      } else {
        await MonedaService.create(payload);
        alert("¡Moneda creada con éxito!");
      }

      await loadData();
      closeModal();
    } catch (err: any) {
      console.error("Error al guardar moneda:", err);
      alert(`Error: ${err.response?.data?.message ?? err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm("¿Estás seguro de eliminar esta moneda?")) return;

    setIsDeletingId(id);
    try {
      await MonedaService.delete(id);
      await loadData();
      alert("Moneda eliminada");
    } catch (err) {
      console.error("Error al eliminar moneda:", err);
    } finally {
      setIsDeletingId(null);
    }
  };

  return {
    // Estado
    filteredMonedas, sucursales, sucursalMap,
    search, setSearch,
    isLoading, isSaving, isDeletingId,
    isModalOpen, editingMoneda,
    formData, setFormData,
    // Acciones
    openModal, closeModal,
    handleSave, handleDelete,
  };
}