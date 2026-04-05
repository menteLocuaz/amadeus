/**
 * InventoryModals.tsx
 * Tres modales para gestión de inventario:
 *
 *  - InitInventoryModal   → crea el primer registro de un producto en la sucursal
 *  - UpdateInventoryModal → edita precios y límites de stock de un registro existente
 *  - MovementModal        → registra una entrada, salida, ajuste, devolución o traslado
 */

import React, { useState } from "react";
import { FiX, FiCheck, FiActivity, FiAlertTriangle, FiPackage, FiEdit } from "react-icons/fi";
import { ModalOverlay, ModalContent, ModalHeader, ActionBtn, FormGroup, Button } from "../../../shared/components/UI";
import { ClimbingBoxLoader } from "react-spinners";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { type MergedInventoryItem } from "../hooks/usePremiumInventory";
import { type InventoryCreateDTO, type InventoryUpdateDTO, type MovimientoRequest, type TipoMovimiento } from "../services/InventoryService";

// ── Tipos de los payloads que cada modal entrega al padre ─────────────────────
export type InitPayload     = InventoryCreateDTO;
export type UpdatePayload   = { id: string; payload: InventoryUpdateDTO };
export type MovementPayload = MovimientoRequest;

interface BaseModalProps {
    item: MergedInventoryItem;
    onClose: () => void;
    saving: boolean;
}

// ── Componente reutilizable: info del producto ────────────────────────────────
const ProductInfo: React.FC<{ item: MergedInventoryItem }> = ({ item }) => (
    <div style={{
        marginBottom: 20, padding: '12px',
        background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
    }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.nombre}</div>
        <div style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: 4 }}>
            Categoría: {item.categoria_nombre} · Unidad: {item.unidad_nombre}
        </div>
    </div>
);

// ── Modal 1: Inicializar inventario ───────────────────────────────────────────
interface InitModalProps extends BaseModalProps {
    onSave: (payload: InitPayload) => void;
}

export const InitInventoryModal: React.FC<InitModalProps> = ({ item, onClose, onSave, saving }) => {
    const { user } = useAuthStore();
    const sucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || '';

    const [form, setForm] = useState({
        stock_actual:  0,
        stock_minimo:  0,
        stock_maximo:  0,
        precio_compra: item.precio_compra,
        precio_venta:  item.precio_venta,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }));
    };

    const handleSave = () => {
        if (!sucursalId) return;
        onSave({
            id_producto:   item.id_producto,
            id_sucursal:   sucursalId,
            stock_actual:  form.stock_actual,
            stock_minimo:  form.stock_minimo,
            stock_maximo:  form.stock_maximo,
            precio_compra: form.precio_compra,
            precio_venta:  form.precio_venta,
        });
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><FiPackage /> Inicializar Inventario</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                <ProductInfo item={item} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormGroup>
                        <label>Stock Inicial</label>
                        <input type="number" name="stock_actual" value={form.stock_actual} onChange={handleChange} min={0} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Mínimo</label>
                        <input type="number" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} min={0} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Máximo</label>
                        <input type="number" name="stock_maximo" value={form.stock_maximo} onChange={handleChange} min={0} />
                    </FormGroup>
                    <FormGroup>
                        <label>Precio Compra</label>
                        <input type="number" name="precio_compra" value={form.precio_compra} onChange={handleChange} min={0} step="0.01" />
                    </FormGroup>
                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                        <label>Precio Venta</label>
                        <input type="number" name="precio_venta" value={form.precio_venta} onChange={handleChange} min={0} step="0.01" />
                    </FormGroup>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                    <Button $variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Crear Registro</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

// ── Modal 2: Actualizar precios / límites ──────────────────────────────────────
interface UpdateModalProps extends BaseModalProps {
    onSave: (payload: UpdatePayload) => void;
}

export const UpdateInventoryModal: React.FC<UpdateModalProps> = ({ item, onClose, onSave, saving }) => {
    const [form, setForm] = useState({
        stock_actual:  item.stock_actual,
        stock_minimo:  item.stock_minimo,
        stock_maximo:  item.stock_maximo,
        precio_compra: item.precio_compra,
        precio_venta:  item.precio_venta,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }));
    };

    const handleSave = () => {
        // id_inventario debe existir porque este modal solo se abre para items inicializados
        if (!item.id_inventario) return;
        onSave({ id: item.id_inventario, payload: form });
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><FiEdit /> Editar Inventario</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                <ProductInfo item={item} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormGroup>
                        <label>Stock Actual</label>
                        <input type="number" name="stock_actual" value={form.stock_actual} onChange={handleChange} min={0} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Mínimo</label>
                        <input type="number" name="stock_minimo" value={form.stock_minimo} onChange={handleChange} min={0} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Máximo</label>
                        <input type="number" name="stock_maximo" value={form.stock_maximo} onChange={handleChange} min={0} />
                    </FormGroup>
                    <FormGroup>
                        <label>Precio Compra</label>
                        <input type="number" name="precio_compra" value={form.precio_compra} onChange={handleChange} min={0} step="0.01" />
                    </FormGroup>
                    <FormGroup style={{ gridColumn: '1 / -1' }}>
                        <label>Precio Venta</label>
                        <input type="number" name="precio_venta" value={form.precio_venta} onChange={handleChange} min={0} step="0.01" />
                    </FormGroup>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                    <Button $variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Guardar Cambios</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

// ── Modal 3: Registrar movimiento ─────────────────────────────────────────────
// Tipos de movimiento válidos según el backend (ver doc/inventario_logica.md)
const TIPOS_MOVIMIENTO: { value: TipoMovimiento; label: string }[] = [
    { value: 'ENTRADA',    label: '📥 ENTRADA — Ingreso de mercancía' },
    { value: 'SALIDA',     label: '📤 SALIDA — Egreso de mercancía' },
    { value: 'AJUSTE',     label: '⚙️ AJUSTE — Corrección por conteo físico' },
    { value: 'DEVOLUCION', label: '↩️ DEVOLUCIÓN — De cliente o proveedor' },
    { value: 'TRASLADO',   label: '🔁 TRASLADO — Entre sucursales' },
];

interface MovementModalProps extends BaseModalProps {
    onSave: (payload: MovementPayload) => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({ item, onClose, onSave, saving }) => {
    const { user } = useAuthStore();
    const sucursalId = user?.id_sucursal || user?.sucursal?.id_sucursal || '';

    const [form, setForm] = useState<{ tipo_movimiento: TipoMovimiento; cantidad: number; referencia: string }>({
        tipo_movimiento: 'ENTRADA',
        cantidad:        0,
        referencia:      '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'cantidad' ? Number(value) : value }));
    };

    const handleSave = () => {
        if (form.cantidad <= 0) {
            // Usamos Swal directamente para mantener consistencia con el resto de la app
            import('sweetalert2').then(({ default: Swal }) =>
                Swal.fire({ icon: 'warning', title: 'Cantidad inválida', text: 'La cantidad debe ser mayor a 0.', timer: 2000, showConfirmButton: false })
            );
            return;
        }
        onSave({
            id_producto:     item.id_producto,
            id_sucursal:     sucursalId,
            tipo_movimiento: form.tipo_movimiento,
            cantidad:        form.cantidad,
            referencia:      form.referencia || undefined,
        });
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2><FiActivity /> Registrar Movimiento</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                {/* Info del producto con stock actual visible */}
                <div style={{
                    marginBottom: 20, padding: '12px',
                    background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.nombre}</div>
                    <div style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: 4 }}>
                        Stock Actual:{' '}
                        <span style={{ color: '#FCA311', fontWeight: 700 }}>
                            {item.stock_actual} {item.unidad_nombre}
                        </span>
                    </div>
                </div>

                <FormGroup>
                    <label>Tipo de Movimiento</label>
                    <select name="tipo_movimiento" value={form.tipo_movimiento} onChange={handleChange}>
                        {TIPOS_MOVIMIENTO.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </FormGroup>

                <FormGroup>
                    <label>Cantidad</label>
                    <input
                        type="number" name="cantidad" value={form.cantidad}
                        onChange={handleChange} placeholder="0.00" min={0.01} step="0.01"
                        autoFocus
                    />
                </FormGroup>

                <FormGroup>
                    <label>Referencia (Opcional)</label>
                    <input
                        type="text" name="referencia" value={form.referencia}
                        onChange={handleChange}
                        placeholder="Núm. factura, reporte, orden de compra..."
                    />
                </FormGroup>

                {/* Aviso de permanencia del registro */}
                <div style={{
                    marginTop: 4, padding: '10px', borderRadius: '8px',
                    background: 'rgba(252,163,17,0.1)', border: '1px solid rgba(252,163,17,0.2)',
                    fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center',
                }}>
                    <FiAlertTriangle style={{ color: '#FCA311', flexShrink: 0 }} />
                    <span>Esta acción registra un movimiento permanente en el Kardex y actualiza el stock físico.</span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                    <Button $variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiCheck /> Registrar</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};
