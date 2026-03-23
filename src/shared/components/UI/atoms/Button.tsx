import styled, { css } from "styled-components";

const accent = (p: any) => p.theme?.primary || "#FCA311";
const text = (p: any) => p.theme?.text || "#F8FAFC";
const borderColor = (p: any) => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)";

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

export const IconButton = styled.button<{ $danger?: boolean }>`
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: ${p => p.theme?.bg2 || "rgba(255,255,255,0.03)"};
  border: 1px solid ${p => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)"};
  cursor: pointer;
  color: ${p => p.$danger ? "#FF6B6B" : text(p)};
  transition: all 0.1s;
  &:hover {
    background: ${p => p.$danger ? "rgba(255,107,107,0.1)" : p.theme?.bg3 ? `${p.theme.bg3}22` : "rgba(255,255,255,0.1)"};
  }
`;

export const ActionBtn = styled.button<{ $variant?: "edit" | "delete" | "close" }>`
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${({ $variant, theme }) =>
    $variant === "delete" ? "#ff4d4d" : $variant === "close" ? theme.text : theme.bg4};
  border-radius: 8px;
  font-size: 1.2rem;
  transition: all 0.12s;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ $variant }) =>
      $variant === "delete" ? "rgba(255,77,77,0.09)" : "rgba(252,163,17,0.08)"};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
