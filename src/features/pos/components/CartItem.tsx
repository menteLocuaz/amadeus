import React, { memo } from "react";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { CartItemRow, QtyControls, IconButton } from "../../../shared/components/UI/atoms";
import type { CartItem as CartItemType } from "../hooks/useCart";

interface CartItemProps {
  item: CartItemType;
  onQtyChange: (productId: string, qty: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQtyChange }) => {
  const pid = item.product.id_producto || item.product.id || "";

  return (
    <CartItemRow style={{ marginBottom: 12 }}>
      <div className="meta">
        <div className="name">{item.product.nombre}</div>
        <div className="muted">
          {item.product.moneda?.nombre ?? "$"} {(item.product.precio_venta ?? 0)} x {item.qty}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          {(Number(item.product.precio_venta ?? 0) * item.qty).toFixed(2)}
        </div>
        <QtyControls>
          <IconButton 
            onClick={() => onQtyChange(pid, item.qty - 1)} 
            style={{ width: 28, height: 28, minWidth: 28 }}
          >
             {item.qty === 1 ? <FiTrash2 size={13} color="#ff4d4d" /> : <FiMinus size={13} />}
          </IconButton>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, width: 24, textAlign: "center" }}>
            {item.qty}
          </span>
          <IconButton 
            onClick={() => onQtyChange(pid, item.qty + 1)} 
            style={{ width: 28, height: 28, minWidth: 28 }}
          >
             <FiPlus size={13} />
          </IconButton>
        </QtyControls>
      </div>
    </CartItemRow>
  );
};

export default memo(CartItem);
