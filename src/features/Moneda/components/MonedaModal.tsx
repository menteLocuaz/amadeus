import React, { memo } from "react";
import styled from "styled-components";
import { FiX, FiCheckCircle, FiTerminal, FiGlobe, FiInfo } from "react-icons/fi";
import { BeatLoader } from "react-spinners";
import { type Moneda } from "../services/MonedaService";
import { type MonedaFormData } from "../hooks/useMonedaPage";

/* ------------------------------ Styled UI ------------------------------- */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const TerminalContent = styled.div`
  width: 100%;
  max-width: 500px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}44;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: ${({ theme }) => theme.bg4};
  }
`;

const TerminalHeader = styled.div`
  padding: 24px 32px;
  background: ${({ theme }) => theme.bg2}33;
  border-bottom: 1px solid ${({ theme }) => theme.bg3}22;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title-group {
    span {
      font-family: "JetBrains Mono", monospace;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: ${({ theme }) => theme.bg4};
      opacity: 0.8;
    }
    h2 {
      margin: 4px 0 0;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: ${({ theme }) => theme.text};
    }
  }
`;

const CloseButton = styled.button`
  all: unset;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s;
  color: ${({ theme }) => theme.texttertiary};

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: ${({ theme }) => theme.danger};
  }
`;

const FormBody = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TechFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${({ theme }) => theme.texttertiary};
    display: flex;
    align-items: center;
    gap: 8px;
  }

  input, select {
    width: 100%;
    padding: 12px 16px;
    background: ${({ theme }) => theme.bg2}66;
    border: 1px solid ${({ theme }) => theme.bg3}44;
    border-radius: 8px;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: ${({ theme }) => theme.bg4};
      background: ${({ theme }) => theme.bg};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.bg4}11;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const MintBtn = styled.button<{ $primary?: boolean }>`
  all: unset;
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  ${({ $primary, theme }) => $primary ? `
    background: ${theme.bg4};
    color: ${theme.bg};
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px ${theme.bg4}33;
    }
  ` : `
    background: ${theme.bg2}80;
    color: ${theme.text};
    border: 1px solid ${theme.bg3}22;
    &:hover:not(:disabled) {
      background: ${theme.bg2};
    }
  `}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/* ------------------------------- Component ------------------------------- */
export const MonedaModal: React.FC<Props> = memo(({
  editingMoneda, formData, sucursales,
  isSaving, isDeletingId,
  onChange, onSave, onClose,
}) => {
  const isEditing = Boolean(editingMoneda);
  const isBusy    = isSaving || isDeletingId !== null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <TerminalContent>
        <TerminalHeader>
          <div className="title-group">
            <span>Provisioning_Asset //</span>
            <h2>{isEditing ? "Modificar Divisa" : "Nueva Divisa"}</h2>
          </div>
          <CloseButton onClick={onClose} disabled={isBusy}>
            <FiX size={20} />
          </CloseButton>
        </TerminalHeader>

        <FormBody>
          <TechFormGroup>
            <label><FiTerminal size={12} /> Asset_Identifier</label>
            <input
              placeholder="Ej: Dólar Estadounidense (USD)"
              value={formData.nombre}
              onChange={(e) => onChange({ ...formData, nombre: e.target.value })}
              disabled={isBusy}
              autoFocus
              required
            />
          </TechFormGroup>

          <TechFormGroup>
            <label><FiGlobe size={12} /> Network_Node_Assignment</label>
            <select
              value={formData.id_sucursal}
              onChange={(e) => onChange({ ...formData, id_sucursal: e.target.value })}
              disabled={isBusy}
              required
            >
              <option value="">-- Seleccionar Nodo --</option>
              {sucursales.map((s) => (
                <option key={s.id_sucursal} value={s.id_sucursal}>
                  {s.nombre_sucursal}
                </option>
              ))}
            </select>
          </TechFormGroup>

          <ActionRow>
            <MintBtn onClick={onClose} disabled={isBusy}>
              Cancelar
            </MintBtn>
            <MintBtn $primary onClick={onSave} disabled={isBusy}>
              {isSaving ? (
                <BeatLoader size={8} color="currentColor" />
              ) : (
                <>
                  <FiCheckCircle size={18} />
                  {isEditing ? "Confirmar_Cambios" : "Ejecutar_Registro"}
                </>
              )}
            </MintBtn>
          </ActionRow>

          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.3, fontSize: "0.65rem", fontFamily: "JetBrains Mono", justifyContent: "center" }}>
            <FiInfo size={10} />
            AUTORIZACIÓN_REQUERIDA_PARA_OPERACIONES_DE_VALOR
          </div>
        </FormBody>
      </TerminalContent>
    </ModalOverlay>
  );
});

export default MonedaModal;
