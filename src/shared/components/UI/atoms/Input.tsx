import styled from "styled-components";

const accent = (p: any) => p.theme?.primary || "#FCA311";
const text = (p: any) => p.theme?.text || "#F8FAFC";
const borderColor = (p: any) => p.theme?.bg3 ? `${p.theme.bg3}33` : "rgba(255,255,255,0.05)";

export const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${borderColor};
  background: ${p => p.theme?.bg2 || "transparent"};
  color: ${text};
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: ${accent};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${borderColor};
  background: ${p => p.theme?.bg2 || "transparent"};
  outline: none;
  color: ${text};
  transition: border-color 0.12s;
  &:focus { border-color: ${accent}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${borderColor};
  background: ${p => p.theme?.bg2 || "transparent"};
  outline: none;
  color: ${text};
  transition: border-color 0.12s;
  min-height: 80px;
  resize: vertical;
  &:focus { border-color: ${accent}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
