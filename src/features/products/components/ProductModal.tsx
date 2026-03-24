import { useState, useEffect } from "react";
import { FiX, FiSave } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { useTheme } from "styled-components";
import { type Product } from "../services/ProductService";
import { useProductMutations } from "../hooks/useProductQueries";
import { ActionBtn, FormGroup, ModalOverlay, ModalContent, Button } from "../../../shared/components/UI";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    editingProduct: Product | null;
    categories: any[];
    units: any[];
    currencies: any[];
    sucursales: any[];
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
    sucursales,
    estatusList,
    userIdSucursal,
    onSuccess,
}) => {
    const theme = useTheme();
    const { createMutation, updateMutation } = useProductMutations();
    
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
        id_sucursal: "",
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
                id_sucursal: editingProduct.id_sucursal || "",
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
                id_sucursal: userIdSucursal || "",
            });
        }
    }, [isOpen, editingProduct, estatusList, currencies, userIdSucursal]);

    const handleChange = (key: keyof typeof formData, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) return alert("El nombre del producto es obligatorio.");
        if (!formData.id_sucursal) return alert("Debe seleccionar una sucursal.");

        const payload = {
            ...formData,
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim(),
            precio_compra: Number(formData.precio_compra),
            precio_venta: Number(formData.precio_venta),
            stock: Number(formData.stock),
            fecha_vencimiento: formData.fecha_vencimiento
                ? new Date(formData.fecha_vencimiento).toISOString()
                : undefined,
        };

        try {
            if (editingProduct) {
                const id = String(editingProduct.id_producto ?? (editingProduct as any).id ?? "");
                await updateMutation.mutateAsync({ id, payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error guardando producto:", error);
            alert("Error al guardar: " + (error?.response?.data?.message || error?.message || "Error desconocido"));
        }
    };

    const saving = createMutation.isPending || updateMutation.isPending;

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
              <label>Sucursal</label>
              <select
                value={formData.id_sucursal}
                onChange={(e) => handleChange("id_sucursal", e.target.value)}
                required
              >
                <option value="">Seleccione Sucursal...</option>
                {sucursales?.map((s: any) => {
                  const sid = s.id_sucursal || s.id;
                  return (
                    <option key={String(sid)} value={sid}>
                      {s.nombre || s.std_descripcion || s.nombre_sucursal}
                    </option>
                  );
                })}
              </select>
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
          <Button
            $variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <ClimbingBoxLoader size={12} color={theme.bg} /> : <><FiSave /> Confirmar</>}
          </Button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};