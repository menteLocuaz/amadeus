import { useEffect, useState, useMemo, useCallback } from "react";
import { MonedaService, type Moneda, type CreateMonedaDTO } from "../services/MonedaService";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";

export interface MonedaFormData {
  nombre: string;
  id_sucursal: string;
  id_status: string;
}

/**
 * Normalizes currency data from the API to a consistent internal format.
 * Handles variations in field names like id_divisa, id_moneda, etc.
 */
const normalizeMoneda = (m: any): Moneda => ({
  id_moneda: String(m.id_moneda || m.id_divisa || m.id || ""),
  nombre: m.nombre || m.nombre_moneda || "S/N",
  id_sucursal: m.id_sucursal || "",
  id_status: m.id_status || m.status?.id_status || "",
  status: m.status,
});

export function useMonedaPage() {
  const { user } = useAuthStore();
  const { sucursales, statusList, fetchCatalogs } = useCatalogStore();

  // ── Main State ──
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [search, setSearch] = useState("");

  // ── Modal State ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMoneda, setEditingMoneda] = useState<Moneda | null>(null);
  const [formData, setFormData] = useState<MonedaFormData>({ 
    nombre: "", 
    id_sucursal: "",
    id_status: ""
  });

  // ── Async Operations State ──
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  /**
   * Loads all currencies and normalizes them.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await MonedaService.getAll();
      const rawData = Array.isArray(res.data) ? res.data : [];
      setMonedas(rawData.map(normalizeMoneda));
    } catch (err) {
      console.error("Error loading currencies:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
    fetchCatalogs();
  }, [fetchCatalogs, loadData]);

  // ── Reactive Filtering ──
  const filteredMonedas = useMemo(
    () => monedas.filter(m => 
      m.nombre?.toLowerCase().includes(search.toLowerCase())
    ),
    [monedas, search]
  );

  /**
   * Helper maps for O(1) lookups in the UI (e.g., Table rows).
   */
  const sucursalMap = useMemo(() => {
    const map: Record<string, string> = {};
    sucursales.forEach((s: any) => {
      const id = s.id_sucursal || s.id;
      map[id] = s.nombre_sucursal || s.nombre;
    });
    return map;
  }, [sucursales]);

  // ── Modal Actions ──
  const openModal = useCallback((moneda?: Moneda) => {
    if (moneda) {
      setEditingMoneda(moneda);
      setFormData({ 
        nombre: moneda.nombre || "", 
        id_sucursal: moneda.id_sucursal || user?.id_sucursal || "",
        id_status: moneda.id_status || ""
      });
    } else {
      // Find a default "Active" status for new entries
      const activeStatus = statusList.find(s => 
        s.std_descripcion.toLowerCase().includes("activ")
      )?.id_status || "";

      setEditingMoneda(null);
      setFormData({ 
        nombre: "", 
        id_sucursal: user?.id_sucursal || "",
        id_status: activeStatus
      });
    }
    setIsModalOpen(true);
  }, [user?.id_sucursal, statusList]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingMoneda(null);
  }, []);

  // ── CRUD Operations ──
  const handleSave = async () => {
    const nombre = formData.nombre.trim();
    if (!nombre) return alert("El nombre es obligatorio");
    if (!formData.id_sucursal) return alert("La sucursal es obligatoria");
    if (!formData.id_status) return alert("El estado es obligatorio");

    setIsSaving(true);
    try {
      const payload: CreateMonedaDTO = { 
        nombre, 
        id_sucursal: formData.id_sucursal,
        id_status: formData.id_status
      };

      if (editingMoneda) {
        const id = editingMoneda.id_moneda;
        if (!id) throw new Error("ID de moneda no encontrado");
        await MonedaService.update(id, payload);
      } else {
        await MonedaService.create(payload);
      }

      await loadData();
      closeModal();
      alert(`¡Moneda ${editingMoneda ? "actualizada" : "creada"} con éxito!`);
    } catch (err: any) {
      console.error("Error saving currency:", err);
      const errorMsg = err.response?.data?.message || err.message || "Error desconocido";
      alert(`Error: ${errorMsg}`);
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
      alert("Moneda eliminada con éxito");
    } catch (err: any) {
      console.error("Error deleting currency:", err);
      alert(`Error: ${err.response?.data?.message || "No se pudo eliminar"}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  return {
    // State
    filteredMonedas, 
    sucursales, 
    statusList,
    sucursalMap,
    search, 
    setSearch,
    isLoading, 
    isSaving, 
    isDeletingId,
    isModalOpen, 
    editingMoneda,
    formData, 
    setFormData,
    // Actions
    openModal, 
    closeModal,
    handleSave, 
    handleDelete,
  };
}