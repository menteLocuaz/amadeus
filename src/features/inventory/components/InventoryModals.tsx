import React, { useState } from "react";
import { FiX, FiCheck, FiDollarSign, FiPackage, FiActivity } from "react-icons/fi";
import { ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup, Button } from "../../../shared/components/UI";
import { ClimbingBoxLoader } from "react-spinners";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useSucursales } from "../../proveedor/hooks/useCommonQueries";
import type { MergedInventoryItem } from "../hooks/usePremiumInventory";

interface ModalProps {
    item: MergedInventoryItem;
    onClose: () => void;
    onSave: (payload: any) => void;
    saving: boolean;
}

export const InitInventoryModal: React.FC<ModalProps> = ({ item, onClose, onSave, saving }) => {
    const { user } = useAuthStore();
    const { data: sucursales = [] } = useSucursales();
    
    // Fallback implicit sucursal from user profile
    const implicitSucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || (user as any)?.sucursal?.id || "";

    const [formData, setFormData] = useState({
        id_sucursal: implicitSucursalId,
        stock_actual: 0,
        stock_minimo: 0,
        stock_maximo: 0,
        precio_compra: item.precio_compra || 0,
        precio_venta: item.precio_venta || 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const payload = {
            id_producto: item.id_producto || (item.producto_original as any)?.id || (item.producto_original as any)?.id_producto,
            id_sucursal: formData.id_sucursal || implicitSucursalId,
            stock_actual: Number(formData.stock_actual) || 0,
            stock_minimo: Number(formData.stock_minimo) || 0,
            stock_maximo: Number(formData.stock_maximo) || 0,
            precio_compra: Number(formData.precio_compra) || 0,
            precio_venta: Number(formData.precio_venta) || 0
        };

        if (!payload.id_sucursal) {
            return alert("Error: Debe seleccionar una sucursal para inicializar este producto.");
        }
        if (!payload.id_producto) {
            return alert("Error interno: El ID del producto no es válido.");
        }

        onSave(payload);
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><FiPackage /> Inicializar Inventario</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>
                <div style={{ marginBottom: 20 }}>
                    <strong>{item.nombre}</strong>
                    <div style={{ opacity: 0.6, fontSize: '0.85rem' }}>Complete los datos iniciales para este producto.</div>
                </div>

                {!implicitSucursalId && (
                    <FormGroup style={{ marginBottom: 15 }}>
                        <label>Sucursal Destino *</label>
                        <select name="id_sucursal" value={formData.id_sucursal} onChange={handleChange as any}>
                            <option value="">Seleccione Sucursal</option>
                            {sucursales.map((s: any) => (
                                <option key={s.id_sucursal || s.id} value={s.id_sucursal || s.id}>
                                    {s.nombre_sucursal || s.nombre}
                                </option>
                            ))}
                        </select>
                    </FormGroup>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <FormGroup>
                        <label>Stock Físico Inicial</label>
                        <input type="number" name="stock_actual" value={formData.stock_actual} onChange={handleChange} autoFocus />
                    </FormGroup>
                    <FormGroup>
                        <label>Precio de Venta</label>
                        <input type="number" name="precio_venta" value={formData.precio_venta} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Mínimo</label>
                        <input type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Precio de Compra</label>
                        <input type="number" name="precio_compra" value={formData.precio_compra} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Máximo</label>
                        <input type="number" name="stock_maximo" value={formData.stock_maximo} onChange={handleChange} />
                    </FormGroup>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 15, justifyContent: 'flex-end' }}>
                    <Button $variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Inicializar</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

export const UpdateInventoryModal: React.FC<ModalProps> = ({ item, onClose, onSave, saving }) => {
    const [formData, setFormData] = useState({
        stock_actual: item.stock_actual || 0,
        stock_minimo: item.stock_minimo || 0,
        stock_maximo: item.stock_maximo || 0,
        precio_compra: item.precio_compra || 0,
        precio_venta: item.precio_venta || 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave({ 
            id: item.id, 
            payload: {
                stock_actual: Number(formData.stock_actual),
                stock_minimo: Number(formData.stock_minimo),
                stock_maximo: Number(formData.stock_maximo),
                precio_compra: Number(formData.precio_compra),
                precio_venta: Number(formData.precio_venta)
            } 
        });
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><FiDollarSign /> Actualizar Precios/Límites</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>
                <div style={{ marginBottom: 20 }}>
                    <strong>{item.nombre}</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <FormGroup>
                        <label>Stock Físico Real</label>
                        <input type="number" name="stock_actual" value={formData.stock_actual} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Precio de Venta</label>
                        <input type="number" name="precio_venta" value={formData.precio_venta} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Mínimo</label>
                        <input type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Precio de Compra</label>
                        <input type="number" name="precio_compra" value={formData.precio_compra} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Máximo</label>
                        <input type="number" name="stock_maximo" value={formData.stock_maximo} onChange={handleChange} />
                    </FormGroup>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 15, justifyContent: 'flex-end' }}>
                    <Button $variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Guardar Cambios</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

export const MovementModal: React.FC<ModalProps> = ({ item, onClose, onSave, saving }) => {
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        tipo_movimiento: 'AJUSTE',
        cantidad: 0,
        referencia: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const qty = Number(formData.cantidad);
        if (qty <= 0) return alert("La cantidad debe ser mayor a 0");
        onSave({
            id_producto: item.id_producto,
            id_sucursal: user?.id_sucursal,
            tipo_movimiento: formData.tipo_movimiento,
            cantidad: qty,
            referencia: formData.referencia
        });
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><FiActivity /> Registrar Movimiento</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>
                <div style={{ marginBottom: 20 }}>
                    <strong>{item.nombre}</strong>
                    <div style={{ opacity: 0.6, fontSize: '0.85rem' }}>Stock Actual: {item.stock_actual}</div>
                </div>

                <FormGroup>
                    <label>Tipo de Movimiento</label>
                    <select name="tipo_movimiento" value={formData.tipo_movimiento} onChange={handleChange}>
                        <option value="ENTRADA">Entrada</option>
                        <option value="SALIDA">Salida</option>
                        <option value="AJUSTE">Ajuste / Pérdida</option>
                        <option value="DEVOLUCION">Devolución</option>
                    </select>
                </FormGroup>

                <FormGroup>
                    <label>Cantidad (Absoluta)</label>
                    <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} autoFocus />
                </FormGroup>

                <FormGroup>
                    <label>Referencia / Motivo</label>
                    <input type="text" name="referencia" value={formData.referencia} onChange={handleChange} placeholder="Ej. Conteo semanal, merma..." />
                </FormGroup>

                <div style={{ display: "flex", gap: 10, marginTop: 15, justifyContent: 'flex-end' }}>
                    <Button $variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Registrar</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};
