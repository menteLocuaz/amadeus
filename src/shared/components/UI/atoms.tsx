import styled, { css } from "styled-components";

/* ---------- Theme helpers (usa tus variables de theme) ---------- */
const accent = (p: any) => p.theme?.primary || "#FCA311";
const cardBg = (p: any) => p.theme?.bg || "#111827";
const text = (p: any) => p.theme?.text || "#F8FAFC";
// bg322 is used for borders in other UI elements: ${({ theme }) => theme.bg3}22
const borderColor = (p: any) => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)";

/* ---------- Buttons ---------- */
export const Button = styled.button<{ $variant?: "primary" | "secondary" | "ghost"; $radius?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  border-radius: ${p => p.$radius ?? "12px"};
  border: none;
  transition: all 0.15s ease;

  ${p => (p.$variant === "primary" || !p.$variant) && css`
    background: ${accent(p)};
    color: #000;
  `}

  ${p => p.$variant === "secondary" && css`
    background: ${p.theme?.bg2 || "rgba(255,255,255,0.04)"};
    color: ${text(p)};
    border: 1px solid ${borderColor(p)};
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
  background: ${p => p.theme?.bg2 || "rgba(255,255,255,0.03)"};
  border: 1px solid ${borderColor};
  cursor: pointer;
  color: ${p => p.$danger ? "#FF6B6B" : text(p)};
  transition: all 0.1s;
  &:hover {
    background: ${p => p.$danger ? "rgba(255,107,107,0.1)" : p.theme?.bg3 ? `${p.theme.bg3}22` : "rgba(255,255,255,0.1)"};
  }
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
  border-radius: 20px;
  padding: ${p => p.$p ?? "24px"};
  border: 1px solid ${borderColor};
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

/* Grid for product cards */
export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`;

/* Product card */
export const ProductCard = styled.button`
  background: ${cardBg};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  border: 1px solid ${borderColor};
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  }

  .name { font-weight: 700; font-size: 0.95rem; color: ${text}; }
  .price { color: ${p => p.theme?.green500 || "#22C55E"}; font-weight: 800; font-size: 1.1rem; }
`;

/* Product thumbnail (image) */
export const ProductImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
`;

/* ---------- Cart Panel atoms ---------- */
export const CartPanel = styled.aside`
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* Cart item row */
export const CartItemRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: ${p => p.theme?.bg2 || "rgba(255,255,255,0.01)"};
  border-radius: 12px;
  border: 1px solid ${borderColor};

  .meta { flex: 1; text-align: left; }
  .name { font-weight: 700; color: ${text}; }
  .muted { font-size: 0.85rem; opacity: 0.7; color: ${text}; }
`;

/* Quantity controls */
export const QtyControls = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  background: transparent;
  padding: 4px;
`;

/* Divider */
export const Divider = styled.div`
  height: 1px;
  background: ${borderColor};
  width: 100%;
  margin: 16px 0;
`;

/* Small badge */
export const Tag = styled.span<{ $color?: string }>`
  padding: 6px 8px;
  border-radius: 999px;
  background: ${p => p.$color ?? (p.theme?.bg2 || "rgba(255,255,255,0.04)")};
  font-weight: 700;
  color: ${text};
  font-size: 0.85rem;
`;

/* Text input / textarea */
export const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${borderColor};
  background: ${p => p.theme?.bg2 || "transparent"};
  color: ${text};
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: ${accent};
  }
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