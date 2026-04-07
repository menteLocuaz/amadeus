import styled from "styled-components";

export const Badge = styled.span<{ $color?: string; $variant?: "outline" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  border: ${({ $variant, $color, theme }) =>
    $variant === "outline" ? `1px solid ${$color || theme.primary}44` : "1px solid transparent"};
  
  background: ${({ $variant, $color, theme }) =>
    $variant === "outline"
      ? "transparent"
      : `${$color || theme.primary}15`};
  
  color: ${({ $variant, $color, theme }) =>
    $color || theme.primary};
`;

export const Tag = styled.span<{ $color?: string }>`
  padding: 4px 10px;
  border-radius: 6px;
  background: ${p => p.$color ?? (p.theme?.bg2 || "rgba(255,255,255,0.04)")};
  font-weight: 600;
  color: ${p => p.theme?.text || "#F8FAFC"};
  font-size: 0.8rem;
  letter-spacing: 0.02em;
`;
