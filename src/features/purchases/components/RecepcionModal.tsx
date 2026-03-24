import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiPackage } from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";
import {
  ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup, Button, Divider
} from "../../../shared/components/UI";

import { type Compra } from "../services/PurchaseService";
import { useOrderDetail } from "../hooks/useComprasQuery";

interface RecepcionModalProps {
    open: boolean;
    order: Compra | null;
    statuses: any[];
    receiving: boolean;
    onClose: () => void;
    onConfirm: (payload: any) => void;
}

export const RecepcionModal: React.FC<RecepcionModalProps> = ({
    open,
    order,
    statuses,
    receiving,
    onClose,
    onConfirm
}) => {
    const [idStatus, setIdStatus] = useState("");
    const [items, setItems] = useState<any[]>([]);

    const orderId = (order as any)?.id_orden_compra || order?.id || "";
    const { data: fullOrder, isLoading: isLoadingDetails } = useOrderDetail(orderId);

    useEffect(() => {
        if (fullOrder && fullOrder.detalles) {
            setItems(fullOrder.detalles.map((d: any) => ({
                id_detalle_compra: d.id_detalle_compra || d.id,
                id_producto: d.id_producto,
                nombre: d.producto?.nombre || "Producto",
                cantidad_pedida: d.cantidad_pedida,
                cantidad_recibida: d.cantidad_pedida, // Default to full reception
                precio_unitario: d.precio_unitario || 0
            })));
            
            // Default to "RECIBIDO" status if found
            const recibido = statuses.find(s => (s.nombre || "").toLowerCase().includes("recib"));
            if (recibido) setIdStatus(recibido.id_status);
        }
    }, [fullOrder, statuses]);

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

        console.log("👉 PAYLOAD DE RECEPCIÓN GENERADO:", JSON.stringify(payload, null, 2));

        const invalidItems = payload.items.filter(i => !i.id_detalle_compra || !i.id_producto);
        if (invalidItems.length > 0) {
            console.error("🔍 Detalles del ítem original que falló:", items.filter(i => !i.id_detalle_compra || !i.id_producto));
            return alert("Error de validación interna: Falta el UUID de 'id_detalle_compra' o 'id_producto' en uno o más ítems. Abre la consola (F12) para ver más detalles.");
        }

        onConfirm(payload);
    };

    return (
        <ModalOverlay>
            <ModalContent style={{ maxWidth: 700 }}>
                <ModalHeader>
                    <h2><FiPackage /> Recepción de Mercancía</h2>
                    <ActionBtn $variant="close" onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                {isLoadingDetails ? (
                    <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 15 }}>
                        <ClimbingBoxLoader color="#FCA311" size={10} />
                        <p style={{ opacity: 0.6 }}>Cargando detalles de la orden...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 20 }}>
                            <p><strong>Orden:</strong> {fullOrder?.numero_orden || order.numero_orden}</p>
                            <p><strong>Proveedor:</strong> {fullOrder?.proveedor?.nombre || order.proveedor?.nombre || "N/A"}</p>
                        </div>

                <div style={{ background: "rgba(0,0,0,0.02)", padding: 15, borderRadius: 12, marginBottom: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 1.5fr", gap: 10, paddingBottom: 8, opacity: 0.6, fontSize: "0.85rem", fontWeight: 700 }}>
                        <div>Producto</div>
                        <div style={{ textAlign: "right" }}>Precio</div>
                        <div style={{ textAlign: "center" }}>Pedida</div>
                        <div style={{ textAlign: "right" }}>Recibida</div>
                        <div style={{ textAlign: "right" }}>Subtotal</div>
                    </div>
                    {items.map((it, idx) => (
                        <div key={it.id_detalle_compra} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 1.5fr", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                            <div style={{ fontSize: "0.9rem" }}>{it.nombre}</div>
                            <div style={{ textAlign: "right" }}>${Number(it.precio_unitario).toFixed(2)}</div>
                            <div style={{ textAlign: "center" }}>{it.cantidad_pedida}</div>
                            <div style={{ textAlign: "right" }}>
                                <input
                                    type="number"
                                    value={it.cantidad_recibida}
                                    onChange={(e) => handleQtyChange(idx, e.target.value)}
                                    style={{ width: 70, textAlign: "right", padding: "4px 8px" }}
                                    className="small-input"
                                />
                            </div>
                            <div style={{ textAlign: "right", fontWeight: 600 }}>${(Number(it.precio_unitario) * Number(it.cantidad_recibida)).toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                <FormGroup>
                    <label>Nuevo Estado de la Orden</label>
                    <select value={idStatus} onChange={(e) => setIdStatus(e.target.value)}>
                        <option value="">Seleccione Estado</option>
                        {statuses.map(s => (
                            <option key={s.id_status} value={s.id_status}>{s.nombre || s.std_descripcion}</option>
                        ))}
                    </select>
                </FormGroup>

                <Divider />

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                            <Button $variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={receiving || items.length === 0}>
                                {receiving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Confirmar Recepción</>}
                            </Button>
                        </div>
                    </>
                )}
            </ModalContent>
        </ModalOverlay>
    );
};
