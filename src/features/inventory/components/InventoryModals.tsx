import React, { useState } from "react";
import { FiX, FiCheck, FiActivity, FiAlertTriangle } from "react-icons/fi";
import { ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup, Button } from "../../../shared/components/UI";
import { ClimbingBoxLoader } from "react-spinners";
import { useAuthStore } from "../../auth/store/useAuthStore";

/**
 * MovementModal - Refactorizado para Prunus (Movimientos de Inventario)
 * 
 * Este modal permite registrar Entradas, Salidas y Ajustes manuales.
 * El stock no se actualiza directamente desde aquí, sino que el backend
 * procesa el movimiento y actualiza el inventario físico automáticamente.
 */
interface MovementModalProps {
    item: any; // InventoryItem
    onClose: () => void;
    onSave: (payload: any) => void;
    saving: boolean;
}

export const MovementModal: React.FC<MovementModalProps> = ({ item, onClose, onSave, saving }) => {
    const { user } = useAuthStore();

    // Estado inicial alineado con el DTO del backend
    const [formData, setFormData] = useState({
        tipo_movimiento: 'ENTRADA', // ENTRADA, SALIDA, AJUSTE, MERMA
        cantidad: 0,
        motivo: '',
        referencia: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const qty = Number(formData.cantidad);
        if (qty <= 0) return alert("La cantidad debe ser mayor a 0");
        if (!formData.motivo.trim()) return alert("Debe indicar el motivo del movimiento");

        // Payload final según arquitectura Prunus
        onSave({
            id_sucursal: user?.id_sucursal || (user as any)?.sucursal?.id,
            id_producto: item.id_producto,
            tipo_movimiento: formData.tipo_movimiento,
            cantidad: qty,
            motivo: formData.motivo,
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

                <div style={{ marginBottom: 20, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.nombre_producto || item.nombre}</div>
                    <div style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: 4 }}>
                        Stock Actual: <span style={{ color: '#FCA311', fontWeight: 700 }}>{item.stock_actual} {item.unidad_medida}</span>
                    </div>
                </div>

                <FormGroup>
                    <label>Tipo de Operación</label>
                    <select name="tipo_movimiento" value={formData.tipo_movimiento} onChange={handleChange}>
                        <option value="ENTRADA">📥 ENTRADA (Compra / Carga)</option>
                        <option value="SALIDA">📤 SALIDA (Ajuste Negativo)</option>
                        <option value="MERMA">🗑️ MERMA (Desperdicio / Daño)</option>
                        <option value="AJUSTE">⚙️ AJUSTE (Conteo Físico)</option>
                    </select>
                </FormGroup>

                <FormGroup>
                    <label>Cantidad (Unidades)</label>
                    <input
                        type="number"
                        name="cantidad"
                        value={formData.cantidad}
                        onChange={handleChange}
                        placeholder="0.00"
                        autoFocus
                    />
                </FormGroup>

                <FormGroup>
                    <label>Motivo / Explicación *</label>
                    <input
                        type="text"
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleChange}
                        placeholder="Ej. Compra a proveedor, producto vencido..."
                    />
                </FormGroup>

                <FormGroup>
                    <label>Referencia (Opcional)</label>
                    <input
                        type="text"
                        name="referencia"
                        value={formData.referencia}
                        onChange={handleChange}
                        placeholder="Núm. Factura, Reporte, etc."
                    />
                </FormGroup>

                <div style={{
                    marginTop: 15, padding: '10px', borderRadius: '8px',
                    background: 'rgba(252,163,17,0.1)', border: '1px solid rgba(252,163,17,0.2)',
                    fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center'
                }}>
                    <FiAlertTriangle style={{ color: '#FCA311', flexShrink: 0 }} />
                    <span>Esta acción registrará un movimiento permanente en el Kardex y actualizará el stock físico.</span>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                    <Button $variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Registrar Movimiento</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

/**
 * Los demás modales (InitInventoryModal, UpdateInventoryModal) se mantienen 
 * pero deberían migrar progresivamente a la lógica de movimientos si el backend 
 * bloquea la edición directa de stock_actual.
 */
export const InitInventoryModal: React.FC<any> = () => null; // Placeholder
export const UpdateInventoryModal: React.FC<any> = () => null; // Placeholder
