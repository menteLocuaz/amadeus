import React, { useEffect, useMemo, useState } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiSliders } from "react-icons/fi";
import { useTheme } from "styled-components";
import { MedidaService, type Medida, type CreateMedidaDTO } from "../../products/services/MedidaService";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";

import {
  PageContainer,
  TableCard,
  Table,
  ActionBtn,
  FormGroup,
  ModalOverlay,
  ModalContent
} from "../../../shared/components/UI";

interface MedidaFormData {
  nombre: string;
  abreviatura: string;
  id_sucursal: string;
  id_status: string;
}

const EMPTY_FORM: MedidaFormData = { nombre: "", abreviatura: "", id_sucursal: "", id_status: "" };

const normalizeMedida = (m: any): Medida => ({
  ...m,
  id_medida:    m.id_unidad || m.id_medida || m.id || "",
  abreviatura:  m.abreviatura || "",
  id_sucursal:  m.id_sucursal || "",
  id_status:    m.id_status || m.status?.id_status || "",
  status:       m.status,
});

const Medidas: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { sucursales, statusList, fetchCatalogs } = useCatalogStore();

  const [medidas,       setMedidas]       = useState<Medida[]>([]);
  const [search,        setSearch]        = useState("");
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingMedida, setEditingMedida] = useState<Medida | null>(null);
  const [isLoading,     setIsLoading]     = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [isDeletingId,  setIsDeletingId]  = useState<string | null>(null);
  const [formData,      setFormData]      = useState<MedidaFormData>(EMPTY_FORM);

  // ID del estado "Activo" en el catálogo
  const activeStatusId = useMemo(() =>
    statusList.find(s => s.std_descripcion.toLowerCase().includes("activ"))?.id_status ?? "",
    [statusList]
  );

  useEffect(() => {
    loadData();
    fetchCatalogs();
  }, [fetchCatalogs]);

  // Si el catálogo termina de cargar mientras el modal está abierto
  // y el id_status todavía no está asignado, lo rellena automáticamente.
  useEffect(() => {
    if (isModalOpen && !editingMedida && !formData.id_status && activeStatusId) {
      setFormData(prev => ({ ...prev, id_status: activeStatusId }));
    }
  }, [activeStatusId, isModalOpen, editingMedida, formData.id_status]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await MedidaService.getAll();
      setMedidas((res.data || []).map(normalizeMedida));
    } catch (err) {
      console.error("Error al cargar medidas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedidas = useMemo(() =>
    medidas.filter(m => m.nombre?.toLowerCase().includes(search.toLowerCase())),
    [medidas, search]
  );

  const sucursalMap = useMemo(() => {
    const map: Record<string, string> = {};
    sucursales.forEach((s: any) => { map[s.id_sucursal] = s.nombre_sucursal; });
    return map;
  }, [sucursales]);

  const openModal = (medida?: Medida) => {
    if (medida) {
      setEditingMedida(medida);
      setFormData({
        nombre:      medida.nombre      || "",
        abreviatura: medida.abreviatura || "",
        id_sucursal: medida.id_sucursal || user?.id_sucursal || "",
        id_status:   medida.id_status   || activeStatusId,
      });
    } else {
      setEditingMedida(null);
      setFormData({
        ...EMPTY_FORM,
        id_sucursal: user?.id_sucursal || "",
        id_status:   activeStatusId,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingMedida(null); };

  const handleSave = async () => {
    const nombre      = formData.nombre.trim();
    const abreviatura = formData.abreviatura.trim().toUpperCase();
    if (!nombre)              return alert("El nombre es obligatorio");
    if (!abreviatura)         return alert("La abreviatura es obligatoria");
    if (abreviatura.length > 10) return alert("La abreviatura debe tener máximo 10 caracteres");
    if (!formData.id_sucursal) return alert("Error: No se identificó la sucursal");
    if (!formData.id_status)   return alert("Debe seleccionar un estado");

    setIsSaving(true);
    try {
      const payload: CreateMedidaDTO = {
        nombre,
        abreviatura,
        id_sucursal: formData.id_sucursal,
        id_status:   formData.id_status,
      };

      if (editingMedida) {
        const id = String(editingMedida.id_medida || editingMedida.id_unidad || editingMedida.id || "");
        if (!id) throw new Error("ID de medida no encontrado");
        await MedidaService.update(id, payload);
      } else {
        await MedidaService.create(payload);
      }

      await loadData();
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Error desconocido";
      alert(`Error: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) { alert("No se pudo identificar el ID para eliminar."); return; }
    if (!window.confirm("¿Estás seguro de eliminar esta medida?")) return;

    setIsDeletingId(id);
    try {
      await MedidaService.delete(id);
      await loadData();
    } catch (err: any) {
      alert(`Error al eliminar: ${err?.response?.data?.message || err?.message || ""}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  const selectStyle = {
    width: "100%", padding: "12px", borderRadius: "10px",
    background: theme.bg2, border: `1px solid ${theme.bg3}33`,
    color: theme.text, outline: "none",
  };

  const isBusy = isSaving || isDeletingId !== null;

  return (
    <PageContainer>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: theme.primary, display: "flex", alignItems: "center", gap: 12 }}>
            <FiSliders /> Medidas
          </h1>
          <p style={{ fontSize: "0.95rem", color: theme.texttertiary, marginTop: 5 }}>
            Gestiona las unidades de medida para tus productos
          </p>
        </div>
        <button
          onClick={() => openModal()}
          disabled={isBusy || isLoading}
          style={{
            background: theme.primary, color: theme.bg,
            border: "none", padding: "12px 24px", borderRadius: 12,
            fontWeight: 700, display: "flex", alignItems: "center", gap: 10,
            cursor: isBusy || isLoading ? "not-allowed" : "pointer",
            opacity: isBusy || isLoading ? 0.6 : 1, transition: "all 0.2s",
          }}
        >
          <FiPlus /> Nueva Medida
        </button>
      </div>

      {/* ── Búsqueda ── */}
      <div style={{
        background: theme.bg, border: `1px solid ${theme.bg2}`,
        padding: "12px 18px", borderRadius: 14,
        display: "flex", alignItems: "center", gap: 12,
        maxWidth: 400, marginBottom: 25,
      }}>
        <FiSearch style={{ color: theme.primary }} />
        <input
          placeholder="Buscar medida..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", outline: "none", background: "transparent", color: theme.text, width: "100%" }}
        />
      </div>

      {/* ── Tabla ── */}
      {isLoading && medidas.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <ClimbingBoxLoader color={theme.primary} size={20} />
        </div>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Abreviatura</th>
                <th>Sucursal</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedidas.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                    No se encontraron medidas.
                  </td>
                </tr>
              ) : (
                filteredMedidas.map(medida => {
                  const id = String(medida.id_medida || medida.id_unidad || medida.id || "");
                  return (
                    <tr key={id}>
                      <td style={{ fontWeight: 600 }}>{medida.nombre}</td>
                      <td>
                        <span style={{
                          fontFamily: "monospace", fontSize: "0.8rem",
                          padding: "3px 8px", borderRadius: 6,
                          background: theme.bg2, color: theme.textsecondary,
                        }}>
                          {medida.abreviatura || "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: "0.75rem", padding: "4px 8px",
                          background: theme.bg2, borderRadius: 6,
                          color: theme.textsecondary,
                        }}>
                          {sucursalMap[medida.id_sucursal] ?? "Sin Sucursal"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <ActionBtn onClick={() => openModal(medida)} title="Editar" disabled={isBusy}>
                          <FiEdit2 size={18} />
                        </ActionBtn>
                        <ActionBtn $variant="delete" onClick={() => handleDelete(id)} title="Eliminar" disabled={isBusy}>
                          {isDeletingId === id
                            ? <ClimbingBoxLoader color={theme.danger} size={10} />
                            : <FiTrash2 size={18} />}
                        </ActionBtn>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableCard>
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
              <h2 style={{ margin: 0, color: theme.text }}>
                {editingMedida ? "Editar Medida" : "Nueva Medida"}
              </h2>
              <ActionBtn $variant="close" onClick={closeModal} disabled={isSaving}>
                <FiX size={24} />
              </ActionBtn>
            </div>

            {/* Nombre */}
            <FormGroup>
              <label>Nombre</label>
              <input
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Kilogramo, Litro, Unidad..."
                autoFocus
                disabled={isSaving}
              />
            </FormGroup>

            {/* Abreviatura */}
            <FormGroup style={{ marginTop: 20 }}>
              <label>Abreviatura <span style={{ opacity: 0.5, fontWeight: 400 }}>(máx. 10 caracteres)</span></label>
              <input
                value={formData.abreviatura}
                onChange={(e) => setFormData(prev => ({ ...prev, abreviatura: e.target.value }))}
                placeholder="Ej: KG, LTS, UND, PAQ..."
                maxLength={10}
                disabled={isSaving}
              />
            </FormGroup>

            {/* Sucursal */}
            {sucursales.length > 0 && (
              <FormGroup style={{ marginTop: 20 }}>
                <label>Sucursal</label>
                <select
                  value={formData.id_sucursal}
                  onChange={(e) => setFormData(prev => ({ ...prev, id_sucursal: e.target.value }))}
                  style={selectStyle}
                  disabled={isSaving}
                >
                  <option value="">Seleccione sucursal...</option>
                  {sucursales.map((s: any) => (
                    <option key={s.id_sucursal} value={s.id_sucursal}>
                      {s.nombre_sucursal}
                    </option>
                  ))}
                </select>
              </FormGroup>
            )}

            {/* Estado */}
            <FormGroup style={{ marginTop: 20 }}>
              <label>Estado</label>
              <select
                value={formData.id_status}
                onChange={(e) => setFormData(prev => ({ ...prev, id_status: e.target.value }))}
                style={selectStyle}
                disabled={isSaving}
              >
                <option value="">Seleccione estado...</option>
                {statusList.map((s) => (
                  <option key={s.id_status} value={s.id_status}>
                    {s.std_descripcion}
                  </option>
                ))}
              </select>
            </FormGroup>

            {/* Botones */}
            <div style={{ display: "flex", gap: 15, marginTop: 30 }}>
              <button
                onClick={closeModal}
                disabled={isSaving}
                style={{ flex: 1, padding: 14, borderRadius: 12, background: theme.bg2, color: theme.text, border: "none", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{ flex: 1, padding: 14, borderRadius: 12, background: theme.primary, color: theme.bg, border: "none", fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer" }}
              >
                {isSaving ? "Guardando..." : editingMedida ? "Guardar Cambios" : "Crear Medida"}
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Medidas;
