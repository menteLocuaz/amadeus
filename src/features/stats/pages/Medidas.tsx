import React, { useEffect, useMemo, useState } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiSliders } from "react-icons/fi";
import { MedidaService, type Medida } from "../../products/services/MedidaService";
import { useAuthStore } from "../../auth/store/useAuthStore";

/* UI compartida */
import {
  PageContainer,
  TableCard,
  Table,
  ActionBtn,
  FormGroup,
  ModalOverlay,
  ModalContent
} from "../../../shared/components/UI";

const Header = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
    {children}
  </div>
);

const TitleSection = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div>
    <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
      <FiSliders /> {title}
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
      opacity: disabled ? 0.6 : 1,
      transition: "all 0.12s",
    }}
  >
    <FiPlus size={18} /> Nueva Medida
  </button>
);

const SearchBar = ({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) => (
  <div style={{
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
  }}>
    <FiSearch style={{ color: "var(--accent, #FCA311)" }} />
    <input
      placeholder="Buscar medida..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 16, opacity: disabled ? 0.6 : 1 }}
    />
  </div>
);

const Medidas: React.FC = () => {
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedida, setEditingMedida] = useState<Medida | null>(null);

  const [isLoading, setIsLoading] = useState(false); // carga inicial / refresco de lista
  const [isSaving, setIsSaving] = useState(false);   // guardar (create/update)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // id en eliminación

  const { user } = useAuthStore();

  const [formData, setFormData] = useState({ nombre: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await MedidaService.getAll();
      const dataNormalizada = (res.data || []).map((m: any) => ({
        ...m,
        id_medida: m.id_unidad || m.id_medida || m.id
      }));
      setMedidas(dataNormalizada);
    } catch (error) {
      console.error("Error al cargar medidas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedidas = useMemo(() =>
    medidas.filter(m => m.nombre?.toLowerCase().includes(search.toLowerCase())),
    [medidas, search]
  );

  const openModal = (medida?: Medida) => {
    if (medida) {
      setEditingMedida(medida);
      setFormData({ nombre: medida.nombre || "" });
    } else {
      setEditingMedida(null);
      setFormData({ nombre: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const trimmed = formData.nombre.trim();
    if (!trimmed) return alert("El nombre es obligatorio");
    if (!user?.id_sucursal) return alert("Error: No se identificó la sucursal");

    setIsSaving(true);
    try {
      const payload = { nombre: trimmed, id_sucursal: user.id_sucursal };
      if (editingMedida) {
        const idParaActualizar = String(editingMedida.id_medida || editingMedida.id || "");
        if (!idParaActualizar) throw new Error("ID de medida no encontrado");
        await MedidaService.update(idParaActualizar, payload);
        alert("Medida actualizada");
      } else {
        await MedidaService.create(payload);
        alert("Medida creada");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error al guardar medida:", error);
      alert("Error al procesar la medida: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      alert("No se pudo identificar el ID para eliminar.");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar esta medida?")) return;

    setIsDeletingId(id);
    try {
      await MedidaService.delete(id);
      await loadData();
      alert("Medida eliminada");
    } catch (error) {
      console.error("Error al eliminar medida:", error);
      alert("Error al eliminar la medida");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <PageContainer>
      <Header>
        <TitleSection title="Medidas" subtitle="Gestiona las unidades de medida para tus productos" />
        <AddButton onClick={() => openModal()} disabled={isSaving || isDeletingId !== null || isLoading} />
      </Header>

      <SearchBar value={search} onChange={setSearch} disabled={isSaving || isDeletingId !== null || isLoading} />

      {isLoading && medidas.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <ClimbingBoxLoader color="#FCA311" size={25} />
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
              {filteredMedidas.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                    No se encontraron medidas.
                  </td>
                </tr>
              ) : (
                filteredMedidas.map(medida => (
                  <tr key={medida.id_medida}>
                    <td style={{ fontWeight: 600 }}>{medida.nombre}</td>
                    <td style={{ textAlign: "right" }}>
                      <ActionBtn onClick={() => openModal(medida)} title="Editar" disabled={isSaving || isDeletingId !== null}>
                        <FiEdit2 size={18} />
                      </ActionBtn>

                      <ActionBtn
                        $variant="delete"
                        onClick={() => handleDelete(String(medida.id_medida))}
                        title="Eliminar"
                        disabled={isSaving || isDeletingId !== null}
                      >
                        {isDeletingId === String(medida.id_medida) ? (
                          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22 }}>
                            <ClimbingBoxLoader color="#ff4d4d" size={12} />
                          </div>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>{editingMedida ? "Editar Medida" : "Nueva Medida"}</h2>
              <ActionBtn $variant="close" onClick={() => setIsModalOpen(false)} disabled={isSaving || isDeletingId !== null}>
                <FiX size={20} />
              </ActionBtn>
            </div>

            <FormGroup>
              <label>Nombre</label>
              <input
                placeholder="Ej: Metro, Kilo, Unidad..."
                value={formData.nombre}
                onChange={e => setFormData({ nombre: e.target.value })}
                disabled={isSaving || isDeletingId !== null}
              />
            </FormGroup>

            <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
              <button
                style={{ flex: 1, padding: 12, borderRadius: 12, fontWeight: 700, border: "none", background: "rgba(255,255,255,0.05)" }}
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving || isDeletingId !== null}
              >
                Cancelar
              </button>

              <button
                style={{ flex: 1, padding: 12, borderRadius: 12, fontWeight: 700, border: "none", background: "var(--accent, #FCA311)", color: "#000" }}
                onClick={handleSave}
                disabled={isSaving || isDeletingId !== null}
              >
                {isSaving ? "Guardando..." : (editingMedida ? "Guardar Cambios" : "Crear Medida")}
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Medidas;