import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  ModalOverlay, ModalContent, FormGroup, Input, Select, 
  Button 
} from "../../../shared/components/UI";
import { type Cliente } from "../services/ClienteService";
import { type StatusItem } from "../../../shared/store/useCatalogStore";

const schema = yup.object({
  empresa_cliente: yup.string().required("La empresa es requerida"),
  nombre: yup.string().required("El nombre es requerido"),
  ruc: yup.string().required("El RUC/ID es requerido"),
  direccion: yup.string().required("La dirección es requerida"),
  telefono: yup.string().required("El teléfono es requerido"),
  email: yup.string().email("Email inválido").required("El email es requerido"),
  id_status: yup.string().required("El estado es requerido"),
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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Cliente>({
    resolver: yupResolver(schema) as any,
  });

  useEffect(() => {
    if (editingCliente) {
      reset(editingCliente);
    } else {
      reset({
        empresa_cliente: "",
        nombre: "",
        ruc: "",
        direccion: "",
        telefono: "",
        email: "",
        id_status: statuses[0]?.id_status || "",
      });
    }
  }, [editingCliente, reset, isOpen, statuses]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: 24 }}>{editingCliente ? "Editar Cliente" : "Nuevo Cliente"}</h2>
        <form onSubmit={handleSubmit(onSave)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup>
              <label>Empresa</label>
              <Input {...register("empresa_cliente")} $error={!!errors.empresa_cliente} />
              {errors.empresa_cliente && <small style={{color: 'red'}}>{errors.empresa_cliente.message}</small>}
            </FormGroup>
            
            <FormGroup>
              <label>Contacto / Nombre</label>
              <Input {...register("nombre")} $error={!!errors.nombre} />
              {errors.nombre && <small style={{color: 'red'}}>{errors.nombre.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>RUC / Cédula</label>
              <Input {...register("ruc")} $error={!!errors.ruc} />
              {errors.ruc && <small style={{color: 'red'}}>{errors.ruc.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>Email</label>
              <Input {...register("email")} $error={!!errors.email} />
              {errors.email && <small style={{color: 'red'}}>{errors.email.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>Teléfono</label>
              <Input {...register("telefono")} $error={!!errors.telefono} />
              {errors.telefono && <small style={{color: 'red'}}>{errors.telefono.message}</small>}
            </FormGroup>

            <FormGroup>
              <label>Estado</label>
              <Select {...register("id_status")} $error={!!errors.id_status}>
                {statuses.map(s => (
                  <option key={s.id_status} value={s.id_status}>{s.std_descripcion}</option>
                ))}
              </Select>
            </FormGroup>
          </div>

          <FormGroup style={{ gridColumn: 'span 2' }}>
            <label>Dirección</label>
            <Input {...register("direccion")} $error={!!errors.direccion} />
            {errors.direccion && <small style={{color: 'red'}}>{errors.direccion.message}</small>}
          </FormGroup>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
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
