import { useState, useEffect, useRef, useCallback } from "react";
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

/**
 * ProductModal Component
 * Handles both creation and edition of products.
 * Includes auto-generation of SKU based on the product name.
 */
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

    // Ref to track if SKU was manually edited to stop auto-generation
    const skuManualRef = useRef(false);
    
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        codigo_barras: "",
        sku: "",
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

    /**
     * Generates a SKU from a product name.
     * Example: "Cerveza Lager 355ml" -> "CER-LAG-355"
     */
    const generateSku = (nombre: string): string =>
        nombre
            .trim()
            .toUpperCase()
            .split(/\s+/)
            .filter(Boolean)
            .map(w => w.replace(/[^A-Z0-9]/g, '').slice(0, 3))
            .filter(Boolean)
            .join('-')
            .slice(0, 20);

    // Initialize form data when modal opens or editingProduct changes
    useEffect(() => {
        if (!isOpen) return;

        skuManualRef.current = false;

        if (editingProduct) {
            setFormData({
                nombre: editingProduct.nombre || "",
                descripcion: editingProduct.descripcion || "",
                codigo_barras: editingProduct.codigo_barras || "",
                sku: editingProduct.sku || "",
                precio_compra: editingProduct.precio_compra ?? 0,
                precio_venta: editingProduct.precio_venta ?? 0,
                stock: editingProduct.stock ?? (editingProduct as any).stock_actual ?? 0,
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
            const activeStatus = estatusList.find((e: any) => 
                String(e.std_descripcion).toLowerCase().includes("activ")
            )?.id_status || "";

            setFormData({
                nombre: "",
                descripcion: "",
                codigo_barras: "",
                sku: "",
                precio_compra: 0,
                precio_venta: 0,
                stock: 0,
                fecha_vencimiento: "",
                imagen: "",
                id_categoria: "",
                id_moneda: currencies?.[0]?.id_moneda || currencies?.[0]?.id || "",
                id_unidad: "",
                id_status: activeStatus,
                id_sucursal: userIdSucursal || "",
            });
        }
    }, [isOpen, editingProduct, estatusList, currencies, userIdSucursal]);

    const handleChange = (key: keyof typeof formData, value: any) => {
        if (key === 'sku') skuManualRef.current = true;
        
        setFormData((prev) => {
            const next = { ...prev, [key]: value };
            // Auto-generate SKU only for new products if not manually edited
            if (key === 'nombre' && !editingProduct && !skuManualRef.current) {
                next.sku = generateSku(value);
            }
            return next;
        });
    };

    /**
     * Extracts error message from API response.
     */
    const extractErrorMsg = (error: any): string => {
        const data = error?.response?.data;
        if (!data) return error?.message ?? 'Error desconocido';
        if (typeof data === 'string') return data;
        return data.message || data.error || JSON.stringify(data);
    };

    const handleSave = async () => {
        // Basic Validation
        if (!formData.nombre.trim())  return alert("El nombre del producto es obligatorio.");
        if (!formData.id_sucursal)    return alert("Debe seleccionar una sucursal.");
        if (!formData.id_categoria)   return alert("Debe seleccionar una categoría.");
        if (!formData.id_unidad)      return alert("Debe seleccionar una unidad de medida.");

        // Construct payload: cleanup empty strings and format numbers/dates
        const payload: any = {
            nombre:        formData.nombre.trim(),
            descripcion:   formData.descripcion.trim(),
            precio_compra: Number(formData.precio_compra),
            precio_venta:  Number(formData.precio_venta),
            stock:         Number(formData.stock),
            id_categoria:  formData.id_categoria,
            id_moneda:     formData.id_moneda,
            id_unidad:     formData.id_unidad,
            id_status:     formData.id_status,
            id_sucursal:   formData.id_sucursal,
        };

        // Add optional fields only if they have a value
        if (formData.codigo_barras.trim()) payload.codigo_barras = formData.codigo_barras.trim();
        if (formData.sku.trim())           payload.sku = formData.sku.trim();
        if (formData.imagen.trim())        payload.imagen = formData.imagen.trim();
        
        // Fix: Send YYYY-MM-DD instead of full ISO string to avoid 400 errors on strict backends
        if (formData.fecha_vencimiento) {
            payload.fecha_vencimiento = formData.fecha_vencimiento; 
        }

        const options = {
            onSuccess: () => { 
                onSuccess(); 
                onClose(); 
            },
            onError: (error: any) => {
                console.error('Save Product Error. Payload:', payload, 'Response:', error?.response?.data);
                alert(`Error al guardar: ${extractErrorMsg(error)}`);
            },
        };

        if (editingProduct) {
            const id = String(editingProduct.id_producto || (editingProduct as any).id || "");
            updateMutation.mutate({ id, payload }, options);
        } else {
            createMutation.mutate(payload, options);
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;

    if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2>
          <ActionBtn $variant="close" onClick={onClose} aria-label="Cerrar">
            <FiX size={18} />
          </ActionBtn>
        </div>

        {/* Form Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          
          {/* Left Column: Identification & Pricing */}
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
                rows={3}
              />
            </FormGroup>

            <div style={{ display: "flex", gap: 12 }}>
              <FormGroup style={{ flex: 1 }}>
                <label>Código de Barras</label>
                <input
                  value={formData.codigo_barras}
                  onChange={(e) => handleChange("codigo_barras", e.target.value)}
                  placeholder="750..."
                />
              </FormGroup>

              <FormGroup style={{ flex: 1 }}>
                <label>SKU</label>
                <input
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="ABC-123"
                />
              </FormGroup>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <FormGroup style={{ flex: 1 }}>
                <label>Precio Compra</label>
                <input
                  type="number"
                  value={formData.precio_compra}
                  onChange={(e) => handleChange("precio_compra", e.target.value)}
                  step="0.01"
                  min="0"
                />
              </FormGroup>

              <FormGroup style={{ flex: 1 }}>
                <label>Precio Venta</label>
                <input
                  type="number"
                  value={formData.precio_venta}
                  onChange={(e) => handleChange("precio_venta", e.target.value)}
                  step="0.01"
                  min="0"
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
                  min="0"
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
                  {currencies?.map((c: any) => {
                    const id = c.id_moneda || c.id;
                    return (
                      <option key={String(id)} value={id}>
                        {c.nombre}
                      </option>
                    );
                  })}
                </select>
              </FormGroup>
            </div>
          </div>

          {/* Right Column: Categories & Logistics */}
          <div>
            <FormGroup>
              <label>Categoría</label>
              <select
                value={formData.id_categoria}
                onChange={(e) => handleChange("id_categoria", e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                {categories?.map((c: any) => {
                  const id = c.id_categoria || c.id;
                  return (
                    <option key={String(id)} value={id}>
                      {c.nombre}
                    </option>
                  );
                })}
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
                {units?.map((u: any) => {
                  const id = u.id_unidad || u.id;
                  return (
                    <option key={String(id)} value={id}>
                      {u.nombre}
                    </option>
                  );
                })}
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
                      {s.nombre || s.nombre_sucursal || s.std_descripcion}
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
                {estatusList?.map((s: any) => {
                  const sid = s.id_status || s.id;
                  return (
                    <option key={String(sid)} value={sid}>
                      {s.std_descripcion}
                    </option>
                  );
                })}
              </select>
            </FormGroup>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
          <Button
            $variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ClimbingBoxLoader size={12} color={theme.bg} />
            ) : (
              <><FiSave /> Confirmar</>
            )}
          </Button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};