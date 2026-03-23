import styled from "styled-components";

const cardBg = (p: any) => p.theme?.bg || "#111827";
const borderColor = (p: any) => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)";

export const Card = styled.div<{ $p?: string }>`
  background: ${cardBg};
  border-radius: 20px;
  padding: ${p => p.$p ?? "24px"};
  border: 1px solid ${borderColor};
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

export const TableCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg3}22;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;
