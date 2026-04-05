import React, { useState, useEffect } from "react";
import { useTheme } from "styled-components";
import { FiX, FiCheck, FiPackage, FiCalendar, FiUser, FiMapPin, FiFileText, FiTag } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import {
    ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup, Button, Divider
} from "../../../shared/components/UI";

import { type Compra } from "../services/PurchaseService";
import { type Product } from "../../products/services/ProductService";
import { useOrderDetail } from "../hooks/useComprasQuery";
import { formatDate } from "../../../utils/dateUtils";

interface RecepcionModalProps {
    open: boolean;
    order: Compra | null;
    products?: Product[];
    statuses: any[];
    receiving: boolean;
    onClose: () => void;
    onConfirm: (payload: any) => void;
}

export const RecepcionModal: React.FC<RecepcionModalProps> = ({
    open,
    order,
    products = [],
    statuses,
    receiving,
    onClose,
    onConfirm
}) => {
    const theme = useTheme() as any;
    const [idStatus, setIdStatus] = useState("");
    const [items, setItems] = useState<any[]>([]);

    const orderId = (order as any)?.id_orden_compra || order?.id || "";
    const { data: fullOrder, isLoading: isLoadingDetails } = useOrderDetail(orderId);

    useEffect(() => {
        if (fullOrder && fullOrder.detalles) {
            setItems(fullOrder.detalles.map((d: any) => {
                const prodId = d.id_producto;
                const prodFromList = products.find(p => (p.id || p.id_producto) === prodId);

                const productName = d.producto?.nombre || d.producto?.std_descripcion || d.producto?.descripcion || prodFromList?.nombre || "Producto";

                return {
                    id_detalle_compra: d.id_detalle_compra || d.id,
                    id_producto: prodId,
                    nombre: productName,
                    unidad: d.producto?.unidad?.nombre || prodFromList?.unidad?.nombre,
                    cantidad_pedida: d.cantidad_pedida,
                    cantidad_recibida: d.cantidad_pedida,
                    precio_unitario: d.precio_unitario || 0
                };
            }));

            const recibido = statuses.find(s => (s.nombre || "").toLowerCase().includes("recib"));
            if (recibido) setIdStatus(recibido.id_status);
        }
    }, [fullOrder, statuses, products]);

    if (!open || !order) return null;

    const handleQtyChange = (index: number, val: string) => {
        const qty = Number(val);
        setItems(prev => {
            const next = [...prev];
            next[index].cantidad_recibida = qty;
            return next;
        });
    };

    const handleSave = () => {
        if (!idStatus) return alert("Seleccione un estado para la recepción");

        if (items.length === 0) {
            return alert("Error: La orden no contiene productos para recibir.");
        }

        const hasInvalidQty = items.some(i => Number(i.cantidad_recibida) <= 0);
        if (hasInvalidQty) {
            return alert("Error: La cantidad de recepción no puede ser 0 ni negativa.");
        }

        if (!orderId) {
            return alert("No se pudo determinar el ID de la orden de compra.");
        }

        const payload = {
            id_orden_compra: orderId,
            id_status: idStatus,
            items: items.map(i => ({
                id_detalle_compra: i.id_detalle_compra,
                id_producto: i.id_producto,
                cantidad_recibida: Number(i.cantidad_recibida)
            }))
        };

        onConfirm(payload);
    };

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 850 }}>
                <ModalHeader>
                    <h2><FiPackage /> Recepción de Mercancía</h2>
                    <ActionBtn $variant="close" onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                {isLoadingDetails ? (
                    <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                        <ClimbingBoxLoader color={theme.primary} size={10} />
                        <p style={{ opacity: 0.6 }}>Cargando detalles de la orden...</p>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "15px",
                            marginBottom: "20px",
                            padding: "15px",
                            backgroundColor: "rgba(0,0,0,0.03)",
                            borderRadius: "12px"
                        }}>
                            <div>
                                <small style={{ opacity: 0.6, display: "block", marginBottom: "4px" }}>Número de Orden</small>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                                    <FiTag color={theme.primary} /> {fullOrder?.numero_orden || order.numero_orden}
                                </div>
                            </div>
                            <div>
                                <small style={{ opacity: 0.6, display: "block", marginBottom: "4px" }}>Proveedor</small>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.05rem" }}>
                                        <FiUser color={theme.primary} /> {fullOrder?.proveedor?.nombre || order.proveedor?.nombre || "N/A"}
                                    </div>
                                    {(fullOrder?.proveedor as any)?.ruc && (
                                        <small style={{ opacity: 0.7, marginLeft: "24px" }}>RUC: {(fullOrder?.proveedor as any).ruc}</small>
                                    )}
                                </div>
                            </div>
                            <div>
                                <small style={{ opacity: 0.6, display: "block", marginBottom: "4px" }}>Contacto</small>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                                        {(fullOrder?.proveedor as any)?.telefono || "Sin teléfono"}
                                    </div>
                                    <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                                        {(fullOrder?.proveedor as any)?.email || ""}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <small style={{ opacity: 0.6, display: "block", marginBottom: "4px" }}>Sucursal</small>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                                    <FiMapPin color={theme.primary} /> {fullOrder?.sucursal?.nombre || "Sucursal Principal"}
                                </div>
                            </div>
                            <div>
                                <small style={{ opacity: 0.6, display: "block", marginBottom: "4px" }}>Fecha Creación</small>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                                    <FiCalendar color={theme.primary} /> {formatDate(fullOrder?.fecha_creacion || order.fecha_creacion)}
                                </div>
                            </div>
                        </div>

                        {fullOrder?.observaciones && (
                            <div style={{ marginBottom: 20, padding: "0 10px", borderLeft: `3px solid ${theme.primary}` }}>
                                <small style={{ opacity: 0.6, display: "flex", alignItems: "center", gap: "5px" }}><FiFileText /> Observaciones:</small>
                                <p style={{ fontSize: "0.9rem", margin: "4px 0", fontStyle: "italic" }}>{fullOrder.observaciones}</p>
                            </div>
                        )}

                        <div style={{ background: "rgba(0,0,0,0.02)", padding: 15, borderRadius: 12, marginBottom: 20 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 1.5fr", gap: 10, paddingBottom: 10, borderBottom: "2px solid rgba(0,0,0,0.05)", opacity: 0.8, fontSize: "0.85rem", fontWeight: 700 }}>
                                <div>Descripción del Producto</div>
                                <div style={{ textAlign: "right" }}>Precio Unit.</div>
                                <div style={{ textAlign: "center" }}>Cant. Pedida</div>
                                <div style={{ textAlign: "right" }}>Cant. Recibida</div>
                                <div style={{ textAlign: "right" }}>Subtotal Rec.</div>
                            </div>
                            <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "10px" }}>
                                {items.map((it, idx) => (
                                    <div key={it.id_detalle_compra} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 1.5fr", gap: 10, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                                        <div>
                                            <div style={{ fontSize: "1rem", fontWeight: 700, color: theme.text }}>{it.nombre}</div>
                                            <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                                                <small style={{ opacity: 0.6, backgroundColor: "rgba(0,0,0,0.05)", padding: "1px 6px", borderRadius: "4px", fontSize: "0.75rem" }}>
                                                    ID: {it.id_producto?.substring(0, 8)}...
                                                </small>
                                                {it.unidad && (
                                                    <small style={{ opacity: 0.6, backgroundColor: `${theme.primary}18`, color: theme.primary, padding: "1px 6px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                        {it.unidad}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right", fontSize: "0.95rem" }}>${Number(it.precio_unitario).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        <div style={{ textAlign: "center", fontWeight: 600, fontSize: "1rem" }}>{it.cantidad_pedida}</div>
                                        <div style={{ textAlign: "right" }}>
                                            <input
                                                type="number"
                                                value={it.cantidad_recibida}
                                                onChange={(e) => handleQtyChange(idx, e.target.value)}
                                                style={{
                                                    width: 80,
                                                    textAlign: "right",
                                                    padding: "8px",
                                                    borderRadius: "8px",
                                                    border: "2px solid #eee",
                                                    fontSize: "1rem",
                                                    fontWeight: 600,
                                                    transition: "all 0.2s",
                                                    backgroundColor: it.cantidad_recibida !== it.cantidad_pedida ? `${theme.primary}22` : "white"
                                                }}
                                                className="small-input"
                                                onFocus={(e) => e.target.style.borderColor = theme.primary}
                                                onBlur={(e) => e.target.style.borderColor = "#eee"}
                                            />
                                        </div>
                                        <div style={{ textAlign: "right", fontWeight: 800, color: theme.text, fontSize: "1rem" }}>${(Number(it.precio_unitario) * Number(it.cantidad_recibida)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px", padding: "10px", borderTop: "2px solid rgba(0,0,0,0.05)" }}>
                                <div style={{ textAlign: "right" }}>
                                    <small style={{ opacity: 0.6 }}>Total Recepción:</small>
                                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: theme.primary }}>
                                        ${items.reduce((sum, it) => sum + (Number(it.precio_unitario) * Number(it.cantidad_recibida)), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", marginBottom: "20px" }}>
                            <FormGroup style={{ flex: 1, marginBottom: 0 }}>
                                <label><FiCheck /> Nuevo Estado de la Orden</label>
                                <select value={idStatus} onChange={(e) => setIdStatus(e.target.value)} style={{ width: "100%", padding: "10px" }}>
                                    <option value="">Seleccione Estado</option>
                                    {statuses.map(s => (
                                        <option key={s.id_status} value={s.id_status}>{s.nombre || s.std_descripcion}</option>
                                    ))}
                                </select>
                            </FormGroup>
                        </div>

                        <Divider />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                            <Button $variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={receiving || items.length === 0} style={{ minWidth: "180px" }}>
                                {receiving ? <ClimbingBoxLoader size={8} color={theme.text} /> : <><FiCheck /> Confirmar Recepción</>}
                            </Button>
                        </div>
                    </>
                )}
            </ModalContent>
        </ModalOverlay>
    );
};
