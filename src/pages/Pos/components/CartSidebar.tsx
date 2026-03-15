import React from "react";
import styled from "styled-components";
import { usePosStore } from "../../../store/usePosStore";

export const CartSidebar: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = usePosStore();
  const total = getTotal();
  const tax = total * 0.15; // 15% de impuesto (ejemplo)

  return (
    <CartContainer>
      <CartHeader>
        <h2>Cuenta Actual</h2>
        <button className="clear-btn" onClick={clearCart}>Limpiar</button>
      </CartHeader>

      <ItemList>
        {cart.length === 0 ? (
          <EmptyState>🛒 El carrito está vacío</EmptyState>
        ) : (
          cart.map((item) => (
            <CartItemRow key={item.id}>
              <div className="info">
                <span className="name">{item.name}</span>
                <span className="price">${item.price.toFixed(2)} x {item.quantity}</span>
              </div>
              
              <div className="controls">
                <div className="qty-group">
                  <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <button className="delete" onClick={() => removeFromCart(item.id)}>🗑️</button>
              </div>
            </CartItemRow>
          ))
        )}
      </ItemList>

      <CartFooter>
        <Summary>
          <div className="row">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="row">
            <span>IVA (15%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="row total">
            <span>Total a Pagar</span>
            <span>${(total + tax).toFixed(2)}</span>
          </div>
        </Summary>

        <CheckoutButton disabled={cart.length === 0}>
          PROCESAR VENTA
        </CheckoutButton>
      </CartFooter>
    </CartContainer>
  );
};

// --- Estilos ---
const CartContainer = styled.div`
  width: 380px;
  background: ${({ theme }) => theme.bg};
  border-left: 1px solid ${({ theme }) => theme.bg3}33;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CartHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3}33;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 { font-size: 1.2rem; font-weight: 700; color: ${({ theme }) => theme.bg4}; }
  .clear-btn {
    background: transparent;
    border: 1px solid ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text};
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    &:hover { background: ${({ theme }) => theme.bg3}; color: #000; }
  }
`;

const ItemList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  opacity: 0.5;
`;

const CartItemRow = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .info {
    display: flex;
    flex-direction: column;
    .name { font-weight: 600; font-size: 0.95rem; }
    .price { font-size: 0.85rem; opacity: 0.7; }
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 15px;

    .qty-group {
      display: flex;
      align-items: center;
      gap: 8px;
      background: ${({ theme }) => theme.bg2};
      padding: 4px;
      border-radius: 8px;
      button {
        background: ${({ theme }) => theme.bg4};
        color: #000;
        border: none;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      }
    }

    .delete {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      &:hover { transform: scale(1.2); }
    }
  }
`;

const CartFooter = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.bg2};
  border-top: 2px solid ${({ theme }) => theme.bg4};
`;

const Summary = styled.div`
  margin-bottom: 20px;
  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 0.95rem;
  }
  .total {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid ${({ theme }) => theme.text}22;
    font-size: 1.3rem;
    font-weight: 800;
    color: ${({ theme }) => theme.bg4};
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 18px;
  background: ${({ theme }) => theme.bg4};
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.bg3};
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(252, 163, 17, 0.3);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;
