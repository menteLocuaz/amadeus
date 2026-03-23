import styled from "styled-components";

export const FormGroup = styled.div`
  margin-bottom: 18px;
  label {
    display: block;
    font-weight: 700;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.bg4};
    font-size: 0.9rem;
  }
  input, select, textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid ${({ theme }) => theme.bg3}33;
    background: ${({ theme }) => theme.bg2};
    outline: none;
    color: ${({ theme }) => theme.text};
    transition: border-color 0.12s;
    &:focus { border-color: ${({ theme }) => theme.bg4}; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
  textarea { min-height: 80px; resize: vertical; }
`;
