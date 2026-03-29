// features/products/categories/hooks/useCategoriaPage.ts
import { useEffect, useState, useMemo } from "react";
import { CategoryService, type Category } from "../../products/services/CategoryService";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";

export interface CategoryFormData {
  nombre: string;
  id_sucursal: string;
}

export function useCategoriaPage() {
  const { categories, sucursales, fetchCatalogs, isLoading } = useCatalogStore();
  const { user, setSucursalActiva } = useAuthStore();

  // Estados del UI
  const [search, setSearch]               = useState("");
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving]           = useState(false);
  const [isDeletingId, setIsDeletingId]   = useState<string | null>(null);
  const [formData, setFormData]           = useState<CategoryFormData>({ nombre: "", id_sucursal: "" });

  // Carga inicial del catálogo
  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  // Mapa id_sucursal → nombre para mostrar en tabla
  const sucursalMap = useMemo(() => {
    return Object.fromEntries(
      sucursales.map((s: any) => [s.id_sucursal, s.nombre_sucursal])
    );
  }, [sucursales]);

  // Filtra por sucursal activa del usuario y por texto de búsqueda
  const filteredCategories = useMemo(() => {
    return categories.filter((c: any) => {
      const matchesSearch    = c.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesSucursal  = user?.id_sucursal ? c.id_sucursal === user.id_sucursal : true;
      return matchesSearch && matchesSucursal;
    });
  }, [categories, search, user?.id_sucursal]);

  /** Abre el modal en modo edición o creación */
  const handleOpenModal = (cat?: Category) => {
    setEditingCategory(cat ?? null);
    setFormData({
      nombre:       cat?.nombre       ?? "",
      id_sucursal:  cat?.id_sucursal  ?? user?.id_sucursal ?? "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  /** Guarda (crea o actualiza) una categoría */
  const handleSave = async () => {
    if (!formData.nombre.trim())  return alert("El nombre es obligatorio");
    if (!formData.id_sucursal)    return alert("Debe seleccionar una sucursal");

    setIsSaving(true);
    try {
      const payload = { nombre: formData.nombre.trim(), id_sucursal: formData.id_sucursal };

      if (editingCategory) {
        await CategoryService.update(editingCategory.id_categoria, payload);
      } else {
        await CategoryService.create(payload);
      }

      await fetchCatalogs(true);
      setIsModalOpen(false);
    } catch {
      alert("Error al procesar la categoría");
    } finally {
      setIsSaving(false);
    }
  };

  /** Elimina una categoría con confirmación */
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;

    setIsDeletingId(id);
    try {
      await CategoryService.delete(id);
      await fetchCatalogs(true);
    } catch {
      alert("Error al eliminar");
    } finally {
      setIsDeletingId(null);
    }
  };

  /** Cambia la sucursal activa global del usuario en el store */
  const handleSelectSucursal = (id: string) => {
    setSucursalActiva(id, sucursalMap[id] ?? "");
  };

  return {
    // Estado
    user, sucursales, sucursalMap,
    search, setSearch,
    isLoading, isSaving, isDeletingId,
    isModalOpen, editingCategory,
    formData, setFormData,
    filteredCategories,
    // Acciones
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete,
    handleSelectSucursal,
  };
}