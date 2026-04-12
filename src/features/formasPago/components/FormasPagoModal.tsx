import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ModalOverlay, ModalContent, FormGroup, Input, Select, Button } from "../../../shared/components/UI";
import { type FormaPago, type FormaPagoPayload } from "../services/FormasPagoService";
import { type StatusItem } from "../../../shared/store/useCatalogStore";

const schema = yup.object({
  fmp_codigo: yup
    .string()
    .required("El código es requerido")
    .max(5, "Máximo 5 caracteres")
    .matches(/^[A-Za-z0-9-]+$/, "Solo letras, números y guión"),
  fmp_descripcion: yup
    .string()
    .required("La descripción es requerida")
    .min(2, "Mínimo 2 caracteres"),
  id_status: yup.string().required("El estado es requerido"),
});

interface FormasPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormaPagoPayload) => Promise<void>;
  editing: FormaPago | null;
  statuses: StatusItem[];
  isSaving: boolean;
}

export const FormasPagoModal: React.FC<FormasPagoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editing,
  statuses,
  isSaving,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormaPagoPayload>({
    resolver: yupResolver(schema),
  });

  const codigoValue = watch("fmp_codigo", "");

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      reset({
        fmp_codigo: editing.fmp_codigo,
        fmp_descripcion: editing.fmp_descripcion,
        id_status: editing.id_status,
      });
    } else {
      reset({
        fmp_codigo: "",
        fmp_descripcion: "",
        id_status: statuses[0]?.id_status ?? "",
      });
    }
  }, [editing, isOpen, reset, statuses]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{editing ? "Editar Forma de Pago" : "Nueva Forma de Pago"}</ModalTitle>

        <form onSubmit={handleSubmit(onSave)} noValidate>
          <FieldsGrid>
            {/* Código */}
            <FormGroup style={{ gridColumn: "1" }}>
              <label>Código</label>
              <CodigoWrapper>
                <CodigoPreview $empty={!codigoValue}>
                  {codigoValue ? codigoValue.toUpperCase() : "??"}
                </CodigoPreview>
                <UpperInput
                  {...register("fmp_codigo")}
                  placeholder="EF, TJ, QR…"
                  maxLength={5}
                  $hasError={!!errors.fmp_codigo}
                />
              </CodigoWrapper>
              {errors.fmp_codigo && <FieldError>{errors.fmp_codigo.message}</FieldError>}
              <FieldHint>Máx. 5 caracteres. Se usará como identificador visual.</FieldHint>
            </FormGroup>

            {/* Estado */}
            <FormGroup style={{ gridColumn: "2" }}>
              <label>Estado</label>
              <Select {...register("id_status")}>
                {statuses.map((s) => (
                  <option key={s.id_status} value={s.id_status}>
                    {s.std_descripcion}
                  </option>
                ))}
              </Select>
              {errors.id_status && <FieldError>{errors.id_status.message}</FieldError>}
            </FormGroup>

            {/* Descripción — ocupa ambas columnas */}
            <FormGroup style={{ gridColumn: "1 / -1" }}>
              <label>Descripción</label>
              <UpperInput
                {...register("fmp_descripcion")}
                placeholder="EFECTIVO, TARJETA DE CRÉDITO, PAGO QR…"
                $hasError={!!errors.fmp_descripcion}
              />
              {errors.fmp_descripcion && <FieldError>{errors.fmp_descripcion.message}</FieldError>}
            </FormGroup>
          </FieldsGrid>

          <Actions>
            <Button type="button" $variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando…" : editing ? "Guardar cambios" : "Crear forma de pago"}
            </Button>
          </Actions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

// ─── Styled helpers (inline via styled-components import) ─────────────────────
import styled from "styled-components";

const UpperInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ $hasError, theme }) =>
    $hasError ? theme.danger : `${theme.bg3}33`};
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text};
  outline: none;
  text-transform: uppercase;
  font-family: inherit;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  &:focus {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.danger : theme.primary};
  }
`;

const ModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textprimary};
  margin: 0 0 24px;
  letter-spacing: -0.02em;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const CodigoWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const CodigoPreview = styled.div<{ $empty: boolean }>`
  min-width: 46px;
  height: 40px;
  border-radius: 8px;
  background: ${({ $empty }) =>
    $empty ? "rgba(150,150,150,0.08)" : "rgba(252,163,17,0.12)"};
  color: ${({ $empty, theme }) => ($empty ? theme.texttertiary : theme.primary)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  font-family: "SF Mono", "Fira Code", monospace;
  border: 1px solid
    ${({ $empty }) =>
      $empty ? "rgba(150,150,150,0.12)" : "rgba(252,163,17,0.2)"};
  transition: all 0.15s ease;
  flex-shrink: 0;
`;

const FieldError = styled.small`
  color: ${({ theme }) => theme.danger};
  font-size: 0.75rem;
  margin-top: 4px;
  display: block;
`;

const FieldHint = styled.small`
  color: ${({ theme }) => theme.texttertiary};
  font-size: 0.72rem;
  margin-top: 3px;
  display: block;
  opacity: 0.75;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(150, 150, 150, 0.1);
`;
