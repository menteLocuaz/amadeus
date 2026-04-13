import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ModalOverlay, ModalContent, FormGroup, Input, Select,
  Button
} from "../../../shared/components/UI";
import { type Cliente, type TipoDocumento } from "../services/ClienteService";
import { type StatusItem } from "../../../shared/store/useCatalogStore";

interface ClienteFormData {
  nombre_completo: string;
  tipo_documento: TipoDocumento;
  documento: string;
  email: string;
  telefono: string;
  direccion: string;
  id_status: string;
  categoria_fidelidad: string;
  fecha_nacimiento: string;
  limite_credito: string;
}

const TIPOS_DOCUMENTO: TipoDocumento[] = ["CEDULA", "RUC", "PASAPORTE"];

const schema = yup.object({
  nombre_completo:    yup.string().required("El nombre completo es requerido"),
  tipo_documento:     yup.string().oneOf(TIPOS_DOCUMENTO).required("El tipo de documento es requerido"),
  documento:          yup.string().required("El número de documento es requerido"),
  email:              yup.string().email("Email inválido").required("El email es requerido"),
  telefono:           yup.string().required("El teléfono es requerido"),
  direccion:          yup.string().required("La dirección es requerida"),
  id_status:          yup.string().required("El estado es requerido"),
  categoria_fidelidad: yup.string(),
  fecha_nacimiento:   yup.string(),
  limite_credito:     yup.string(),
});

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Cliente) => Promise<void>;
  editingCliente: Cliente | null;
  statuses: StatusItem[];
  isSaving: boolean;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen, onClose, onSave, editingCliente, statuses, isSaving
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClienteFormData>({
    resolver: yupResolver(schema) as any,
  });

  useEffect(() => {
    if (editingCliente) {
      reset({
        nombre_completo:    editingCliente.nombre_completo,
        tipo_documento:     editingCliente.tipo_documento,
        documento:          editingCliente.documento,
        email:              editingCliente.email,
        telefono:           editingCliente.telefono,
        direccion:          editingCliente.direccion,
        id_status:          editingCliente.id_status,
        categoria_fidelidad: editingCliente.metadata?.categoria_fidelidad ?? "",
        fecha_nacimiento:   editingCliente.metadata?.fecha_nacimiento ?? "",
        limite_credito:     editingCliente.metadata?.limite_credito?.toString() ?? "",
      });
    } else {
      reset({
        nombre_completo:    "",
        tipo_documento:     "CEDULA",
        documento:          "",
        email:              "",
        telefono:           "",
        direccion:          "",
        id_status:          statuses[0]?.id_status ?? "",
        categoria_fidelidad: "",
        fecha_nacimiento:   "",
        limite_credito:     "",
      });
    }
  }, [editingCliente, reset, isOpen, statuses]);

  const handleFormSubmit = (formData: ClienteFormData) => {
    const payload: Cliente = {
      nombre_completo: formData.nombre_completo,
      tipo_documento:  formData.tipo_documento,
      documento:       formData.documento,
      email:           formData.email,
      telefono:        formData.telefono,
      direccion:       formData.direccion,
      id_status:       formData.id_status,
      metadata: {
        categoria_fidelidad: formData.categoria_fidelidad || undefined,
        fecha_nacimiento:    formData.fecha_nacimiento    || undefined,
        limite_credito:      formData.limite_credito ? parseFloat(formData.limite_credito) : undefined,
      },
    };
    return onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: 24 }}>{editingCliente ? "Editar Cliente" : "Nuevo Cliente"}</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)}>

          {/* Sección principal */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormGroup style={{ gridColumn: "span 2" }}>
              <label>Nombre Completo</label>
              <Input {...register("nombre_completo")} $error={!!errors.nombre_completo} placeholder="Juan Pérez" />
              {errors.nombre_completo && <small style={{ color: "red" }}>{errors.nombre_completo.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>Tipo de Documento</label>
              <Select {...register("tipo_documento")} $error={!!errors.tipo_documento}>
                {TIPOS_DOCUMENTO.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
              {errors.tipo_documento && <small style={{ color: "red" }}>{errors.tipo_documento.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>Número de Documento</label>
              <Input {...register("documento")} $error={!!errors.documento} placeholder="1234567890" />
              {errors.documento && <small style={{ color: "red" }}>{errors.documento.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>Email</label>
              <Input {...register("email")} type="email" $error={!!errors.email} placeholder="correo@ejemplo.com" />
              {errors.email && <small style={{ color: "red" }}>{errors.email.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>Teléfono</label>
              <Input {...register("telefono")} $error={!!errors.telefono} placeholder="+505 8888-8888" />
              {errors.telefono && <small style={{ color: "red" }}>{errors.telefono.message}</small>}
            </FormGroup>

            <FormGroup style={{ gridColumn: "span 2" }}>
              <label>Dirección</label>
              <Input {...register("direccion")} $error={!!errors.direccion} placeholder="Costado norte de la Catedral, Managua" />
              {errors.direccion && <small style={{ color: "red" }}>{errors.direccion.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>Estado</label>
              <Select {...register("id_status")} $error={!!errors.id_status}>
                {statuses.map(s => (
                  <option key={s.id_status} value={s.id_status}>{s.std_descripcion}</option>
                ))}
              </Select>
              {errors.id_status && <small style={{ color: "red" }}>{errors.id_status.message}</small>}
            </FormGroup>
          </div>

          {/* Metadata adicional */}
          <p style={{ margin: "20px 0 12px", fontSize: "0.8rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>
            Datos Adicionales (opcional)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <FormGroup>
              <label>Categoría de Fidelidad</label>
              <Input {...register("categoria_fidelidad")} placeholder="VIP, REGULAR..." />
            </FormGroup>

            <FormGroup>
              <label>Fecha de Nacimiento</label>
              <Input {...register("fecha_nacimiento")} type="date" />
            </FormGroup>

            <FormGroup>
              <label>Límite de Crédito</label>
              <Input {...register("limite_credito")} type="number" step="0.01" placeholder="0.00" />
            </FormGroup>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <Button type="button" $variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};
