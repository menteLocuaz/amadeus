import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { ProductService, type Product } from "../services/ProductService";
import { ActionBtn, FormGroup, ModalOverlay, ModalContent } from "../../../shared/components/UI";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: any[];
  units: any[];
  currencies: any[];
  estatusList: any[];
  userIdSucursal?: string;
  onSuccess: () => void;
}

export const ProductModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  units,
  currencies,
  estatusList,
  userIdSucursal,
  onSuccess,
}) => {
  const [saving, setSaving] = useState(false);
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
    id_status: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      setFormData({
        nombre: editingProduct.nombre || "",
        descripcion: editingProduct.descripcion || "",
        precio_compra: editingProduct.precio_compra ?? 0,
        precio_venta: editingProduct.precio_venta ?? 0,
        stock: editingProduct.stock ?? 0,
        fecha_vencimiento: editingProduct.fecha_vencimiento
          ? String(editingProduct.fecha_vencimiento).split("T")[0]
          : "",
        imagen: editingProduct.imagen || "",
        id_categoria: editingProduct.id_categoria || "",
        id_moneda: editingProduct.id_moneda || "",
        id_unidad: editingProduct.id_unidad || "",
        id_status: editingProduct.id_status || "",
      });
    } else {
      const activeStatus =
        estatusList.find((e: any) => String(e.std_descripcion).toLowerCase().includes("activ"))?.id_status || "";
      setFormData({
        nombre: "",
        descripcion: "",
        precio_compra: 0,
        precio_venta: 0,
        stock: 0,
        fecha_vencimiento: "",
        imagen: "",
        id_categoria: "",
        id_moneda: currencies?.[0]?.id_moneda || "",
        id_unidad: "",
        id_status: activeStatus,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingProduct, estatusList, currencies]);

  const handleChange = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      alert("El nombre del producto es obligatorio.");
      return;
    }
    if (!userIdSucursal) {
      alert("No se identificó la sucursal (id_sucursal).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        id_sucursal: userIdSucursal,
        precio_compra: Number(formData.precio_compra),
        precio_venta: Number(formData.precio_venta),
        stock: Number(formData.stock),
        fecha_vencimiento: formData.fecha_vencimiento
          ? new Date(formData.fecha_vencimiento).toISOString()
          : undefined,
      };

      if (editingProduct) {
        const id = String(editingProduct.id_producto ?? (editingProduct as any).id ?? "");
        if (!id) throw new Error("ID de producto no encontrado");
        await ProductService.update(id, payload as any);
      } else {
        await ProductService.create(payload as any);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error guardando producto:", error);
      alert("Error al guardar: " + (error?.response?.data?.message || error?.message || "Error desconocido"));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent style={{ maxWidth: 900 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2>
          <ActionBtn $variant="close" onClick={onClose} aria-label="Cerrar">
            <FiX size={18} />
          </ActionBtn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Columna izquierda */}
          <div>
            <FormGroup>
              <label>Nombre del Producto</label>
              <input
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Ej: Cerveza Lager 355ml"
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                placeholder="Detalles del producto..."
              />
            </FormGroup>

            <div style={{ display: "flex", gap: 12 }}>
              <FormGroup style={{ flex: 1 }}>
                <label>Precio Compra</label>
                <input
                  type="number"
                  value={formData.precio_compra}
                  onChange={(e) => handleChange("precio_compra", e.target.value)}
                  step="0.01"
                />
              </FormGroup>

              <FormGroup style={{ flex: 1 }}>
                <label>Precio Venta</label>
                <input
                  type="number"
                  value={formData.precio_venta}
                  onChange={(e) => handleChange("precio_venta", e.target.value)}
                  step="0.01"
                />
              </FormGroup>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <FormGroup style={{ flex: 1 }}>
                <label>Stock Inicial</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                />
              </FormGroup>

              <FormGroup style={{ flex: 1 }}>
                <label>Moneda</label>
                <select
                  value={formData.id_moneda}
                  onChange={(e) => handleChange("id_moneda", e.target.value)}
                  required
                >
                  <option value="">Seleccione Moneda...</option>
                  {currencies?.map((c: any) => (
                    <option key={String(c.id_moneda ?? c.id)} value={c.id_moneda ?? c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </FormGroup>
            </div>
          </div>

          {/* Columna derecha */}
          <div>
            <FormGroup>
              <label>Categoría</label>
              <select
                value={formData.id_categoria}
                onChange={(e) => handleChange("id_categoria", e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                {categories?.map((c: any) => (
                  <option key={String(c.id_categoria ?? c.id)} value={c.id_categoria ?? c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup>
              <label>Unidad de Medida</label>
              <select
                value={formData.id_unidad}
                onChange={(e) => handleChange("id_unidad", e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                {units?.map((u: any) => (
                  <option key={String(u.id_unidad ?? u.id)} value={u.id_unidad ?? u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </FormGroup>

            <FormGroup>
              <label>Fecha de Vencimiento (Opcional)</label>
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => handleChange("fecha_vencimiento", e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <label>URL de Imagen</label>
              <input
                value={formData.imagen}
                onChange={(e) => handleChange("imagen", e.target.value)}
                placeholder="https://..."
              />
            </FormGroup>

            <FormGroup>
              <label>Estado</label>
              <select
                value={formData.id_status}
                onChange={(e) => handleChange("id_status", e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                {estatusList?.map((s: any) => (
                  <option key={String(s.id_status ?? s.id)} value={s.id_status ?? s.id}>
                    {s.std_descripcion}
                  </option>
                ))}
              </select>
            </FormGroup>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
          <button
            style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "none" }}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              background: "#FCA311",
              color: "#000",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {saving ? <ClimbingBoxLoader size={12} color="#000" /> : "Confirmar"}
          </button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};