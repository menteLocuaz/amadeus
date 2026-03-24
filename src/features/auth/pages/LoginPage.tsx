import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FontLogin from "../../../assets/login.jpg";
import { useAuthStore } from "../store/useAuthStore";
import { AuthService } from "../services/AuthService";
import { ClimbingBoxLoader } from "react-spinners";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  
  // Paso 2: Selección de Sucursal
  const [step, setStep] = useState<"LOGIN" | "SUCURSAL">("LOGIN");
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  const { login, clearSession, isLoading, error, user, setSucursalActiva } = useAuthStore();
  const navigate = useNavigate();

  // Limpiar sesión al entrar al login solo si hay un token (evita bucles infinitos)
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      clearSession();
    }
  }, [clearSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      // El store ya se actualizó en background porque `login` hace `set({ user: usuario })`.
      // Necesitamos leer el estado de JWT guardado por AuthService.
      const userDataStr = localStorage.getItem('token'); // Solo para chequear auth
      if (!userDataStr) return;

      // El store puede demorar un microciclo en sincronizarse si leemos "user" directo.
      // Así que verificaremos obteniendo el perfil de inmediato o con `useAuthStore.getState()`
      const currentUser = useAuthStore.getState().user;
      
      const hasSucursal = currentUser?.id_sucursal || currentUser?.sucursal?.id_sucursal || (currentUser as any)?.sucursal?.id;

      if (hasSucursal) {
        navigate("/select-system");
      } else {
        setStep("SUCURSAL");
        fetchSucursales();
      }
    }
  };

  const fetchSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const resp = await AuthService.getSucursales();
      setSucursales(resp.data || []);
      if ((resp.data || []).length > 0) {
        setSelectedSucursal(resp.data[0].id_sucursal);
      }
    } catch(e) {
      console.error("Error cargando sucursales:", e);
    } finally {
      setLoadingSucursales(false);
    }
  };

  const handleSucursalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSucursal) return alert("Debe seleccionar una sucursal.");
    
    const branch = sucursales.find(s => s.id_sucursal === selectedSucursal);
    const branchName = branch?.nombre_sucursal || branch?.nombre || "Central";
    
    setSucursalActiva(selectedSucursal, branchName);
    navigate("/select-system");
  };

  return (
    <LoginContainer>
      <Card>
        <FormSide>
          {/* Overlay de Carga (Patrón Observer reaccionando al Store) */}
          {isLoading && (
            <LoadingOverlay>
              <ClimbingBoxLoader color="#FCA311" size={15} />
              <p>Validando credenciales...</p>
            </LoadingOverlay>
          )}

          <TitleSection>
            {step === "LOGIN" ? (
              <>
                <Title>¡Bienvenido!</Title>
                <Subtitle>Ingresa tus credenciales para continuar</Subtitle>
              </>
            ) : (
              <>
                <Title>Cuenta Principal</Title>
                <Subtitle>Por favor elige la sucursal de trabajo actual.</Subtitle>
              </>
            )}
          </TitleSection>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {step === "LOGIN" ? (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </FieldGroup>

              <CheckboxRow>
                <StyledCheckbox
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={isLoading}
                />
                <CheckboxLabel htmlFor="remember">Recordar sesión</CheckboxLabel>
              </CheckboxRow>

              <LoginButton type="submit" disabled={isLoading}>
                {isLoading ? "Validando..." : "Iniciar Sesión"}
              </LoginButton>
            </form>
          ) : (
            <form onSubmit={handleSucursalSubmit}>
              <FieldGroup>
                <Label>Selecciona tu Sucursal</Label>
                <Select
                  value={selectedSucursal}
                  onChange={(e) => setSelectedSucursal(e.target.value)}
                  disabled={loadingSucursales}
                >
                  {loadingSucursales ? (
                    <option>Cargando lista...</option>
                  ) : (
                    sucursales.map(s => (
                      <option key={s.id_sucursal} value={s.id_sucursal}>
                        {s.nombre_sucursal}
                      </option>
                    ))
                  )}
                </Select>
              </FieldGroup>

              <LoginButton type="submit" disabled={loadingSucursales || !selectedSucursal}>
                {loadingSucursales ? "Cargando..." : "Entrar al Sistema"}
              </LoginButton>
            </form>
          )}
        </FormSide>

        <ImageSide />
      </Card>
    </LoginContainer>
  );
};

// --- Styled Components ---

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  color: #ff4d4d;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
  border: 1px solid #ff4d4d33;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.bg}EE;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 20px;
  gap: 25px;

  p {
    color: ${({ theme }) => theme.bg4};
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: 1px;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.bgtotal};
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2000;
`;

const Card = styled.div`
  display: flex;
  width: 900px;
  max-width: 95vw;
  height: 550px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}44; // Dorado sutil
`;

const FormSide = styled.div`
  flex: 1.2;
  background: ${({ theme }) => theme.bg};
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ImageSide = styled.div`
  flex: 1;
  background: linear-gradient(rgba(20, 33, 61, 0.4), rgba(20, 33, 61, 0.6)), url(${FontLogin});
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-left: 2px solid ${({ theme }) => theme.bg3}; // Borde dorado
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const TitleSection = styled.div`
  margin-bottom: 35px;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textsecondary};
`;

const FieldGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.bg4}; // Color dorado para etiquetas
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  border-radius: 10px;
  padding: 14px 18px;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder { color: ${({ theme }) => theme.texttertiary}; opacity: 0.5; }

  &:focus {
    border-color: ${({ theme }) => theme.bg4};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.bg4}22;
  }
`;

const Select = styled.select`
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  border-radius: 10px;
  padding: 14px 18px;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.bg4};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.bg4}22;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const StyledCheckbox = styled.input`
  accent-color: ${({ theme }) => theme.bg4};
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.bg4}; // Botón dorado
  color: #000;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 25px;

  &:hover {
    background: ${({ theme }) => theme.bg3};
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(252, 163, 17, 0.3);
  }

  &:active { transform: translateY(0); }
`;

export default LoginPage;
