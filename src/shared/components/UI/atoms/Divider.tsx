import styled from "styled-components";

const borderColor = (p: any) => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)";

export const Divider = styled.div`
  height: 1px;
  background: ${borderColor};
  width: 100%;
  margin: 16px 0;
`;
