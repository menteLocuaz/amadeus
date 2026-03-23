import styled from "styled-components";

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    background: ${({ theme }) => theme.bg2};
    padding: 18px;
    text-align: left;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.bg4};
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }
  td {
    padding: 18px;
    border-bottom: 1px solid ${({ theme }) => theme.bg3}11;
    color: ${({ theme }) => theme.text};
    vertical-align: middle;
  }
`;
