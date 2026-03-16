import React, { useEffect, useState, useMemo } from "react";
import { CategoryService, type Category } from "../../products/services/CategoryService";
import { useAuthStore } from "../../auth/store/useAuthStore";
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

const TitleSection = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div>
    <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "var(--accent, #FCA311)", display: "flex", alignItems: "center", gap: 12 }}>
      <FiTag /> {title}
    </h1>
    {subtitle && <p style={{ fontSize: "0.95rem", color: "var(--text-tertiary, #9CA3AF)", marginTop: 5 }}>{subtitle}</p>}
  </div>
);

const AddButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: "var(--accent, #FCA311)",
      color: "#000",
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
    <FiPlus size={20} /> Nueva Categoría
  </button>
);

const SearchBar = ({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) => (
  <div
    style={{
      background: "var(--bg, #fff)",
      border: "1px solid rgba(0,0,0,0.06)",
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
    <FiSearch style={{ color: "var(--accent, #FCA311)" }} />
    <input
      placeholder="Buscar categoría..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        border: "none",
        outline: "none",
        background: "transparent",
        color: "var(--text, #000)",
        width: "100%",
        fontSize: "1rem",
        opacity: disabled ? 0.6 : 1,
      }}
    />
  </div>
);

export const Categoria: React.FC = () => {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({ nombre: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await CategoryService.getAll();
      setCategorias(res.data || []);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = useMemo(
    () => categorias.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase())),
    [categorias, search]
  );

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ nombre: cat.nombre });
    } else {
      setEditingCategory(null);
      setFormData({ nombre: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) return alert("El nombre es obligatorio");
    if (!user?.id_sucursal) return alert("Error: No se identificó la sucursal");

    setIsSaving(true);
    try {
      if (editingCategory) {
        await CategoryService.update(editingCategory.id_categoria, {
          nombre: formData.nombre.trim(),
          id_sucursal: user.id_sucursal,
        });
        alert("Categoría actualizada");
      } else {
        await CategoryService.create({
          nombre: formData.nombre.trim(),
          id_sucursal: user.id_sucursal,
        });
        alert("Categoría creada");
      }
      await loadData();
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
      await loadData();
      alert("Categoría eliminada");
    } catch (error) {
      alert("Error al eliminar");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <PageContainer>
      <Header>
        <TitleSection title="Categorías" subtitle="Organiza tus productos por grupos lógicos" />
        <AddButton onClick={() => handleOpenModal()} disabled={isLoading || isSaving || isDeletingId !== null} />
      </Header>

      <SearchBar value={search} onChange={setSearch} disabled={isLoading || isSaving || isDeletingId !== null} />

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <ClimbingBoxLoader color="#FCA311" size={20} />
        </div>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                    No se encontraron categorías.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id_categoria}>
                    <td style={{ fontWeight: 600 }}>{cat.nombre}</td>
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
                          <ClimbingBoxLoader color="#ff4d4d" size={18} />
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
              <h2 style={{ margin: 0, fontSize: "1.5rem", color: "var(--text, #000)" }}>
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
                onChange={(e) => setFormData({ nombre: e.target.value })}
                required
                disabled={isSaving}
              />
            </FormGroup>

            <div style={{ display: "flex", gap: 15, marginTop: 30 }}>
              <button
                style={{ flex: 1, padding: 14, borderRadius: 12, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", border: "none", background: "rgba(255,255,255,0.05)", color: "inherit", transition: "all 0.2s" }}
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                style={{ flex: 1, padding: 14, borderRadius: 12, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", border: "none", background: "var(--accent, #FCA311)", color: "#000", transition: "all 0.2s" }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : editingCategory ? "Guardar Cambios" : "Crear Categoría"}
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Categoria;