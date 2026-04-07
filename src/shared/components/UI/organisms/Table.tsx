import styled from "styled-components";

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  th {
    padding: 18px 24px;
    text-align: left;
    font-size: 0.7rem;
    color: ${({ theme }) => theme.texttertiary};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    border-bottom: 1px solid ${({ theme }) => theme.bg3}22;
    background: ${({ theme }) => theme.bg2}22;
  }
  
  td {
    padding: 20px 24px;
    border-bottom: 1px solid ${({ theme }) => theme.bg3}08;
    color: ${({ theme }) => theme.text};
    vertical-align: middle;
    font-size: 0.925rem;
    transition: background 0.2s ease;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover td {
    background: ${({ theme }) => theme.bg2}15;
  }
`;
