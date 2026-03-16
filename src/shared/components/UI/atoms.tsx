import styled, { css } from "styled-components";

/* ---------- Theme helpers (usa tus variables de theme) ---------- */
const accent = (p: any) => p.theme?.accent || "#FCA311";
const bg = (p: any) => p.theme?.bg || "#0f1720";
const cardBg = (p: any) => p.theme?.cardBg || "#111827";
const text = (p: any) => p.theme?.text || "#F8FAFC";

/* ---------- Buttons ---------- */
export const Button = styled.button<{ $variant?: "primary" | "secondary" | "ghost"; $radius?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  border-radius: ${p => p.$radius ?? "10px"};
  border: none;
  color: ${text};
  transition: all 0.15s ease;

  ${p => p.$variant === "primary" && css`
    background: ${accent(p)};
    color: #000;
  `}

  ${p => p.$variant === "secondary" && css`
    background: rgba(255,255,255,0.04);
    color: ${text(p)};
    border: 1px solid rgba(255,255,255,0.04);
  `}

  ${p => p.$variant === "ghost" && css`
    background: transparent;
    color: ${text(p)};
  `}

  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

/* Icon button small */
export const IconButton = styled.button<{ $danger?: boolean }>`
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.03);
  cursor: pointer;
  color: ${p => p.$danger ? "#FF6B6B" : text(p)};
`;

/* ---------- Layout atoms ---------- */
export const PageContainer = styled.div`
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
`;

/* Card */
export const Card = styled.div<{ $p?: string }>`
  background: ${cardBg};
  border-radius: 12px;
  padding: ${p => p.$p ?? "16px"};
  border: 1px solid rgba(255,255,255,0.03);
  box-shadow: 0 6px 18px rgba(2,6,23,0.6);
`;

/* Grid for product cards */
export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
`;

/* Product card */
export const ProductCard = styled.button`
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.03);
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
  text-align: center;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 20px rgba(3,7,18,0.6);
  }

  .name { font-weight: 700; font-size: 0.95rem; color: ${text}; }
  .price { color: ${p => p.theme?.green500 ?? "#22C55E"}; }
`;

/* Product thumbnail (image) */
export const ProductImage = styled.img`
  width: 92px;
  height: 92px;
  object-fit: cover;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(2,6,23,0.6);
`;

/* ---------- Cart Panel atoms ---------- */
export const CartPanel = styled.aside`
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* Cart item row */
export const CartItemRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  background: rgba(255,255,255,0.01);
  border-radius: 10px;

  .meta { flex: 1; }
  .name { font-weight: 700; }
  .muted { font-size: 0.9rem; opacity: 0.6; }
`;

/* Quantity controls */
export const QtyControls = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  background: rgba(255,255,255,0.02);
  padding: 4px;
  border-radius: 8px;
`;

/* Divider */
export const Divider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.03);
  width: 100%;
  margin: 6px 0;
`;

/* Small badge */
export const Tag = styled.span<{ $color?: string }>`
  padding: 6px 8px;
  border-radius: 999px;
  background: ${p => p.$color ?? "rgba(255,255,255,0.04)"};
  font-weight: 700;
  color: ${text};
  font-size: 0.85rem;
`;

/* Text input / textarea */
export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.04);
  background: transparent;
  color: ${text};
  outline: none;
`;

/* Exports for convenience */
export default {
  Button,
  IconButton,
  PageContainer,
  Card,
  ProductGrid,
  ProductCard,
  ProductImage,
  CartPanel,
  CartItemRow,
  QtyControls,
  Divider,
  Tag,
  Input
};