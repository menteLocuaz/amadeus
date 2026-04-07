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
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.bg3}22;
    background: ${({ theme }) => theme.bg2}44;
    outline: none;
    color: ${({ theme }) => theme.text};
    transition: all 0.15s ease;
    &:focus { border-color: ${({ theme }) => theme.primary}; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
  textarea { min-height: 80px; resize: vertical; }
`;
