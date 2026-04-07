import styled, { css } from "styled-components";

const accent = (p: any) => p.theme?.primary || "#FCA311";
const text = (p: any) => p.theme?.text || "#F8FAFC";
const borderColor = (p: any) => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)";

export const Button = styled.button<{ $variant?: "primary" | "secondary" | "ghost"; $radius?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: ${p => p.$radius ?? "10px"};
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  ${p => (p.$variant === "primary" || !p.$variant) && css`
    background: ${accent(p)};
    color: #000;
    &:hover { 
      filter: brightness(1.05); 
      transform: translateY(-1px);
      box-shadow: 0 4px 12px ${accent(p)}33;
    }
  `}

  ${p => p.$variant === "secondary" && css`
    background: ${p.theme?.bg2}40;
    color: ${text(p)};
    border: 1px solid ${borderColor(p)};
    &:hover { 
      background: ${p.theme?.bg2}80;
      border-color: ${p.theme?.bg3}66;
    }
  `}

  ${p => p.$variant === "ghost" && css`
    background: transparent;
    color: ${text(p)};
    &:hover { background: ${p.theme?.bg2}33; }
  `}

  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`;

export const IconButton = styled.button<{ $danger?: boolean }>`
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: ${p => p.theme?.bg2 || "rgba(255,255,255,0.03)"};
  border: 1px solid ${p => p.theme?.bg3 ? `${p.theme.bg3}22` : "rgba(255,255,255,0.05)"};
  cursor: pointer;
  color: ${p => p.$danger ? "#FF6B6B" : text(p)};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${p => p.$danger ? "rgba(255,107,107,0.1)" : p.theme?.bg3 ? `${p.theme.bg3}15` : "rgba(255,255,255,0.08)"};
    border-color: ${p => p.$danger ? "#FF6B6B" : p.theme?.bg3 ? `${p.theme.bg3}44` : "rgba(255,255,255,0.1)"};
  }
`;

export const ActionBtn = styled.button<{ $variant?: "edit" | "delete" | "close" }>`
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${({ $variant, theme }) =>
    $variant === "delete" ? theme.danger : $variant === "close" ? theme.textsecondary : theme.primary};
  border-radius: 8px;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ $variant, theme }) =>
      $variant === "delete" ? `${theme.danger}15` : `${theme.primary}15`};
    transform: scale(1.05);
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;
