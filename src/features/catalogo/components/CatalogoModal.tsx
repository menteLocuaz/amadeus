/**
 * CatalogoModal.tsx
 * Modal de solo lectura que muestra la ficha completa de un producto
 * seleccionado desde la vista de Inventario & Catálogo.
 * No permite edición; su único propósito es consulta de detalle.
 */

import React from "react";
import { FiShoppingBag, FiX } from "react-icons/fi";
import { 
    Badge, ModalOverlay, ModalContent, ModalHeader, ActionBtn, Button, Divider 
} from "../../../shared/components/UI";
// Solo se importa el tipo; los datos llegan por props desde InventarioCatalogo
import { type Product } from "../../products/services/ProductService";
import styled, { useTheme } from "styled-components";

// ── Props ──────────────────────────────────────────────────────────────────
interface CatalogoModalProps {
    product: Product;                        // Producto a mostrar en la ficha
    onClose: () => void;                     // Callback para cerrar el modal
    getStatusLabel: (p: Product) => string;  // Helper del hook para resolver el texto del estado
}

// ── Styled Components ──────────────────────────────────────────────────────

/** Pastilla de estado con punto animado; verde si activo, rojo si inactivo */
const StatusIndicator = styled.div<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${({ $active, theme }) => ($active ? `${theme.success}15` : `${theme.danger}15`)};
  color: ${({ $active, theme }) => ($active ? theme.success : theme.danger)};
  font-size: 0.8rem;
  font-weight: 700;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    /* Halo de luz que refuerza el color del estado */
    box-shadow: 0 0 8px currentColor;
  }
`;

/** Grid de 2 columnas para mostrar pares de datos clave (precio / stock) */
const InfoGrid = styled.div`
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 20px; 
  background: ${({ theme }) => theme.bg}05; 
  padding: 25px; 
  border-radius: 20px; 
  border: 1px solid ${({ theme }) => theme.bg3}22;
`;

/** Etiqueta de campo en mayúsculas con espaciado de letras para jerarquía visual */
const DataLabel = styled.label`
  font-size: 0.8rem; 
  opacity: 0.6; 
  display: block; 
  margin-bottom: 6px; 
  text-transform: uppercase; 
  letter-spacing: 1px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

/**
 * Valor de dato destacado en tamaño grande.
 * $primary=true → usa el color primario del tema (ej. precio de venta).
 * $primary=false → usa el color de texto base (ej. existencias).
 */
const DataValue = styled.div<{ $primary?: boolean }>`
  font-size: 1.6rem; 
  font-weight: 800; 
  color: ${({ $primary, theme }) => $primary ? theme.primary : theme.text};
`;

// ── Componente ─────────────────────────────────────────────────────────────

export const CatalogoModal: React.FC<CatalogoModalProps> = ({ 
    product, 
    onClose, 
    getStatusLabel 
}) => {
    // Acceso al tema para usar colores dinámicos en estilos inline
    const theme = useTheme();

    return (
        // Clic en el overlay (fondo oscuro) cierra el modal
        <ModalOverlay onClick={onClose}>
            {/* stopPropagation evita que el clic dentro del modal lo cierre */}
            <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>

                {/* ── Encabezado: título + botón de cierre ── */}
                <ModalHeader>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 0, color: theme.text }}>
                        <FiShoppingBag color={theme.primary} /> Ficha de Producto
                    </h2>
                    <ActionBtn onClick={onClose}>
                        <FiX />
                    </ActionBtn>
                </ModalHeader>

                {/* ── Sección superior: imagen + datos de identificación ── */}
                <div style={{ display: "flex", gap: "30px", marginBottom: "30px", flexWrap: 'wrap' }}>
                    {/* Imagen del producto; placeholder si no tiene imagen asignada */}
                    <img
                        src={product.imagen || "https://placehold.co/200?text=No+Imagen"}
                        alt={product.nombre}
                        style={{ 
                            width: "180px", 
                            height: "180px", 
                            borderRadius: "16px", 
                            objectFit: "cover", 
                            border: `1px solid ${theme.bg3}33`,
                            background: theme.bg2
                        }}
                    />
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        {/* SKU / identificador único del producto */}
                        <Badge style={{ marginBottom: 12 }}>ID: {product.id_producto || 'N/A'}</Badge>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: '1.6rem', color: theme.text }}>{product.nombre}</h3>
                        {/* Categoría: relación anidada que viene del JOIN del backend */}
                        <div style={{ fontSize: "1rem", opacity: 0.7, marginBottom: 15, color: theme.text }}>
                            <strong>Categoría:</strong> {product.categoria?.nombre || 'General'}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {/* $active evalúa tres posibles representaciones del estado activo */}
                            <StatusIndicator $active={product.id_status === "activo" || getStatusLabel(product) === "Disponible" || getStatusLabel(product) === "Activo"}>
                                <span className="dot" />
                                {getStatusLabel(product)}
                            </StatusIndicator>
                        </div>
                    </div>
                </div>

                {/* ── Grid de métricas clave: precio y existencias ── */}
                <InfoGrid>
                    <div>
                        {/* Precio con símbolo de moneda resuelto desde la relación anidada */}
                        <DataLabel>Precio Venta</DataLabel>
                        <DataValue $primary>
                            {product.moneda?.nombre || "$"} {(product.precio_venta || 0).toFixed(2)}
                        </DataValue>
                    </div>
                    <div>
                        {/* Stock con unidad de medida resuelta desde la relación anidada */}
                        <DataLabel>Existencias</DataLabel>
                        <DataValue>
                            {product.stock} {product.unidad?.nombre || 'u'}
                        </DataValue>
                    </div>
                </InfoGrid>

                {/* ── Descripción del producto ── */}
                <div style={{ marginTop: "25px" }}>
                    <DataLabel>Descripción del Producto</DataLabel>
                    {/* Texto de fallback si el producto no tiene descripción registrada */}
                    <p style={{ margin: 0, fontSize: "1rem", lineHeight: "1.6", opacity: 0.8, color: theme.text }}>
                        {product.descripcion || "Este producto no tiene una descripción detallada disponible en este momento."}
                    </p>
                </div>

                {/* Separador visual antes del pie del modal */}
                <Divider style={{ margin: '30px 0', opacity: 0.1 }} />

                {/* ── Pie del modal: único botón de cierre (vista de solo lectura) ── */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button $variant="secondary" onClick={onClose} style={{ padding: '12px 30px' }}>
                        Cerrar Consulta
                    </Button>
                </div>

            </ModalContent>
        </ModalOverlay>
    );
};