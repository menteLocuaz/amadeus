import React, { useEffect, useMemo, useState } from "react";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiImage, FiPackage } from "react-icons/fi";
import { ProductService, type Product } from "../services/ProductService";
import { CategoryService } from "../services/CategoryService";
import { MedidaService } from "../services/MedidaService";
import { MonedaService } from "../services/MonedaService";
import { EstatusService } from "../../auth/services/EstatusService";
import { useAuthStore } from "../../auth/store/useAuthStore";

/* UI compartida */
import {
  PageContainer,
  TableCard,
  Table,
  ActionBtn,
  Badge,
  FormGroup,
  ModalOverlay,
  ModalContent,
  Thumbnail
} from "../../../shared/components/UI";

const Header = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 20, justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap" }}>
    {children}
  </div>
);

const TitleSection = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div>
    <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
      <FiPackage /> {title}
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
      padding: "12px 20px",
      borderRadius: 12,
      fontWeight: 700,
      display: "flex",
      gap: 10,
      alignItems: "center",
      cursor: "pointer"
    }}
  >
    <FiPlus /> Nuevo Producto
  </button>
);

const SearchBar = ({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", maxWidth: 450, background: "var(--bg, #fff)", border: "1px solid rgba(0,0,0,0.06)", padding: "10px 14px", borderRadius: 14 }}>
    <FiSearch style={{ color: "var(--accent, #FCA311)" }} />
    <input placeholder="Buscar producto..." value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
  </div>
);

const Productos: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [estatusList, setEstatusList] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio_compra: 0,
    precio_venta: 0,
    stock: 0,
    fecha_vencimiento: "",
    imagen: "",
    id_categoria: "",
    id_moneda: "",
    id_unidad: "",
    id_status: ""
  });

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [resProd, resCats, resUnits, resCurrs, resStatus] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll(),
        MedidaService.getAll(),
        MonedaService.getAll(),
        EstatusService.getCatalogo()
      ]);

      const prodsNormalizados = (resProd.data || []).map((p: any) => ({ ...p, id_producto: p.id_producto || p.id }));
      setProducts(prodsNormalizados);
      setCategories(resCats.data || []);
      setUnits((resUnits.data || []).map((u: any) => ({ ...u, id_unidad: u.id_unidad || u.id_medida || u.id })));
      setCurrencies((resCurrs.data || []).map((c: any) => ({ ...c, id_moneda: c.id_moneda || c.id_divisa || c.id })));
      if (resStatus.success) setEstatusList(resStatus.data["2"]?.items || resStatus.data["1"]?.items || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => products.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase())), [products, search]);

  const openModal = (p?: Product) => {
    if (p) {
      setEditing(p);
      setFormData({
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        precio_compra: p.precio_compra,
        precio_venta: p.precio_venta,
        stock: p.stock,
        fecha_vencimiento: p.fecha_vencimiento ? p.fecha_vencimiento.split("T")[0] : "",
        imagen: p.imagen || "",
        id_categoria: p.id_categoria,
        id_moneda: p.id_moneda,
        id_unidad: p.id_unidad,
        id_status: p.id_status
      });
    } else {
      setEditing(null);
      const activeStatus = estatusList.find((e) => e.std_descripcion.toLowerCase().includes("activ"))?.id_status || "";
      setFormData({
        nombre: "", descripcion: "", precio_compra: 0, precio_venta: 0, stock: 0,
        fecha_vencimiento: "", imagen: "", id_categoria: "", id_moneda: "", id_unidad: "",
        id_status: activeStatus
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) return alert("Nombre obligatorio");
    if (!user?.id_sucursal) return alert("Error: No se identificó la sucursal");

    setSaving(true);
    try {
      const payload = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        id_sucursal: user.id_sucursal,
        precio_compra: Number(formData.precio_compra),
        precio_venta: Number(formData.precio_venta),
        stock: Number(formData.stock),
        fecha_vencimiento: formData.fecha_vencimiento ? new Date(formData.fecha_vencimiento).toISOString() : undefined
      };

      if (editing) {
        const id = editing.id_producto || editing.id;
        await ProductService.update(id!, payload as any);
        alert("Producto actualizado");
      } else {
        await ProductService.create(payload as any);
        alert("Producto creado");
      }
      await loadAllData();
      setIsModalOpen(false);
    } catch (error: any) {
      alert("Error al guardar: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("¿Eliminar producto?")) return;
    try {
      await ProductService.delete(id);
      await loadAllData();
      alert("Producto eliminado");
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  return (
    <PageContainer>
      <Header>
        <TitleSection title="Productos" subtitle="Gestión centralizada de inventario y precios" />

        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} disabled={isLoading} />
          <AddButton onClick={() => openModal()} disabled={isLoading} />
        </div>
      </Header>

      {isLoading && products.length === 0 ? (
        <div style={{ padding: 100, display: "flex", justifyContent: "center" }}>
          <ClimbingBoxLoader color="#FCA311" size={25} />
        </div>
      ) : (
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio Venta</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 50, opacity: 0.5 }}>No hay productos registrados.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id_producto}>
                    <td>
                      <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
                        {p.imagen ? <Thumbnail src={p.imagen} alt={p.nombre} /> : <div style={{ width: 50, height: 50, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><FiImage /></div>}
                        <div>
                          <div style={{ fontWeight: 800 }}>{p.nombre}</div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{p.descripcion?.substring(0, 40)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: "#22C55E" }}>{p.moneda?.nombre} {p.precio_venta?.toFixed?.(2)}</td>
                    <td><Badge>{p.stock} {p.unidad?.nombre}</Badge></td>
                    <td>{p.categoria?.nombre || "—"}</td>
                    <td><Badge $color="rgba(255,255,255,0.05)">{p.status?.std_descripcion || "—"}</Badge></td>
                    <td style={{ textAlign: "right" }}>
                      <ActionBtn onClick={() => openModal(p)}><FiEdit2 /></ActionBtn>
                      <ActionBtn $variant="delete" onClick={() => handleDelete(p.id_producto)}><FiTrash2 /></ActionBtn>
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
              <h2 style={{ margin: 0, fontSize: "1.6rem" }}>{editing ? "Editar Producto" : "Nuevo Producto"}</h2>
              <ActionBtn $variant="close" onClick={() => setIsModalOpen(false)}><FiX size={20} /></ActionBtn>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <FormGroup>
                  <label>Nombre del Producto</label>
                  <input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} placeholder="Ej: Cerveza Lager 355ml" required />
                </FormGroup>

                <FormGroup>
                  <label>Descripción</label>
                  <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Detalles del producto..." />
                </FormGroup>

                <div style={{ display: "flex", gap: 15 }}>
                  <FormGroup style={{ flex: 1 }}>
                    <label>Precio Compra</label>
                    <input type="number" value={formData.precio_compra} onChange={(e) => setFormData({ ...formData, precio_compra: Number(e.target.value) })} step="0.01" />
                  </FormGroup>
                  <FormGroup style={{ flex: 1 }}>
                    <label>Precio Venta</label>
                    <input type="number" value={formData.precio_venta} onChange={(e) => setFormData({ ...formData, precio_venta: Number(e.target.value) })} step="0.01" />
                  </FormGroup>
                </div>

                <div style={{ display: "flex", gap: 15 }}>
                  <FormGroup style={{ flex: 1 }}>
                    <label>Stock Inicial</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} />
                  </FormGroup>
                  <FormGroup style={{ flex: 1 }}>
                    <label>Moneda</label>
                    <select value={formData.id_moneda} onChange={(e) => setFormData({ ...formData, id_moneda: e.target.value })} required>
                      <option value="">Seleccione...</option>
                      {currencies.map(c => <option key={c.id_moneda} value={c.id_moneda}>{c.nombre}</option>)}
                    </select>
                  </FormGroup>
                </div>
              </div>

              <div>
                <FormGroup>
                  <label>Categoría</label>
                  <select value={formData.id_categoria} onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })} required>
                    <option value="">Seleccione...</option>
                    {categories.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Unidad de Medida</label>
                  <select value={formData.id_unidad} onChange={(e) => setFormData({ ...formData, id_unidad: e.target.value })} required>
                    <option value="">Seleccione...</option>
                    {units.map(u => <option key={u.id_unidad} value={u.id_unidad}>{u.nombre}</option>)}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Fecha de Vencimiento (Opcional)</label>
                  <input type="date" value={formData.fecha_vencimiento} onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })} />
                </FormGroup>

                <FormGroup>
                  <label>URL de Imagen</label>
                  <input value={formData.imagen} onChange={(e) => setFormData({ ...formData, imagen: e.target.value })} placeholder="https://..." />
                </FormGroup>

                <FormGroup>
                  <label>Estado</label>
                  <select value={formData.id_status} onChange={(e) => setFormData({ ...formData, id_status: e.target.value })} required>
                    <option value="">Seleccione...</option>
                    {estatusList.map(s => <option key={s.id_status} value={s.id_status}>{s.std_descripcion}</option>)}
                  </select>
                </FormGroup>
              </div>
            </div>

            <div style={{ display: "flex", gap: 15, justifyContent: "flex-end", marginTop: 25 }}>
              <button style={{ background: "rgba(255,255,255,0.05)", color: "inherit" }} onClick={() => setIsModalOpen(false)} disabled={saving}>Cancelar</button>
              <button style={{ background: "#FCA311", color: "#000" }} onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : (editing ? "Actualizar" : "Crear Producto")}
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default Productos;