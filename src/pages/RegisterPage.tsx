import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { AuthService, type CreateUserDTO, type RolItem, type SucursalItem } from "../services/AuthService";
import { ClimbingBoxLoader } from "react-spinners";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateUserDTO>({
    nombre: "",
    email: "",
    password: "",
    id_rol: "",
    id_sucursal: "",
  });

  const [roles, setRoles] = useState<RolItem[]>([]);
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carga inicial de roles y sucursales (Requiere Auth Token)
    const loadData = async () => {
      try {
        const [rolesRes, sucursalesRes] = await Promise.all([
          AuthService.getRoles(),
          AuthService.getSucursales()
        ]);
        
        // La API devuelve { success: true, data: [...] }
        setRoles(rolesRes.data || []);
        setSucursales(sucursalesRes.data || []);
      } catch (err) {
        console.error("Error al cargar dependencias. ¿Está el token presente?", err);
        setError("No se pudieron cargar los roles o sucursales. Asegúrate de estar autenticado.");
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
      navigate("/"); 
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

          <TitleSection>
            <Title>Registrar Usuario</Title>
            <Subtitle>Configure las credenciales y accesos del nuevo miembro</Subtitle>
          </TitleSection>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                placeholder="Nombre y Apellido"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </FieldGroup>

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

            <SelectRow>
              <FieldGroup>
                <Label htmlFor="id_rol">Rol del Sistema</Label>
                <Select id="id_rol" value={formData.id_rol} onChange={handleChange} required>
                  <option value="">Seleccione Rol</option>
                  {roles.map(r => (
                    <option key={r.id_rol} value={r.id_rol}>
                      {r.rol_nombre}
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
                      {s.nombre}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </SelectRow>

            <ActionButton type="submit" disabled={isLoading || roles.length === 0}>
              Finalizar Registro
            </ActionButton>
          </form>

          <FooterLink>
            <a href="#" onClick={() => navigate("/")}>← Volver al Panel de Control</a>
          </FooterLink>
        </FormSide>
      </Card>
    </RegisterContainer>
  );
};

// --- Estilos ---

const RegisterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.bgtotal};
  padding: 40px;
`;

const Card = styled.div`
  width: 650px;
  background: ${({ theme }) => theme.bg};
  border-radius: 20px;
  padding: 50px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid ${({ theme }) => theme.bg3}44;
  position: relative;
  overflow: hidden;
`;

const FormSide = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: ${({ theme }) => theme.bg}EE;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 20px;
  p { color: ${({ theme }) => theme.bg4}; font-weight: 700; }
`;

const TitleSection = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.textsecondary};
  font-size: 0.95rem;
`;

const FieldGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.bg4};
  margin-bottom: 8px;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 14px 18px;
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  outline: none;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus { border-color: ${({ theme }) => theme.bg4}; }
`;

const Select = styled.select`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 14px 18px;
  color: ${({ theme }) => theme.text};
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  font-size: 1rem;
  &:focus { border-color: ${({ theme }) => theme.bg4}; }
`;

const SelectRow = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 600px) { flex-direction: column; }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 18px;
  background: ${({ theme }) => theme.bg4};
  color: #000;
  font-weight: 800;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  margin-top: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(252, 163, 17, 0.3); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 25px;
  text-align: center;
  border: 1px solid #ff4d4d33;
  font-size: 0.9rem;
`;

const FooterLink = styled.p`
  text-align: center;
  margin-top: 30px;
  font-size: 0.9rem;
  a { color: ${({ theme }) => theme.bg4}; text-decoration: none; font-weight: 700; &:hover { text-decoration: underline; } }
`;

export default RegisterPage;
