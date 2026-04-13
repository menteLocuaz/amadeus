import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styled from "styled-components";
import { ModalOverlay, ModalContent, FormGroup, Select, Button } from "../../../shared/components/UI";
import { type FormaPago, type FormaPagoPayload } from "../services/FormasPagoService";
import { type StatusItem } from "../../../shared/store/useCatalogStore";

const schema = yup.object({
  nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(2, "Mínimo 2 caracteres"),
  requiere_ref: yup.boolean().required(),
  id_status: yup.string().required("El estado es requerido"),
});

interface FormasPagoModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSave:    (data: FormaPagoPayload) => Promise<void>;
  editing:   FormaPago | null;
  statuses:  StatusItem[];
  isSaving:  boolean;
}

export const FormasPagoModal: React.FC<FormasPagoModalProps> = ({
  isOpen, onClose, onSave, editing, statuses, isSaving,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormaPagoPayload>({
    resolver: yupResolver(schema),
    defaultValues: { nombre: "", requiere_ref: false, id_status: "" },
  });

  const requiereRef = watch("requiere_ref");

  // Halla el id del estado "Activo" en la lista de estatus disponibles
  const activeStatusId = statuses.find(s =>
    s.std_descripcion.toLowerCase().includes("activ")
  )?.id_status ?? statuses[0]?.id_status ?? "";

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      reset({
        nombre:       editing.nombre,
        requiere_ref: editing.requiere_ref,
        id_status:    editing.id_status,
      });
    } else {
      reset({
        nombre:       "",
        requiere_ref: false,
        id_status:    activeStatusId,
      });
    }
  }, [editing, isOpen, reset, activeStatusId]);

  // Si los estatus cargan después de que el modal abrió, rellena el estado
  useEffect(() => {
    if (isOpen && !editing && activeStatusId) {
      setValue("id_status", activeStatusId, { shouldValidate: false });
    }
  }, [activeStatusId, isOpen, editing, setValue]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{editing ? "Editar Forma de Pago" : "Nueva Forma de Pago"}</ModalTitle>

        <form onSubmit={handleSubmit(onSave)} noValidate>
          <FieldsGrid>
            {/* Nombre */}
            <FormGroup style={{ gridColumn: "1 / -1" }}>
              <label>Nombre</label>
              <UpperInput
                {...register("nombre")}
                placeholder="EFECTIVO, TARJETA DE CRÉDITO, TRANSFERENCIA…"
                $hasError={!!errors.nombre}
                disabled={isSaving}
              />
              {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
            </FormGroup>

            {/* Requiere referencia */}
            <FormGroup style={{ gridColumn: "1" }}>
              <label>¿Requiere Referencia?</label>
              <ToggleRow>
                <ToggleSwitch
                  $active={requiereRef}
                  onClick={() => setValue("requiere_ref", !requiereRef, { shouldValidate: true })}
                  type="button"
                  disabled={isSaving}
                >
                  <ToggleKnob $active={requiereRef} />
                </ToggleSwitch>
                <ToggleLabel $active={requiereRef}>
                  {requiereRef ? "Sí (pide número de comprobante)" : "No (como Efectivo)"}
                </ToggleLabel>
                <input type="hidden" {...register("requiere_ref")} />
              </ToggleRow>
            </FormGroup>

            {/* Estado */}
            <FormGroup style={{ gridColumn: "2" }}>
              <label>Estado</label>
              <Select {...register("id_status")} disabled={isSaving}>
                <option value="">Seleccione estado…</option>
                {statuses.map((s) => (
                  <option key={s.id_status} value={s.id_status}>
                    {s.std_descripcion}
                  </option>
                ))}
              </Select>
              {errors.id_status && <FieldError>{errors.id_status.message}</FieldError>}
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

// ─── Styled ───────────────────────────────────────────────────────────────────

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
    border-color: ${({ $hasError, theme }) => $hasError ? theme.danger : theme.primary};
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

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
`;

const ToggleSwitch = styled.button<{ $active: boolean }>`
  all: unset;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: ${({ $active, theme }) => $active ? theme.primary : `${theme.bg3}66`};
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
`;

const ToggleKnob = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 3px;
  left: ${({ $active }) => ($active ? "23px" : "3px")};
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: left 0.2s;
`;

const ToggleLabel = styled.span<{ $active: boolean }>`
  font-size: 0.8rem;
  color: ${({ $active, theme }) => $active ? theme.primary : theme.texttertiary};
`;

const FieldError = styled.small`
  color: ${({ theme }) => theme.danger};
  font-size: 0.75rem;
  margin-top: 4px;
  display: block;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(150, 150, 150, 0.1);
`;
