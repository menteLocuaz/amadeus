import React, { useEffect, useState, useMemo } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiDollarSign } from "react-icons/fi";
import { MonedaService, type Moneda } from "../../products/services/MonedaService";
import { EstatusService } from "../../auth/services/EstatusService";
import { useAuthStore } from "../../auth/store/useAuthStore";

/* Componentes UI compartidos */
import {
  PageContainer,
  TableCard,
  Table,
  ActionBtn,
  FormGroup,
  ModalOverlay,
  ModalContent,
  Badge,
} from "../../../shared/components/UI";

const Header = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
    {children}
  </div>
);

const TitleSection = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div>
    <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
      <FiDollarSign /> {title}
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
    <FiPlus size={18} /> Nueva Moneda
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
      placeholder="Buscar moneda..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 16, opacity: disabled ? 0.6 : 1 }}
    />
  </div>
);

const Monedas: React.FC = () => {
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [estatusList, setEstatusList] = useState<{ id_status: string; std_descripcion: string }[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMoneda, setEditingMoneda] = useState<Moneda | null>(null);

  const [isLoading, setIsLoading] = useState(false); // carga inicial / refresh
  const [isSaving, setIsSaving] = useState(false);   // create/update
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // id en eliminación

  const { user } = useAuthStore();

  const [formData, setFormData] = useState({ nombre: "", id_status: "" });

  useEffect(() => {
    loadData();
    loadEstatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await MonedaService.getAll();
      const dataNormalizada = (res.data || []).map((m: any) => ({
        ...m,
        id_moneda: m.id_moneda || m.id_divisa || m.id
      }));
      setMonedas(dataNormalizada);
    } catch (error) {
      console.error("Error al cargar monedas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEstatus = async () => {
    try {
      const res = await EstatusService.getCatalogo();
      if (res.success) {
        const list = res.data["1"]?.items || res.data["3"]?.items || [];
        setEstatusList(list);
      }
    } catch (error) {
      console.error("Error al cargar estatus:", error);
    }
  };

  const filteredMonedas = useMemo(() =>
    monedas.filter(m => m.nombre?.toLowerCase().includes(search.toLowerCase())),
    [monedas, search]
  );

  const openModal = (moneda?: Moneda) => {
    if (moneda) {
      setEditingMoneda(moneda);
      setFormData({
        nombre: moneda.nombre || "",
        id_status: moneda.id_status || ""
      });
    } else {
      setEditingMoneda(null);
      const defaultStatus = estatusList.find(e => e.std_descripcion.toLowerCase().includes("activ"))?.id_status || "";
      setFormData({ nombre: "", id_status: defaultStatus });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const trimmedNombre = formData.nombre.trim();
    if (!trimmedNombre) return alert("El nombre es obligatorio");
    if (!user?.id_sucursal) return alert("Error: No se identificó la sucursal");
    if (!formData.id_status) return alert("El estado es obligatorio");

    setIsSaving(true);
    try {
      const payload = {
        nombre: trimmedNombre,
        id_sucursal: user.id_sucursal.trim(),
        id_status: formData.id_status
      };

      if (editingMoneda) {
        const idParaActualizar = String(editingMoneda.id_moneda || editingMoneda.id_moneda || "");
        if (!idParaActualizar) throw new Error("ID de moneda no encontrado");
        await MonedaService.update(idParaActualizar, payload);
        alert("¡Moneda actualizada con éxito!");
      } else {
        await MonedaService.create(payload);
        alert("¡Moneda creada con éxito!");
      }
      await loadData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error al guardar moneda:", error);
      const apiMessage = error.response?.data?.message || error.message;
      alert(`Error: ${apiMessage}`);
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
    } catch (error) {
      console.error("Error al eliminar moneda:", error);
      alert("Error al eliminar");
    } finally {
      setIsDeletingId(null);
    }
  };

  const getStatusDescription = (id: string) => {
    const status = estatusList.find(e => e.id_status === id);
    return status?.std_descripcion || "Desconocido";
  };

  const getBadgeColor = (id_status?: string) => {
    const desc = getStatusDescription(id_status || "");
    return desc.toLowerCase().includes("activ") ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
  };

  return (
    <PageContainer>
      <Header>
        <TitleSection title="Monedas" subtitle="Configure las divisas aceptadas en su sucursal" />
        <AddButton onClick={() => openModal()} disabled={isSaving || isDeletingId !== null || isLoading} />
      </Header>

      <SearchBar value={search} onChange={setSearch} disabled={isSaving || isDeletingId !== null || isLoading} />

      {isLoading && monedas.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <ClimbingBoxLoader color="#FCA311" size={25} />
        </div>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMonedas.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                    No se encontraron monedas.
                  </td>
                </tr>
              ) : (
                filteredMonedas.map(moneda => (
                  <tr key={String(moneda.id_moneda)}>
                    <td style={{ fontWeight: 600 }}>{moneda.nombre}</td>
                    <td>
                      <Badge $color={getBadgeColor(moneda.id_status)}>{getStatusDescription(moneda.id_status)}</Badge>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <ActionBtn onClick={() => openModal(moneda)} title="Editar" disabled={isSaving || isDeletingId !== null}>
                        <FiEdit2 size={18} />
                      </ActionBtn>

                      <ActionBtn
                        $variant="delete"
                        onClick={() => handleDelete(String(moneda.id_moneda))}
                        title="Eliminar"
                        disabled={isSaving || isDeletingId !== null}
                      >
                        {isDeletingId === String(moneda.id_moneda) ? (
                          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20 }}>
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
              <h2 style={{ margin: 0 }}>{editingMoneda ? "Editar Moneda" : "Nueva Moneda"}</h2>
              <ActionBtn $variant="close" onClick={() => setIsModalOpen(false)} disabled={isSaving || isDeletingId !== null}>
                <FiX size={20} />
              </ActionBtn>
            </div>

            <FormGroup>
              <label>Nombre de la Moneda</label>
              <input
                placeholder="Ej: Peso Mexicano, Dólar..."
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                disabled={isSaving || isDeletingId !== null}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Estado</label>
              <select
                value={formData.id_status}
                onChange={e => setFormData({ ...formData, id_status: e.target.value })}
                disabled={isSaving || isDeletingId !== null}
                required
              >
                <option value="">Seleccione Estado</option>
                {estatusList.map(est => (
                  <option key={est.id_status} value={est.id_status}>
                    {est.std_descripcion}
                  </option>
                ))}
              </select>
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
                {isSaving ? "Guardando..." : (editingMoneda ? "Guardar Cambios" : "Crear Moneda")}
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Monedas;