import React, { useState } from "react";
import { BeatLoader } from "react-spinners";
import { FiUsers, FiShield, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";
import { getAvatarColor, getInitials } from "../constants/usuarios";
import { 
  FormGrid, Section, InputGroup, PreviewCard, ActionBtn, Badge 
} from "../styles/UserStyles";

interface UserFormProps {
  register: any;
  handleSubmit: any;
  onSubmit: (data: any) => void;
  errors: any;
  watch: any;
  isSaving: boolean;
  editingItem: any;
  roles: any[];
  sucursales: any[];
  statusList: any[];
}

const UserForm: React.FC<UserFormProps> = ({
  register, handleSubmit, onSubmit, errors, watch,
  isSaving, editingItem, roles, sucursales, statusList
}) => {
  const [showPass, setShowPass] = useState(false);

  const wName = watch("nombre", "");
  const wLast = watch("apellido", "");
  const wEmail = watch("email", "");
  const wTicket = watch("nombre_ticket", "");
  const wPin = watch("usu_pin_pos", "");
  const full = `${wName} ${wLast}`.trim() || "Usuario Nuevo";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGrid>
        <div>
          <Section>
            <div className="title"><FiUsers /> Datos de Identidad</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <InputGroup $error={!!errors.nombre}>
                <label>Nombre(s)</label>
                <div className="input-wrap"><input {...register("nombre")} placeholder="Ej: Juan" /></div>
                {errors.nombre && <div className="err"><FiX /> {errors.nombre.message}</div>}
              </InputGroup>
              <InputGroup $error={!!errors.apellido}>
                <label>Apellidos</label>
                <div className="input-wrap"><input {...register("apellido")} placeholder="Ej: Pérez" /></div>
                {errors.apellido && <div className="err"><FiX /> {errors.apellido.message}</div>}
              </InputGroup>
              <InputGroup $error={!!errors.usu_dni}>
                <label>DNI / Documento Identidad</label>
                <div className="input-wrap"><input {...register("usu_dni")} placeholder="12345678" /></div>
                {errors.usu_dni && <div className="err"><FiX /> {errors.usu_dni.message}</div>}
              </InputGroup>
              <InputGroup $error={!!errors.email}>
                <label>Correo Electrónico Corp.</label>
                <div className="input-wrap"><input {...register("email")} placeholder="nombre@empresa.com" /></div>
                {errors.email && <div className="err"><FiX /> {errors.email.message}</div>}
              </InputGroup>
              <InputGroup $error={!!errors.usu_telefono}>
                <label>Teléfono / Celular</label>
                <div className="input-wrap"><input {...register("usu_telefono")} placeholder="+502 5555-4444" /></div>
                {errors.usu_telefono && <div className="err"><FiX /> {errors.usu_telefono.message}</div>}
              </InputGroup>
            </div>
          </Section>

          <Section>
            <div className="title"><FiShield /> Seguridad & Acceso</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <InputGroup $error={!!errors.username} style={{ gridColumn: 'span 2' }}>
                <label>Nombre de Usuario (Red)</label>
                <div className="input-wrap"><input {...register("username")} placeholder="jperez" /></div>
                {errors.username && <div className="err"><FiX /> {errors.username.message}</div>}
              </InputGroup>
              <InputGroup $error={!!errors.password}>
                <label>Contraseña {editingItem && '(Opcional)'}</label>
                <div className="input-wrap">
                  <input {...register("password")} type={showPass ? "text" : "password"} placeholder="••••••••" />
                  <button type="button" className="suffix" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <div className="err"><FiX /> {errors.password.message}</div>}
              </InputGroup>
              <InputGroup $error={!!errors.confirmPassword}>
                <label>Confirmar Password</label>
                <div className="input-wrap"><input {...register("confirmPassword")} type="password" placeholder="••••••••" /></div>
                {errors.confirmPassword && <div className="err"><FiX /> {errors.confirmPassword.message}</div>}
              </InputGroup>
            </div>
          </Section>

          <Section>
            <div className="title"><FiShield /> Configuración POS & Acceso</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <InputGroup $error={!!errors.usu_pin_pos}>
                <label>PIN de Punto de Venta</label>
                <div className="input-wrap"><input {...register("usu_pin_pos")} placeholder="Ej: 1234" maxLength={8} /></div>
                {errors.usu_pin_pos && <div className="err"><FiX /> {errors.usu_pin_pos.message}</div>}
              </InputGroup>
              <InputGroup $error={!!errors.usu_tarjeta_nfc}>
                <label>Código Tarjeta NFC</label>
                <div className="input-wrap"><input {...register("usu_tarjeta_nfc")} placeholder="NFC-XXXXX" /></div>
                {errors.usu_tarjeta_nfc && <div className="err"><FiX /> {errors.usu_tarjeta_nfc.message}</div>}
              </InputGroup>
              <InputGroup $error={!!errors.nombre_ticket} style={{ gridColumn: 'span 2' }}>
                <label>Nombre en Ticket (Impresión)</label>
                <div className="input-wrap"><input {...register("nombre_ticket")} placeholder="Ej: Juan P." /></div>
                {errors.nombre_ticket && <div className="err"><FiX /> {errors.nombre_ticket.message}</div>}
              </InputGroup>
              <InputGroup style={{ gridColumn: 'span 2' }}>
                <label>Sucursales de Acceso Permitido</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {sucursales.map(s => (
                    <label key={s.id_sucursal} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, textTransform: 'none', color: '#e2e8f0' }}>
                      <input 
                        type="checkbox" 
                        value={s.id_sucursal} 
                        {...register("sucursales_acceso")}
                        style={{ width: 16, height: 16, accentColor: '#7c3aed' }}
                      />
                      {s.nombre_sucursal}
                    </label>
                  ))}
                </div>
              </InputGroup>
            </div>
          </Section>
        </div>

        <div>
          <PreviewCard>
            <div className="avatar-big" style={{ background: getAvatarColor(full) }}>{getInitials(full)}</div>
            <h3>{full}</h3>
            <p>{wEmail || "Sin correo asignado"}</p>
            
            {wTicket && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
                <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase' }}>Ticket</div>
                <div style={{ fontWeight: 600, color: '#7c3aed' }}>{wTicket}</div>
              </div>
            )}
            {wPin && (
              <div style={{ marginTop: 8 }}>
                <Badge $bg="rgba(16,185,129,0.15)" $color="#10b981">PIN Configurado</Badge>
              </div>
            )}
          </PreviewCard>

          <Section style={{ marginTop: 24 }}>
            <div className="title">Asignación de Empresa</div>
            <InputGroup $error={!!errors.id_rol}>
              <label>Rol Organizacional</label>
              <div className="input-wrap">
                <select {...register("id_rol")}>
                  <option value="">Seleccionar rol...</option>
                  {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                </select>
              </div>
            </InputGroup>
            <InputGroup $error={!!errors.id_sucursal}>
              <label>Sucursal de Operación</label>
              <div className="input-wrap">
                <select {...register("id_sucursal")}>
                  <option value="">Seleccionar restaurante...</option>
                  {sucursales.map(s => <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre_sucursal}</option>)}
                </select>
              </div>
            </InputGroup>
            <InputGroup $error={!!errors.id_status}>
              <label>Estatus de Cuenta</label>
              <div className="input-wrap">
                <select {...register("id_status")}>
                  {statusList.map(s => <option key={s.id_status} value={s.id_status}>{s.std_descripcion}</option>)}
                </select>
              </div>
            </InputGroup>
          </Section>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <ActionBtn type="submit" $variant="primary" style={{ flex: 1 }} disabled={isSaving}>
              {isSaving ? <BeatLoader size={8} color="white" /> : <><FiCheck /> {editingItem ? 'Guardar Cambios' : 'Registrar Colaborador'}</>}
            </ActionBtn>
          </div>
        </div>
      </FormGrid>
    </form>
  );
};

export default UserForm;
