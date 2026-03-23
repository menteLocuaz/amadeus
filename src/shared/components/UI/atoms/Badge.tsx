import styled from "styled-components";

export const Badge = styled.span<{ $color?: string; $variant?: "outline" }>`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  border: ${({ $variant, $color, theme }) =>
    $variant === "outline" ? `1px solid ${$color || theme.bg4}55` : "none"};
  background: ${({ $variant, $color }) =>
    $variant === "outline"
      ? "transparent"
      : $color || "rgba(252, 163, 17, 0.1)"};
  color: ${({ $variant, $color, theme }) =>
    $variant === "outline"
      ? $color || theme.bg4
      : $color
      ? "#fff"
      : theme.bg4};
`;

export const Tag = styled.span<{ $color?: string }>`
  padding: 6px 8px;
  border-radius: 999px;
  background: ${p => p.$color ?? (p.theme?.bg2 || "rgba(255,255,255,0.04)")};
  font-weight: 700;
  color: ${p => p.theme?.text || "#F8FAFC"};
  font-size: 0.85rem;
`;
