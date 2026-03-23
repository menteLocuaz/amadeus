import styled from "styled-components";

const text = (p: any) => p.theme?.text || "#F8FAFC";
const borderColor = (p: any) => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)";

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
