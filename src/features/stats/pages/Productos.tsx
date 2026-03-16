import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ClimbingBoxLoader } from "react-spinners";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiImage, FiPackage } from "react-icons/fi";
import { ProductService, type Product } from "../../products/services/ProductService";
import { CategoryService } from "../../products/services/CategoryService";
import { MedidaService } from "../../products/services/MedidaService";
import { MonedaService } from "../../products/services/MonedaService";
import { EstatusService } from "../../auth/services/EstatusService";
import { useAuthStore } from "../../auth/store/useAuthStore";

// ---------- Styled Components ----------
const Container = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 28px;
`;

const Header = styled.div`
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    color: ${({ theme }) => theme.bg4};
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.texttertiary};
    margin-top: 5px;
  }
`;

const AddButton = styled.button`
  background: ${({ theme }) => theme.bg4};
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(252, 163, 17, 0.2); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  max-width: 450px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 12px 18px;
  border-radius: 14px;
  transition: all 0.2s;
  &:focus-within { border-color: ${({ theme }) => theme.bg4}; box-shadow: 0 0 0 2px ${({ theme }) => theme.bg4}22; }
  input { border: none; outline: none; width: 100%; background: transparent; color: ${({ theme }) => theme.text}; font-size: 1rem; }
  svg { color: ${({ theme }) => theme.bg4}; }
`;

const TableCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg3}22;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    background: ${({ theme }) => theme.bg2};
    padding: 18px;
    text-align: left;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.bg4};
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }
  td {
    padding: 18px;
    border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
    color: ${({ theme }) => theme.text};
    vertical-align: middle;
  }
`;

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg2};
`;

const ActionBtn = styled.button<{ $variant?: "edit" | "delete" }>`
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${({ $variant, theme }) => ($variant === "delete" ? "#ff4d4d" : theme.bg4)};
  border-radius: 8px;
  font-size: 1.2rem;
  transition: all 0.2s;
  &:hover { background: ${({ $variant }) => ($variant === "delete" ? "rgba(255,77,77,0.1)" : "rgba(252,163,17,0.1)")}; }
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(252, 163, 17, 0.1);
  color: ${({ theme }) => theme.bg4};
`;

/* Modal */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 3000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.bg};
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  border: 1px solid ${({ theme }) => theme.bg3}33;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.bg3}; border-radius: 10px; }
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
  label { display: block; font-weight: 700; margin-bottom: 8px; color: ${({ theme }) => theme.bg4}; font-size: 0.9rem; }
  input, select, textarea {
    width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid ${({ theme }) => theme.bg3}33;
    background: ${({ theme }) => theme.bg2}; outline: none; color: ${({ theme }) => theme.text};
    &:focus { border-color: ${({ theme }) => theme.bg4}; }
  }
  textarea { min-height: 80px; resize: vertical; }
`;

const ModalFooter = styled.div`
  display:flex; gap: 15px; justify-content: flex-end; margin-top: 25px;
  button { padding: 14px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
`;

// ---------- Component ----------
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

  useEffect(() => {
    loadAllData();
  }, []);

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

      const prodsNormalizados = (resProd.data || []).map((p: any) => ({
        ...p,
        id_producto: p.id_producto || p.id
      }));
      setProducts(prodsNormalizados);
      setCategories(resCats.data || []);
      
      // Normalizar unidades (pueden venir como id_unidad o id_medida)
      setUnits((resUnits.data || []).map((u:any) => ({ ...u, id_unidad: u.id_unidad || u.id_medida || u.id })));
      
      // Normalizar monedas
      setCurrencies((resCurrs.data || []).map((c:any) => ({ ...c, id_moneda: c.id_moneda || c.id_divisa || c.id })));
      
      // Estatus del módulo 2 (Inventario)
      if (resStatus.success) {
        setEstatusList(resStatus.data["2"]?.items || resStatus.data["1"]?.items || []);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() =>
    products.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const openModal = (p?: Product) => {
    if (p) {
      setEditing(p);
      setFormData({
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        precio_compra: p.precio_compra,
        precio_venta: p.precio_venta,
        stock: p.stock,
        fecha_vencimiento: p.fecha_vencimiento ? p.fecha_vencimiento.split('T')[0] : "",
        imagen: p.imagen || "",
        id_categoria: p.id_categoria,
        id_moneda: p.id_moneda,
        id_unidad: p.id_unidad,
        id_status: p.id_status
      });
    } else {
      setEditing(null);
      const activeStatus = estatusList.find(e => e.std_descripcion.toLowerCase().includes("activ"))?.id_status || "";
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
        // Asegurar tipos correctos para la API
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
      loadAllData();
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
      loadAllData();
      alert("Producto eliminado");
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <h1><FiPackage /> Productos</h1>
          <p>Gestión centralizada de inventario y precios</p>
        </TitleSection>

        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <SearchBar>
            <FiSearch />
            <input placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </SearchBar>
          <AddButton onClick={() => openModal()} disabled={isLoading}>
            <FiPlus size={20} /> Nuevo Producto
          </AddButton>
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
                    <td style={{ fontWeight: 700, color: "#22C55E" }}>{p.moneda?.nombre} {p.precio_venta.toFixed(2)}</td>
                    <td><Badge>{p.stock} {p.unidad?.nombre}</Badge></td>
                    <td>{p.categoria?.nombre || "—"}</td>
                    <td><Badge style={{ background: "rgba(255,255,255,0.05)" }}>{p.status?.std_descripcion || "—"}</Badge></td>
                    <td style={{ textAlign: "right" }}>
                      <ActionBtn onClick={() => openModal(p)} title="Editar"><FiEdit2 /></ActionBtn>
                      <ActionBtn $variant="delete" onClick={() => handleDelete(p.id_producto)} title="Eliminar"><FiTrash2 /></ActionBtn>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableCard>
      )}

      {isModalOpen && (
        <Overlay>
          <Modal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
              <h2 style={{ margin: 0, fontSize: "1.6rem" }}>{editing ? "Editar Producto" : "Nuevo Producto"}</h2>
              <ActionBtn onClick={() => setIsModalOpen(false)}><FiX size={24} /></ActionBtn>
            </div>

            <ModalGrid>
              <div>
                <FormGroup>
                  <label>Nombre del Producto</label>
                  <input value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Cerveza Lager 355ml" required />
                </FormGroup>

                <FormGroup>
                  <label>Descripción</label>
                  <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} placeholder="Detalles del producto..." />
                </FormGroup>

                <div style={{ display: "flex", gap: 15 }}>
                  <FormGroup style={{ flex: 1 }}>
                    <label>Precio Compra</label>
                    <input type="number" value={formData.precio_compra} onChange={(e) => setFormData({...formData, precio_compra: Number(e.target.value)})} step="0.01" />
                  </FormGroup>
                  <FormGroup style={{ flex: 1 }}>
                    <label>Precio Venta</label>
                    <input type="number" value={formData.precio_venta} onChange={(e) => setFormData({...formData, precio_venta: Number(e.target.value)})} step="0.01" />
                  </FormGroup>
                </div>

                <div style={{ display: "flex", gap: 15 }}>
                  <FormGroup style={{ flex: 1 }}>
                    <label>Stock Inicial</label>
                    <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} />
                  </FormGroup>
                  <FormGroup style={{ flex: 1 }}>
                    <label>Moneda</label>
                    <select value={formData.id_moneda} onChange={(e) => setFormData({...formData, id_moneda: e.target.value})} required>
                      <option value="">Seleccione...</option>
                      {currencies.map(c => <option key={c.id_moneda} value={c.id_moneda}>{c.nombre}</option>)}
                    </select>
                  </FormGroup>
                </div>
              </div>

              <div>
                <FormGroup>
                  <label>Categoría</label>
                  <select value={formData.id_categoria} onChange={(e) => setFormData({...formData, id_categoria: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    {categories.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Unidad de Medida</label>
                  <select value={formData.id_unidad} onChange={(e) => setFormData({...formData, id_unidad: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    {units.map(u => <option key={u.id_unidad} value={u.id_unidad}>{u.nombre}</option>)}
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Fecha de Vencimiento (Opcional)</label>
                  <input type="date" value={formData.fecha_vencimiento} onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})} />
                </FormGroup>

                <FormGroup>
                  <label>URL de Imagen</label>
                  <input value={formData.imagen} onChange={(e) => setFormData({...formData, imagen: e.target.value})} placeholder="https://..." />
                </FormGroup>

                <FormGroup>
                  <label>Estado</label>
                  <select value={formData.id_status} onChange={(e) => setFormData({...formData, id_status: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    {estatusList.map(s => <option key={s.id_status} value={s.id_status}>{s.std_descripcion}</option>)}
                  </select>
                </FormGroup>
              </div>
            </ModalGrid>

            <ModalFooter>
              <button style={{ background: "rgba(255,255,255,0.05)", color: "inherit" }} onClick={() => setIsModalOpen(false)} disabled={saving}>Cancelar</button>
              <button style={{ background: "#FCA311", color: "#000" }} onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : (editing ? "Actualizar" : "Crear Producto")}
              </button>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}
    </Container>
  );
};

export default Productos;
