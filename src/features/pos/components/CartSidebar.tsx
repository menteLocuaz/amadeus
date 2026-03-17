import React, { memo } from "react";
import { FiCornerUpLeft } from "react-icons/fi";
import { Card, IconButton, Divider, Input, Button } from "../../../shared/components/UI/atoms";
import CartItem from "./CartItem";
import type { useCart } from "../hooks/useCart";

interface CartSidebarProps {
  cart: ReturnType<typeof useCart>;
  onClear: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ cart, onClear }) => {
  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>Orden Actual</h2>
        <IconButton onClick={onClear} title="Limpiar Carrito">
          <FiCornerUpLeft />
        </IconButton>
      </div>
      
      <Divider />

      <div style={{ flex: 1, overflowY: "auto", paddingRight: 8, margin: "10px 0" }}>
        {cart.items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", opacity: 0.5, fontWeight: 600 }}>Carrito vacío</div>
        ) : (
          cart.items.map((it) => (
            <CartItem 
              key={it.product.id_producto || it.product.id} 
              item={it} 
              onQtyChange={cart.changeQty} 
            />
          ))
        )}
      </div>

      <div style={{ background: "rgba(0,0,0,0.03)", padding: 20, borderRadius: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: 8 }}>
            Nota de pedido
          </label>
          <Input 
            placeholder="Ej: Sin cebolla..." 
            value={cart.note} 
            onChange={(e) => cart.setNote(e.target.value)}
          />
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.95rem" }}>
          <span style={{ opacity: 0.7, fontWeight: 600 }}>Subtotal</span>
          <span style={{ fontWeight: 700 }}>$ {cart.subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: "0.95rem" }}>
          <span style={{ opacity: 0.7, fontWeight: 600 }}>Impuestos (19.0%)</span>
          <span style={{ fontWeight: 700 }}>$ {cart.tax.toFixed(2)}</span>
        </div>
        
        <Divider />
        
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.4rem", fontWeight: 900, margin: "16px 0 24px 0" }}>
          <span>Total</span>
          <span style={{ color: "#FCA311" }}>$ {cart.total.toFixed(2)}</span>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button $variant="secondary" onClick={onClear} style={{ color: "#EF4444", flex: 1, padding: "14px 0" }}>
            Cancelar
          </Button>
          <Button $variant="primary" onClick={() => alert("Procesando...")} style={{ flex: 1, padding: "14px 0", fontSize: "1.05rem" }}>
            Cobrar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default memo(CartSidebar);
