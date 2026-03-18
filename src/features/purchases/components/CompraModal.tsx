import React, { useState } from "react";
import { FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// UI Components
import {
    FormGroup, ModalHeader
} from "../../../shared/components/UI";
import { Button, IconButton, Divider } from "../../../shared/components/UI/atoms";

// Services & Types
import { type Product } from "../../products/services/ProductService";
import { type Proveedor } from "../../proveedor/services/ProveedorService";

/* -------------------- Validations -------------------- */
const purchaseItemSchema = yup.object().shape({
    id_producto: yup.string().required("Requerido"),
    cantidad: yup.number().typeError("Debe ser numero").positive("Min 1").required("Requerido"),
    precio_unitario: yup.number().typeError("Debe ser numero").min(0, "No negativo").required("Requerido"),
});

const purchaseOrderSchema = yup.object().shape({
    id_proveedor: yup.string().optional(),
    codigo_orden: yup.string().optional(),
    fecha_emision: yup.string().required("Requerido"),
    nota: yup.string().optional(),
    items: yup.array().of(purchaseItemSchema).min(1, "Al menos 1 producto"),
});

/* ---------------------- OrderForm Component (Abastecimiento) ---------------------- */
interface OrderFormProps {
    suppliers: Proveedor[];
    products: Product[];
    onCancel: () => void;
    onSaved: (data: any) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ suppliers, products, onCancel, onSaved }) => {
    const [saving, setSaving] = useState(false);
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(purchaseOrderSchema),
        defaultValues: {
            fecha_emision: new Date().toISOString().slice(0, 10),
            items: [{ id_producto: "", cantidad: 1, precio_unitario: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const onSubmit = async (data: any) => {
        setSaving(true);
        try {
            await onSaved(data);
        } catch (err) {
            console.error(err);
            alert("Error al registrar la entrada de inventario");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
                <h2>Registrar Entrada de Mercancía</h2>
                <IconButton type="button" onClick={onCancel}><FiCheck style={{ transform: 'rotate(45deg)' }} /></IconButton>
            </ModalHeader>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <FormGroup>
                    <label>Proveedor (Opcional)</label>
                    <select {...register("id_proveedor")} disabled={saving}>
                        <option value="">Seleccione Proveedor</option>
                        {suppliers.map((s: any) => {
                            const sid = s.id || s.id_proveedor;
                            const sName = s.nombre || s.nombre_proveedor || s.std_descripcion || "Proveedor";
                            return <option key={sid} value={sid}>{sName}</option>;
                        })}
                    </select>
                </FormGroup>

                <FormGroup>
                    <label>Referencia / Documento</label>
                    <input {...register("codigo_orden")} placeholder="Ej: Factura #123 o Guía" disabled={saving} />
                </FormGroup>
            </div>

            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                <h3>Productos a Ingresar</h3>
                <Button type="button" $variant="secondary" onClick={() => append({ id_producto: "", cantidad: 1, precio_unitario: 0 })} disabled={saving}>
                    <FiPlus /> Agregar Item
                </Button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
                {fields.map((field, index) => (
                    <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 50px", gap: 12, alignItems: "start" }}>
                        <FormGroup>
                            <select {...register(`items.${index}.id_producto` as const)} disabled={saving}>
                                <option value="">Seleccione Producto</option>
                                {products.map((p: any) => {
                                    const pid = p.id || p.id_producto;
                                    const pName = p.nombre || p.std_descripcion || "Producto";
                                    return <option key={pid} value={pid}>{pName}</option>;
                                })}
                            </select>
                            {errors.items?.[index]?.id_producto && (
                                <small style={{ color: "#EF4444" }}>{errors.items[index]?.id_producto?.message}</small>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <input type="number" {...register(`items.${index}.cantidad` as const)} placeholder="Cant" disabled={saving} />
                            {errors.items?.[index]?.cantidad && (
                                <small style={{ color: "#EF4444" }}>{errors.items[index]?.cantidad?.message}</small>
                            )}
                        </FormGroup>

                        <FormGroup>
                            <input type="number" step="0.01" {...register(`items.${index}.precio_unitario` as const)} placeholder="Precio Unit" disabled={saving} />
                            {errors.items?.[index]?.precio_unitario && (
                                <small style={{ color: "#EF4444" }}>{errors.items[index]?.precio_unitario?.message}</small>
                            )}
                        </FormGroup>

                        <IconButton $danger type="button" onClick={() => remove(index)} disabled={saving || fields.length === 1}>
                            <FiTrash2 />
                        </IconButton>
                    </div>
                ))}
            </div>

            <Divider />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <Button $variant="secondary" type="button" onClick={onCancel} disabled={saving}>Cancelar</Button>
                <Button type="submit" disabled={saving}>
                    {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Registrar Ingreso</>}
                </Button>
            </div>
        </form>
    );
};
