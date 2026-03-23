import styled from "styled-components";

export const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg2};
`;

export const ProductImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
`;
