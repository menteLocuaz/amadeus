import React, { useMemo } from "react";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styled from "styled-components";

// UI Components
import {
    FormGroup, ModalHeader, ModalOverlay, ModalContent,
    Button, IconButton, Divider, Grid
} from "../../../shared/components/UI";

// Types
import { type Product } from "../../products/services/ProductService";
import { type Proveedor } from "../../proveedor/services/ProveedorService";
import { type Sucursal } from "../../proveedor/services/SucursalService";
import { type Moneda } from "../../moneda/services/MonedaService";

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

/** Item vacío por defecto al agregar una nueva fila */
const DEFAULT_ITEM = { id_producto: "", cantidad_pedida: 1, precio_unitario: 0, impuesto: 7 };

/** Genera un número de orden único basado en el año actual */
const generateOrderNumber = () =>
    `OC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;

// ─────────────────────────────────────────────
// ESQUEMAS DE VALIDACIÓN (Yup)
// ─────────────────────────────────────────────

const itemSchema = yup.object({
    id_producto: yup.string().required("Requerido"),
    cantidad_pedida: yup.number().typeError("Debe ser número").positive("Mín 1").required("Requerido"),
    precio_unitario: yup.number().typeError("Debe ser número").min(0, "No negativo").required("Requerido"),
    impuesto: yup.number().typeError("Debe ser número").min(0, "No negativo").required("Requerido"),
});

const orderSchema = yup.object({
    id_proveedor: yup.string().required("El proveedor es obligatorio"),
    id_sucursal: yup.string().required("La sucursal es obligatoria"),
    id_moneda: yup.string().required("La moneda es obligatoria"),
    id_status: yup.string().required("El estado es obligatorio"),
    numero_orden: yup.string().required("El Nº de Orden es requerido"),
    observaciones: yup.string().optional(),
    detalles: yup.array().of(itemSchema).min(1, "Al menos 1 producto"),
});

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

interface CompraModalProps {
    open: boolean;
    suppliers: Proveedor[];
    products: Product[];
    sucursales: Sucursal[];
    monedas: Moneda[];
    statuses: any[];
    saving: boolean;
    defaultSucursalId?: string;
    onClose: () => void;
    onSave: (data: any) => void;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Normaliza el id de una entidad que puede tener distintos nombres de campo */
const resolveId = (entity: any, ...keys: string[]) =>
    keys.reduce((acc, key) => acc ?? entity?.[key], undefined as any);

/** Normaliza el nombre de una entidad */
const resolveName = (entity: any, ...keys: string[]) =>
    keys.reduce((acc, key) => acc ?? entity?.[key], undefined as any);

/** Calcula subtotal + impuesto de un item */
const calcItemTotal = (qty = 0, price = 0, tax = 0) => {
    const sub = qty * price;
    return sub + sub * (tax / 100);
};

// ─────────────────────────────────────────────
// SUBCOMPONENTES
// ─────────────────────────────────────────────

/** Muestra un mensaje de error de validación */
const FieldError = ({ message }: { message?: string }) =>
    message ? <small style={{ color: "#EF4444" }}>{message}</small> : null;

/** Fila de un item del detalle de la orden */
const OrderItemRow = ({
    index,
    field,
    products,
    watchedDetails,
    saving,
    canRemove,
    register,
    remove,
}: any) => {
    const item = watchedDetails?.[index];
    const subtotal = (item?.cantidad_pedida || 0) * (item?.precio_unitario || 0);

    return (
        <ItemRow key={field.id}>
            {/* Selector de producto */}
            <FormGroup style={{ marginBottom: 0 }}>
                <select {...register(`detalles.${index}.id_producto`)} disabled={saving}>
                    <option value="">Producto...</option>
                    {products.map((p: any) => {
                        const pid = resolveId(p, "id_producto", "id");
                        const label = resolveName(p, "pro_nombre", "nombre", "pro_descripcion");
                        return <option key={pid} value={pid}>{label}</option>;
                    })}
                </select>
            </FormGroup>

            {/* Cantidad */}
            <FormGroup style={{ marginBottom: 0 }}>
                <input
                    type="number"
                    placeholder="Cant"
                    disabled={saving}
                    {...register(`detalles.${index}.cantidad_pedida`)}
                />
            </FormGroup>

            {/* Precio unitario */}
            <FormGroup style={{ marginBottom: 0 }}>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Costo"
                    disabled={saving}
                    {...register(`detalles.${index}.precio_unitario`)}
                />
            </FormGroup>

            {/* Impuesto (%) */}
            <FormGroup style={{ marginBottom: 0 }}>
                <input
                    type="number"
                    step="0.1"
                    placeholder="ITBMS %"
                    disabled={saving}
                    {...register(`detalles.${index}.impuesto`)}
                />
            </FormGroup>

            {/* Subtotal calculado (sin impuesto) */}
            <SubtotalCell>${subtotal.toLocaleString()}</SubtotalCell>

            {/* Botón eliminar fila — deshabilitado si solo queda 1 item */}
            <IconButton
                $danger
                type="button"
                onClick={() => remove(index)}
                disabled={saving || !canRemove}
            >
                <FiTrash2 />
            </IconButton>
        </ItemRow>
    );
};

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export const CompraModal: React.FC<CompraModalProps> = ({
    open, suppliers, products, sucursales,
    monedas, statuses, saving, defaultSucursalId, onClose, onSave,
}) => {
    // Busca el status "PENDIENTE" para pre-seleccionarlo al abrir el modal
    const defaultStatusId = useMemo(() => {
        const match = statuses.find(s => {
            const label = (s.descripcion || s.std_descripcion || s.nombre || "").toLowerCase();
            return label.includes("pend") || label.includes("solic");
        });
        return match?.id_status ?? statuses[0]?.id_status ?? "";
    }, [statuses]);

    // Primer moneda disponible como valor por defecto
    const defaultMonedaId = useMemo(
        () => resolveId(monedas[0], "id_moneda", "id") ?? "",
        [monedas]
    );

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(orderSchema),
        defaultValues: {
            id_sucursal: defaultSucursalId || "",
            id_proveedor: "",
            numero_orden: generateOrderNumber(),
            id_status: defaultStatusId,
            id_moneda: defaultMonedaId,
            observaciones: "",
            detalles: [DEFAULT_ITEM],
        },
    });

    // Asegura que los valores por defecto se apliquen cuando el modal se abre
    React.useEffect(() => {
        if (open) {
            reset({
                id_sucursal: defaultSucursalId || "",
                id_proveedor: "",
                numero_orden: generateOrderNumber(),
                id_status: defaultStatusId,
                id_moneda: defaultMonedaId,
                observaciones: "",
                detalles: [DEFAULT_ITEM],
            });
        }
    }, [open, defaultSucursalId, defaultStatusId, defaultMonedaId, reset]);

    const { fields, append, remove } = useFieldArray({ control, name: "detalles" });
    const watchedDetails = useWatch({ control, name: "detalles" });

    // Total general: suma de (subtotal + impuesto) por cada item
    const grandTotal = useMemo(
        () => (watchedDetails || []).reduce((acc, item) =>
            acc + calcItemTotal(item?.cantidad_pedida, item?.precio_unitario, item?.impuesto), 0),
        [watchedDetails]
    );

    // No renderiza nada si el modal está cerrado
    if (!open) return null;

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 1000 }}>
                <form onSubmit={handleSubmit(onSave)}>

                    {/* ── Encabezado ── */}
                    <ModalHeader>
                        <h2>Nueva Orden de Compra</h2>
                        <IconButton type="button" onClick={onClose}>
                            <FiPlus style={{ transform: "rotate(45deg)" }} />
                        </IconButton>
                    </ModalHeader>

                    {/* ── Campos generales de la orden ── */}
                    <Grid $cols="1fr 1fr 1fr" $gap="16px">

                        <FormGroup>
                            <label>Proveedor *</label>
                            <select {...register("id_proveedor")} disabled={saving}>
                                <option value="">Seleccione Proveedor</option>
                                {suppliers.map((s: any) => {
                                    const sid = resolveId(s, "id", "id_proveedor");
                                    return (
                                        <option key={sid} value={sid}>
                                            {resolveName(s, "nombre", "nombre_proveedor", "razon_social")}
                                        </option>
                                    );
                                })}
                            </select>
                            <FieldError message={errors.id_proveedor?.message} />
                        </FormGroup>

                        <FormGroup>
                            <label>Sucursal Destino *</label>
                            <select {...register("id_sucursal")} disabled={saving}>
                                <option value="">Seleccione Sucursal</option>
                                {sucursales.map((s: any) => {
                                    const sid = resolveId(s, "id", "id_sucursal");
                                    return (
                                        <option key={sid} value={sid}>
                                            {resolveName(s, "nombre", "nombre_sucursal", "std_descripcion")}
                                        </option>
                                    );
                                })}
                            </select>
                            <FieldError message={errors.id_sucursal?.message} />
                        </FormGroup>

                        <FormGroup>
                            <label>Número de Orden *</label>
                            <input {...register("numero_orden")} placeholder="OC-2024-..." disabled={saving} />
                            <FieldError message={errors.numero_orden?.message} />
                        </FormGroup>

                        <FormGroup>
                            <label>Moneda *</label>
                            <select {...register("id_moneda")} disabled={saving}>
                                <option value="">Seleccione Moneda</option>
                                {monedas.map((m: any) => {
                                    const mid = resolveId(m, "id_moneda", "id");
                                    return <option key={mid} value={mid}>{resolveName(m, "nombre", "nombre_moneda")}</option>;
                                })}
                            </select>
                            <FieldError message={errors.id_moneda?.message} />
                        </FormGroup>

                        <FormGroup>
                            <label>Estado Inicial *</label>
                            <select {...register("id_status")} disabled={saving}>
                                <option value="">Seleccione Estado</option>
                                {statuses.map(s => (
                                    <option key={s.id_status} value={s.id_status}>
                                        {resolveName(s, "descripcion", "std_descripcion", "nombre")}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.id_status?.message} />
                        </FormGroup>

                        <FormGroup>
                            <label>Observaciones</label>
                            <input {...register("observaciones")} placeholder="Opcional..." disabled={saving} />
                        </FormGroup>

                    </Grid>

                    <Divider />

                    {/* ── Encabezado de la sección de items ── */}
                    <ItemsHeader>
                        <h3>Detalle de Items</h3>
                        <Button
                            type="button"
                            $variant="secondary"
                            disabled={saving}
                            onClick={() => append(DEFAULT_ITEM)}
                        >
                            <FiPlus /> Agregar Item
                        </Button>
                    </ItemsHeader>

                    {/* ── Lista de items con scroll ── */}
                    <ItemsList>
                        {fields.map((field, index) => (
                            <OrderItemRow
                                key={field.id}
                                index={index}
                                field={field}
                                products={products}
                                watchedDetails={watchedDetails}
                                saving={saving}
                                canRemove={fields.length > 1}
                                register={register}
                                remove={remove}
                            />
                        ))}
                    </ItemsList>

                    {/* ── Total estimado ── */}
                    <TotalRow>
                        <span className="label">Total Estimado:</span>
                        <span className="amount">${grandTotal.toLocaleString()}</span>
                    </TotalRow>

                    <Divider />

                    {/* ── Acciones del formulario ── */}
                    <FooterActions>
                        <Button $variant="secondary" type="button" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving
                                ? <ClimbingBoxLoader size={8} color="#000" />
                                : <><FiSave /> Crear Orden</>
                            }
                        </Button>
                    </FooterActions>

                </form>
            </ModalContent>
        </ModalOverlay>
    );
};

// ─────────────────────────────────────────────
// ESTILOS LOCALES
// ─────────────────────────────────────────────

/** Fila de un item del detalle */
const ItemRow = styled.div`
    display: grid;
    grid-template-columns: 2fr 100px 120px 80px 100px 40px;
    gap: 12px;
    align-items: start;
    margin-bottom: 10px;
    background: rgba(0, 0, 0, 0.02);
    padding: 10px;
    border-radius: 12px;
`;

/** Celda del subtotal alineada a la derecha */
const SubtotalCell = styled.div`
    text-align: right;
    padding-top: 10px;
    font-weight: 700;
`;

/** Contenedor scrolleable de la lista de items */
const ItemsList = styled.div`
    max-height: 300px;
    overflow-y: auto;
    padding-right: 10px;
`;

/** Encabezado de la sección de items */
const ItemsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
`;

/** Fila del total estimado */
const TotalRow = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 20px;
    font-size: 1.2rem;
    font-weight: 800;

    .label  { opacity: 0.6; margin-right: 15px; }
    .amount { color: #FCA311; }
`;

/** Botones de acción al pie del modal */
const FooterActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
`;