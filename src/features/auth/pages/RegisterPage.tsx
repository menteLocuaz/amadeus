import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { AuthService, type CreateUserDTO, type RolItem, type SucursalItem } from "../services/AuthService";
import { EstatusService } from "../services/EstatusService";
import { ClimbingBoxLoader } from "react-spinners";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateUserDTO>({
    usu_nombre: "",
    email: "",
    usu_dni: "",
    usu_telefono: "",
    password: "",
    id_rol: "",
    id_sucursal: "",
    id_status: "",
  });

  const [roles, setRoles] = useState<RolItem[]>([]);
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [estatusList, setEstatusList] = useState<{ id_status: string; std_descripcion: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carga inicial de roles, sucursales y estatus (Requiere Auth Token)
    const loadData = async () => {
      try {
        const [rolesRes, sucursalesRes, estatusRes] = await Promise.all([
          AuthService.getRoles(),
          AuthService.getSucursales(),
          EstatusService.getCatalogo()
        ]);
        
        setRoles(rolesRes.data || []);
        setSucursales(sucursalesRes.data || []);

        // El catálogo maestro agrupa por módulo ID (Módulo 3 = Usuario/Roles)
        if (estatusRes.success && estatusRes.data["3"]) {
          setEstatusList(estatusRes.data["3"].items || []);
        }
      } catch (err) {
        console.error("Error al cargar dependencias. ¿Está el token presente?", err);
        setError("No se pudieron cargar los datos necesarios. Asegúrate de estar autenticado.");
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await AuthService.createUser(formData);
      alert("¡Usuario creado exitosamente!");
      // Limpiar formulario en lugar de navegar
      setFormData({
        usu_nombre: "",
        email: "",
        usu_dni: "",
        usu_telefono: "",
        password: "",
        id_rol: "",
        id_sucursal: "",
        id_status: "",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al registrar usuario";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <RegisterContainer>
      <Card>
        <FormSide>
          {isLoading && (
            <LoadingOverlay>
              <ClimbingBoxLoader color="#FCA311" size={15} />
              <p>Procesando registro...</p>
            </LoadingOverlay>
          )}

          <TopRow>
            <BackButton type="button" onClick={() => navigate(-1)} aria-label="Volver">
              ← Volver
            </BackButton>

            <TitleSection>
              <Title>Registrar Usuario</Title>
              <Subtitle>Configure las credenciales y accesos del nuevo miembro</Subtitle>
            </TitleSection>
          </TopRow>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Label htmlFor="usu_nombre">Nombre Completo</Label>
              <Input
                id="usu_nombre"
                placeholder="Nombre y Apellido"
                value={formData.usu_nombre}
                onChange={handleChange}
                required
              />
            </FieldGroup>

            <SelectRow>
              <FieldGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@empresa.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </FieldGroup>
            </SelectRow>

            <SelectRow>
              <FieldGroup>
                <Label htmlFor="usu_dni">DNI / Identificación</Label>
                <Input
                  id="usu_dni"
                  placeholder="Número de documento"
                  value={formData.usu_dni}
                  onChange={handleChange}
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="usu_telefono">Teléfono</Label>
                <Input
                  id="usu_telefono"
                  placeholder="Ej: +54 9 11..."
                  value={formData.usu_telefono}
                  onChange={handleChange}
                  required
                />
              </FieldGroup>
            </SelectRow>

            <SelectRow>
              <FieldGroup>
                <Label htmlFor="id_rol">Rol del Sistema</Label>
                <Select id="id_rol" value={formData.id_rol} onChange={handleChange} required>
                  <option value="">Seleccione Rol</option>
                  {roles.map(r => (
                    <option key={r.id_rol} value={r.id_rol}>
                      {r.nombre_rol}
                    </option>
                  ))}
                </Select>
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="id_sucursal">Sucursal Asignada</Label>
                <Select id="id_sucursal" value={formData.id_sucursal} onChange={handleChange} required>
                  <option value="">Seleccione Sucursal</option>
                  {sucursales.map(s => (
                    <option key={s.id_sucursal} value={s.id_sucursal}>
                      {s.nombre_sucursal}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </SelectRow>

            <FieldGroup>
              <Label htmlFor="id_status">Estado Inicial</Label>
              <Select id="id_status" value={formData.id_status} onChange={handleChange} required>
                <option value="">Seleccione Estado</option>
                {estatusList.map(est => (
                  <option key={est.id_status} value={est.id_status}>
                    {est.std_descripcion}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <ActionButton type="submit" disabled={isLoading || roles.length === 0}>
              Finalizar Registro
            </ActionButton>
          </form>
        </FormSide>
      </Card>
    </RegisterContainer>
  );
};

// --- Estilos ---

const RegisterContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.bgtotal};
  padding: 20px;
`;

/* Card ya no tendrá "formato de tarjeta": se usa como wrapper sin fondo, sin sombra ni bordes.
   Mantiene position: relative para overlay de carga */
const Card = styled.div`
  width: 100%;
  max-width: 900px;
  background: transparent;
  border-radius: 0;
  padding: 0;
  position: relative;
  overflow: visible;
`;

/* Contenido (form) ocupa todo el ancho del wrapper y no está en una tarjeta */
const FormSide = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 12px;
`;

/* Top row con botón de retroceso y título */
const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.bg4};
  font-weight: 700;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background 0.12s, transform 0.08s;
  &:hover { background: ${({ theme }) => theme.bg2}; transform: translateY(-1px); }
`;

/* Loading overlay covers the content area when active */
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0;
  background: ${({ theme }) => theme.bg}BB;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 20px;
  padding: 24px;
  p { color: ${({ theme }) => theme.bg4}; font-weight: 700; margin: 0; }
`;

const TitleSection = styled.div`
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 3px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textsecondary};
  font-size: 0.9rem;
  margin: 0;
`;

const FieldGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.bg4};
  margin-bottom: 5px;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 12px 16px;
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  &:focus { border-color: ${({ theme }) => theme.bg4}; }
`;

const Select = styled.select`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 12px 16px;
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  font-size: 0.95rem;
  &:focus { border-color: ${({ theme }) => theme.bg4}; }
`;

const SelectRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  @media (max-width: 600px) { flex-direction: column; gap: 0; }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.bg4};
  color: #000;
  font-weight: 800;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(252, 163, 17, 0.18); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 77, 77, 0.06);
  color: #ff4d4d;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  border: 1px solid #ff4d4d22;
  font-size: 0.9rem;
`;

export default RegisterPage;