import { memo } from "react";
import styled from "styled-components";

const cardBg = (p: any) => p.theme?.bg || "#111827";
const text = (p: any) => p.theme?.text || "#F8FAFC";
const borderColor = (p: any) => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)";

export const ProductCard = memo(styled.button`
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
  .price { color: ${p => (p.theme as any)?.green500 || "#22C55E"}; font-weight: 800; font-size: 1.1rem; }
`);
