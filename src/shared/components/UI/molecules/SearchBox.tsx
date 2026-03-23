import styled from "styled-components";

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.bg2};
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.bg3}33;
  width: 300px;
  input {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    outline: none;
    width: 100%;
    font-size: 0.9rem;
    &::placeholder { opacity: 0.5; }
  }
  svg {
    opacity: 0.5;
  }
`;
