import React, { useState } from "react";
import { 
    FiSearch, FiRefreshCw, FiEdit,
    FiX, FiSave, FiPackage
} from "react-icons/fi";
import { ClimbingBoxLoader } from "react-spinners";

// UI Components from shared
import {
    PageContainer, TableCard, Table, ActionBtn,
    FormGroup, ModalOverlay, ModalContent,
    PageHeader, HeaderTitle, Toolbar, SearchBox,
    ModalHeader
} from "../../../shared/components/UI";
import { Button, Grid } from "../../../shared/components/UI/atoms";

// Reusable Atomic Component
import { StockIndicator } from "../../../shared/components/UI/StockIndicator";

// Hooks & Services
import { useInventory } from "../hooks/useInventory";
import { type InventoryItem } from "../services/InventoryService";

const Inventario: React.FC = () => {
    const {
        items,
        totalCount,
        categories,
        isLoading,
        isSaving,
        search,
        setSearch,
        catFilter,
        setCatFilter,
        refresh,
        handleAdjust
    } = useInventory();

    const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

    return (
        <PageContainer>
            <PageHeader>
                <HeaderTitle>
                    <h1><FiPackage color="#FCA311" /> Gestión de Inventario</h1>
                    <p>Control de existencias físicas, niveles críticos y ajustes de stock.</p>
                </HeaderTitle>

                <Toolbar>
                    <SearchBox>
                        <FiSearch />
                        <input
                            placeholder="Buscar producto o ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </SearchBox>
                    <ActionBtn onClick={refresh} title="Actualizar">
                        <FiRefreshCw className={isLoading ? "spin" : ""} />
                    </ActionBtn>
                </Toolbar>
            </PageHeader>

            {/* Filters Row */}
            <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                <FormGroup style={{ marginBottom: 0 }}>
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                        <option value="all">Todas las categorías</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </FormGroup>
                
                <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>
                    Mostrando {items.length} de {totalCount} registros
                </span>
            </div>

            <TableCard>
                {isLoading ? (
                    <div style={{ padding: 100, display: "flex", justifyContent: "center" }}>
                        <ClimbingBoxLoader color="#FCA311" />
                    </div>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th style={{ textAlign: "right", minWidth: 160 }}>Estado Stock</th>
                                <th style={{ textAlign: "right" }}>Precio Venta</th>
                                <th style={{ textAlign: "right" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
                                        No se encontraron registros de inventario
                                    </td>
                                </tr>
                            ) : (
                                items.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                {item.producto?.imagen ? (
                                                    <img src={item.producto.imagen} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FiPackage opacity={0.3} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 700 }}>{item.producto?.nombre || "Producto desconocido"}</div>
                                                    <code style={{ fontSize: '0.75rem', opacity: 0.5 }}>{item.id_producto}</code>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.producto?.categoria?.nombre || "General"}</td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <StockIndicator 
                                                    actual={item.stock_actual} 
                                                    min={item.stock_minimo} 
                                                    max={item.stock_maximo} 
                                                    unit={item.producto?.unidad?.nombre}
                                                />
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right", fontWeight: 800, color: '#22C55E' }}>
                                            ${item.precio_venta}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <ActionBtn onClick={() => setAdjustItem(item)} title="Ajustar Stock">
                                                <FiEdit />
                                            </ActionBtn>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </TableCard>

            {/* Adjust Modal */}
            {adjustItem && (
                <AdjustModal 
                    item={adjustItem}
                    saving={isSaving}
                    onClose={() => setAdjustItem(null)}
                    onSave={handleAdjust}
                />
            )}
        </PageContainer>
    );
};

/* ── Modal Component ── */
const AdjustModal = ({ item, saving, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo,
        stock_maximo: item.stock_maximo,
        motivo: ""
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'motivo' ? value : Number(value) }));
    };

    const handleConfirm = async () => {
        try {
            const { motivo, ...payload } = formData;
            await onSave(item.id, payload, motivo);
            onClose();
        } catch (err) {
            // Error already handled in hook
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <h2>Ajustar Stock</h2>
                    <ActionBtn onClick={onClose}><FiX /></ActionBtn>
                </ModalHeader>

                <p style={{ marginBottom: 20 }}>
                    Ajustando existencias para: <strong>{item.producto?.nombre}</strong>
                </p>

                <Grid style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <FormGroup>
                        <label>Stock Actual</label>
                        <input name="stock_actual" type="number" value={formData.stock_actual} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <label>Stock Mínimo</label>
                        <input name="stock_minimo" type="number" value={formData.stock_minimo} onChange={handleChange} />
                    </FormGroup>
                </Grid>

                <FormGroup>
                    <label>Stock Máximo</label>
                    <input name="stock_maximo" type="number" value={formData.stock_maximo} onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <label>Motivo del Ajuste (Opcional)</label>
                    <textarea name="motivo" value={formData.motivo} onChange={handleChange} placeholder="Ej: Conteo físico, merma, etc." />
                </FormGroup>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                    <Button $variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={saving}>
                        {saving ? <ClimbingBoxLoader size={8} color="#000" /> : <><FiSave /> Guardar Ajuste</>}
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};

export default Inventario;