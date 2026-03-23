import styled from "styled-components";

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`;

export const Grid = styled.div<{ $cols?: string; $gap?: string }>`
  display: grid;
  grid-template-columns: ${p => p.$cols ?? "1fr 1fr"};
  gap: ${p => p.$gap ?? "20px"};
`;
