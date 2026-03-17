import React, { useState } from "react";
import { FiPlus, FiTrash2, FiCheck, FiDownload } from "react-icons/fi";
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
import { PurchaseService, type PurchaseOrder } from "../services/PurchaseService";
import { type Product } from "../../products/services/ProductService";
import { type Proveedor } from "../../proveedor/services/ProveedorService";

/* -------------------- Validations -------------------- */
const purchaseItemSchema = yup.object().shape({
    id_producto: yup.string().required("Requerido"),
    cantidad: yup.number().typeError("Debe ser numero").positive("Min 1").required("Requerido"),
    precio_unitario: yup.number().typeError("Debe ser numero").min(0, "No negativo").required("Requerido"),
});

const purchaseOrderSchema = yup.object().shape({
    id_proveedor: yup.string().required("Proveedor es requerido"),
    codigo_orden: yup.string().optional(),
    fecha_emision: yup.string().required("Requerido"),
    fecha_llegada_estimada: yup.string().optional(),
    nota: yup.string().optional(),
    items: yup.array().of(purchaseItemSchema).min(1, "Al menos 1 producto"),
});

/* ---------------------- OrderForm Component ---------------------- */
interface OrderFormProps {
    suppliers: Proveedor[];
    products: Product[];
    initial: PurchaseOrder | null;
    onCancel: () => void;
    onSaved: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ suppliers, products, initial, onCancel, onSaved }) => {
    const [saving, setSaving] = useState(false);
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(purchaseOrderSchema),
        defaultValues: initial ? {
            id_proveedor: initial.id_proveedor,
            codigo_orden: initial.codigo_orden,
            fecha_emision: initial.fecha_emision.slice(0, 10),
            fecha_llegada_estimada: initial.fecha_llegada_estimada?.slice(0, 10),
            nota: initial.nota,
            items: initial.items.map(it => ({
                id_producto: it.id_producto,
                cantidad: it.cantidad,
                precio_unitario: it.precio_unitario
            }))
        } : {
            fecha_emision: new Date().toISOString().slice(0, 10),
            items: [{ id_producto: "", cantidad: 1, precio_unitario: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const onSubmit = async (data: any) => {
        setSaving(true);
        try {
            if (initial) {
                await PurchaseService.update(initial.id, data);
            } else {
                await PurchaseService.create(data);
            }
            onSaved();
        } catch (err) {
            console.error(err);
            alert("Error al guardar la orden");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
                <h2>{initial ? "Editar Orden" : "Nueva Orden de Compra"}</h2>
                <IconButton type="button" onClick={onCancel}><FiCheck style={{ transform: 'rotate(45deg)' }} /></IconButton>
            </ModalHeader>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <FormGroup>
                    <label>Proveedor</label>
                    <select {...register("id_proveedor")} disabled={saving}>
                        <option value="">Seleccione Proveedor</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    {errors.id_proveedor && <small style={{ color: "#EF4444" }}>{errors.id_proveedor.message}</small>}
                </FormGroup>

                <FormGroup>
                    <label>Codigo Orden (Opcional)</label>
                    <input {...register("codigo_orden")} placeholder="OC-0001" disabled={saving} />
                </FormGroup>

                <FormGroup>
                    <label>Fecha Emision</label>
                    <input type="date" {...register("fecha_emision")} disabled={saving} />
                    {errors.fecha_emision && <small style={{ color: "#EF4444" }}>{errors.fecha_emision.message}</small>}
                </FormGroup>

                <FormGroup>
                    <label>Llegada Estimada</label>
                    <input type="date" {...register("fecha_llegada_estimada")} disabled={saving} />
                </FormGroup>

                <FormGroup style={{ gridColumn: "span 2" }}>
                    <label>Nota Interna</label>
                    <input {...register("nota")} placeholder="Ej: Entrega en almacen" disabled={saving} />
                </FormGroup>
            </div>

            <Divider />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                <h3>Productos</h3>
                <Button type="button" $variant="secondary" onClick={() => append({ id_producto: "", cantidad: 1, precio_unitario: 0 })} disabled={saving}>
                    <FiPlus /> Agregar Item
                </Button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
                {fields.map((field, index) => (
                    <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 50px", gap: 12, alignItems: "start" }}>
                        <FormGroup>
                            <select {...register(`items.${index}.id_producto`)} disabled={saving}>
                                <option value="">Seleccione Producto</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            {errors.items?.[index]?.id_producto && <small style={{ color: "#EF4444" }}>{errors.items[index]?.id_producto?.message}</small>}
                        </FormGroup>

                        <FormGroup>
                            <input type="number" {...register(`items.${index}.cantidad`)} placeholder="Cant" disabled={saving} />
                            {errors.items?.[index]?.cantidad && <small style={{ color: "#EF4444" }}>{errors.items[index]?.cantidad?.message}</small>}
                        </FormGroup>

                        <FormGroup>
                            <input type="number" step="0.01" {...register(`items.${index}.precio_unitario`)} placeholder="Precio Unit" disabled={saving} />
                            {errors.items?.[index]?.precio_unitario && <small style={{ color: "#EF4444" }}>{errors.items[index]?.precio_unitario?.message}</small>}
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
                    {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Guardar Orden</>}
                </Button>
            </div>
        </form>
    );
};

/* ---------------------- ReceiveForm Component ---------------------- */
interface ReceiveFormProps {
    order: PurchaseOrder;
    onCancel: () => void;
    onSaved: () => void;
}

export const ReceiveForm: React.FC<ReceiveFormProps> = ({ order, onCancel, onSaved }) => {
    const [saving, setSaving] = useState(false);
    const { register, handleSubmit } = useForm({
        defaultValues: {
            invoice_number: order.invoice_number || "",
            items: order.items.map(it => ({
                id_item: it.id,
                nombre: it.producto?.nombre,
                solicitado: it.cantidad,
                recibido_prev: it.received_qty || 0,
                recibir_ahora: 0
            }))
        }
    });

    const onSubmit = async (data: any) => {
        const payload = {
            invoice_number: data.invoice_number,
            items: data.items.map((it: any) => ({
                id_item: it.id_item,
                cantidad: Number(it.recibir_ahora)
            })).filter((it: any) => it.cantidad > 0)
        };

        if (payload.items.length === 0) {
            alert("Indique al menos una cantidad a recibir");
            return;
        }

        setSaving(true);
        try {
            await PurchaseService.receive(order.id, payload);
            onSaved();
        } catch (err) {
            console.error(err);
            alert("Error al registrar la recepci\u00f3n");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader>
                <h2>Registrar Recepci\u00f3n \u2014 {order.codigo_orden}</h2>
                <IconButton type="button" onClick={onCancel}><FiCheck style={{ transform: 'rotate(45deg)' }} /></IconButton>
            </ModalHeader>

            <FormGroup>
                <label>N\u00famero de Factura / Gu\u00eda</label>
                <input {...register("invoice_number")} placeholder="Ej: F001-000123" disabled={saving} />
            </FormGroup>

            <div style={{ marginTop: 20 }}>
                <h3 style={{ marginBottom: 15 }}>Productos a Recibir</h3>
                <div style={{ display: "grid", gap: 12 }}>
                    {order.items.map((it, idx) => (
                        <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 120px", gap: 12, alignItems: "center", padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.02)" }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{it.producto?.nombre}</div>
                                <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>SKU: {it.producto?.sku || 'N/A'}</div>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", opacity: 0.5, textTransform: "uppercase" }}>Pedido</label>
                                <strong>{it.cantidad} {it.producto?.unidad || ""}</strong>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <label style={{ display: "block", fontSize: "0.7rem", opacity: 0.5, textTransform: "uppercase" }}>Ya Recibido</label>
                                <strong>{it.received_qty || 0}</strong>
                            </div>
                            <FormGroup style={{ marginBottom: 0 }}>
                                <input
                                    type="number"
                                    {...register(`items.${idx}.recibir_ahora` as const)}
                                    max={it.cantidad - (it.received_qty || 0)}
                                    min={0}
                                    placeholder="0"
                                    disabled={saving || (it.received_qty || 0) >= it.cantidad}
                                />
                            </FormGroup>
                        </div>
                    ))}
                </div>
            </div>

            <Divider />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 }}>
                <Button $variant="secondary" type="button" onClick={onCancel} disabled={saving}>Cancelar</Button>
                <Button type="submit" disabled={saving}>
                    {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiDownload /> Registrar Ingreso</>}
                </Button>
            </div>
        </form>
    );
};
