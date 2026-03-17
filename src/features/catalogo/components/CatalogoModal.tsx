import React from "react";
import { FiShoppingBag } from "react-icons/fi";
import { 
    Badge, ModalOverlay, ModalContent, ModalHeader, ActionBtn 
} from "../../../shared/components/UI";
import { Button, Divider } from "../../../shared/components/UI/atoms";
import { type Product } from "../../products/services/ProductService";
import styled from "styled-components";

interface CatalogoModalProps {
    product: Product;
    onClose: () => void;
    getStatusLabel: (p: Product) => string;
}

const StatusIndicator = styled.div<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${({ $active }) => ($active ? "#22C55E15" : "#EF444415")};
  color: ${({ $active }) => ($active ? "#22C55E" : "#EF4444")};
  font-size: 0.8rem;
  font-weight: 700;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }
`;

export const CatalogoModal: React.FC<CatalogoModalProps> = ({ 
    product, 
    onClose, 
    getStatusLabel 
}) => {
    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
                <ModalHeader>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FiShoppingBag color="#FCA311" /> Ficha de Producto
                    </h2>
                    <ActionBtn $variant="close" onClick={onClose}>X</ActionBtn>
                </ModalHeader>

                <div style={{ display: "flex", gap: "30px", marginBottom: "30px" }}>
                    <img
                        src={product.imagen || "https://placehold.co/200"}
                        alt={product.nombre}
                        style={{ width: "180px", height: "180px", borderRadius: "16px", objectFit: "cover", border: `1px solid rgba(0,0,0,0.1)` }}
                    />
                    <div style={{ flex: 1 }}>
                        <Badge style={{ marginBottom: 12 }}>ID: {product.id_producto || 'N/A'}</Badge>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: '1.6rem' }}>{product.nombre}</h3>
                        <div style={{ fontSize: "1rem", opacity: 0.7, marginBottom: 15 }}>
                            <strong>Categoria:</strong> {product.categoria?.nombre || 'General'}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <StatusIndicator $active={product.id_status === "activo" || getStatusLabel(product) === "Disponible" || getStatusLabel(product) === "Activo"}>
                                <span className="dot" />
                                {getStatusLabel(product)}
                            </StatusIndicator>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", background: `rgba(0,0,0,0.02)`, padding: "25px", borderRadius: "20px", border: `1px solid rgba(0,0,0,0.05)` }}>
                    <div>
                        <label style={{ fontSize: "0.8rem", opacity: 0.6, display: "block", marginBottom: "6px", textTransform: 'uppercase', letterSpacing: 1 }}>Precio Venta</label>
                        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#FCA311" }}>
                            {product.moneda?.nombre} {(product.precio_venta || 0).toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: "0.8rem", opacity: 0.6, display: "block", marginBottom: "6px", textTransform: 'uppercase', letterSpacing: 1 }}>Existencias</label>
                        <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>
                            {product.stock} {product.unidad?.nombre || 'u'}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "25px" }}>
                    <label style={{ fontSize: "0.8rem", opacity: 0.6, display: "block", marginBottom: "10px", textTransform: 'uppercase', letterSpacing: 1 }}>Descripcion del Producto</label>
                    <p style={{ margin: 0, fontSize: "1.05rem", lineHeight: "1.7", opacity: 0.8 }}>
                        {product.descripcion || "Este producto no tiene una descripcion detallada disponible en este momento."}
                    </p>
                </div>

                <Divider style={{ margin: '30px 0' }} />

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button $variant="secondary" onClick={onClose} style={{ padding: '12px 30px' }}>
                        Cerrar Consulta
                    </Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );
};
