import React, { useEffect, useState, useMemo } from "react";
import { useTheme } from "styled-components";
import { CategoryService, type Category } from "../../products/services/CategoryService";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiTag } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";

import {
  PageContainer,
  TableCard,
  Table,
  ActionBtn,
  FormGroup,
  ModalOverlay,
  ModalContent,
} from "../../../shared/components/UI";

const Header = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
    {children}
  </div>
);

const TitleSection = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const theme = useTheme();
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: theme.primary, display: "flex", alignItems: "center", gap: 12 }}>
        <FiTag /> {title}
      </h1>
      {subtitle && <p style={{ fontSize: "0.95rem", color: theme.texttertiary, marginTop: 5 }}>{subtitle}</p>}
    </div>
  );
};

const AddButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => {
  const theme = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: theme.primary,
        color: theme.bg,
        border: "none",
        padding: "12px 24px",
        borderRadius: 12,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s",
      }}
    >
      <FiPlus /> Nueva Categoría
    </button>
  );
};

const SearchBar = ({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.bg,
        border: `1px solid ${theme.bg2}`,
        padding: "12px 18px",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        maxWidth: 400,
        marginBottom: 25,
        transition: "all 0.2s",
      }}
    >
      <FiSearch style={{ color: theme.primary }} />
      <input
        placeholder="Buscar categoría..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          color: theme.text,
          width: "100%",
          fontSize: "1rem",
          opacity: disabled ? 0.6 : 1,
        }}
      />
    </div>
  );
};

export const Categoria: React.FC = () => {
  const theme = useTheme();
  const { categories, sucursales, fetchCatalogs, isLoading: isCatalogLoading } = useCatalogStore();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({ nombre: "", id_sucursal: "" });

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const sucursalMap = useMemo(() => {
    const map: Record<string, string> = {};
    sucursales.forEach((s: any) => {
      map[s.id_sucursal || s.id] = s.nombre_sucursal || s.nombre;
    });
    return map;
  }, [sucursales]);

  const filteredCategories = useMemo(
    () => categories.filter((c: any) => c.nombre.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ 
        nombre: cat.nombre, 
        id_sucursal: cat.id_sucursal || user?.id_sucursal || (sucursales.length > 0 ? (sucursales[0].id_sucursal || sucursales[0].id) : "") 
      });
    } else {
      setEditingCategory(null);
      setFormData({ 
        nombre: "", 
        id_sucursal: user?.id_sucursal || (sucursales.length > 0 ? (sucursales[0].id_sucursal || sucursales[0].id) : "") 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) return alert("El nombre es obligatorio");
    if (!formData.id_sucursal) return alert("Error: Debe seleccionar una sucursal");

    setIsSaving(true);
    try {
      if (editingCategory) {
        await CategoryService.update(editingCategory.id_categoria, {
          nombre: formData.nombre.trim(),
          id_sucursal: formData.id_sucursal,
        });
        alert("Categoría actualizada");
      } else {
        await CategoryService.create({
          nombre: formData.nombre.trim(),
          id_sucursal: formData.id_sucursal,
        });
        alert("Categoría creada");
      }
      await fetchCatalogs(true);
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al procesar la categoría");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;

    setIsDeletingId(id);
    try {
      await CategoryService.delete(id);
      await fetchCatalogs(true);
      alert("Categoría eliminada");
    } catch (error) {
      alert("Error al eliminar");
    } finally {
      setIsDeletingId(null);
    }
  };

  const isLoading = isCatalogLoading;

  return (
    <PageContainer>
      <Header>
        <TitleSection title="Categorías" subtitle="Organiza tus productos por grupos lógicos" />
        <AddButton onClick={() => handleOpenModal()} disabled={isLoading || isSaving || isDeletingId !== null} />
      </Header>

      <SearchBar value={search} onChange={setSearch} disabled={isLoading || isSaving || isDeletingId !== null} />

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <ClimbingBoxLoader color={theme.primary} size={20} />
        </div>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Sucursal</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                    No se encontraron categorías.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id_categoria}>
                    <td style={{ fontWeight: 600 }}>{cat.nombre}</td>
                    <td>
                      <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        {sucursalMap[cat.id_sucursal] || "N/A"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <ActionBtn
                        onClick={() => handleOpenModal(cat)}
                        title="Editar"
                        disabled={isSaving || isDeletingId !== null}
                      >
                        <FiEdit2 size={18} />
                      </ActionBtn>
                      <ActionBtn
                        $variant="delete"
                        onClick={() => handleDelete(cat.id_categoria)}
                        title="Eliminar"
                        disabled={isSaving || isDeletingId !== null}
                      >
                        {isDeletingId === cat.id_categoria ? (
                          <ClimbingBoxLoader color={theme.danger} size={18} />
                        ) : (
                          <FiTrash2 size={18} />
                        )}
                      </ActionBtn>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableCard>
      )}

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
              <h2 style={{ margin: 0, fontSize: "1.5rem", color: theme.text }}>
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <ActionBtn $variant="close" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                <FiX size={24} />
              </ActionBtn>
            </div>

            <FormGroup>
              <label>Nombre de Categoría</label>
              <input
                placeholder="Ej: Bebidas, Dulces..."
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                disabled={isSaving}
              />
            </FormGroup>

            <FormGroup style={{ marginTop: 15 }}>
              <label>Sucursal</label>
              <select
                value={formData.id_sucursal}
                onChange={(e) => setFormData({ ...formData, id_sucursal: e.target.value })}
                disabled={isSaving}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  background: theme.bg2 || "#222",
                  border: `1px solid ${theme.bg3 || "#444"}33`,
                  color: theme.text || "#fff",
                  outline: "none"
                }}
              >
                <option value="">Seleccione una sucursal</option>
                {sucursales.map((s: any) => (
                  <option key={s.id_sucursal || s.id} value={s.id_sucursal || s.id}>
                    {s.nombre_sucursal || s.nombre}
                  </option>
                ))}
              </select>
            </FormGroup>

            <div style={{ display: "flex", gap: 15, marginTop: 30 }}>
              <button
                type="button"
                style={{ flex: 1, padding: 14, borderRadius: 12, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", border: "none", background: theme.bg2 || "#333", color: theme.text || "#fff", transition: "all 0.2s" }}
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={{ flex: 1, padding: 14, borderRadius: 12, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", border: "none", background: theme.primary || "#FCA311", color: theme.bg || "#000", transition: "all 0.2s" }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <ClimbingBoxLoader color={theme.bg} size={10} /> : editingCategory ? "Guardar Cambios" : "Crear Categoría"}
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Categoria;
