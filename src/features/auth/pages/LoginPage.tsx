import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FontLogin from "../../../assets/login.jpg";
import { useAuthStore } from "../store/useAuthStore";
import { AuthService } from "../services/AuthService";
import { ClimbingBoxLoader } from "react-spinners";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // Paso 2: Selección de Sucursal
  const [step, setStep] = useState<"LOGIN" | "SUCURSAL">("LOGIN");
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  const { login, clearSession, isLoading, error, setSucursalActiva } = useAuthStore();
  const fetchCatalogs = useCatalogStore(s => s.fetchCatalogs);
  const navigate = useNavigate();

  // Limpiar sesión al entrar al login (solo al montar el componente)
  React.useEffect(() => {
    clearSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      const currentUser = useAuthStore.getState().user;
      const hasSucursal = currentUser?.id_sucursal || currentUser?.sucursal?.id_sucursal || (currentUser as any)?.sucursal?.id;

      fetchCatalogs(true);

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
          {isLoading && (
            <LoadingOverlay>
              <ClimbingBoxLoader color="#FCA311" size={15} />
              <p>Validando credenciales...</p>
            </LoadingOverlay>
          )}

          <BrandMark>
            <BrandIcon>GT</BrandIcon>
            <BrandName>GROOT<BrandAccent>TYPE</BrandAccent></BrandName>
          </BrandMark>

          <TitleSection>
            <StepTrack>
              <StepDot $active={step === "LOGIN"} />
              <StepConnector $filled={step === "SUCURSAL"} />
              <StepDot $active={step === "SUCURSAL"} />
              <StepLabel>{step === "LOGIN" ? "Acceso" : "Sucursal"}</StepLabel>
            </StepTrack>

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
                <Label htmlFor="email">Correo electrónico</Label>
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

        <ImageSide>
          <ImageContent>
            <ImageEyebrow>Panel de administración</ImageEyebrow>
            <ImageHeadline>Gestión<br />Comercial</ImageHeadline>
            <ImageRule />
            <ImageCaption>Acceso seguro a tus sucursales, inventario y punto de venta.</ImageCaption>
          </ImageContent>
        </ImageSide>
      </Card>
    </LoginContainer>
  );
};

// ─── Styled Components ──────────────────────────────────────────────────────

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2000;
  background-color: ${({ theme }) => theme.bgtotal};
`;

const Card = styled.div`
  display: flex;
  width: 900px;
  max-width: 95vw;
  height: 580px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08);
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}11;
`;

const FormSide = styled.div`
  flex: 1.2;
  background: ${({ theme }) => theme.bg};
  padding: 60px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

// ─── Brand mark ─────────────────────────────────────────────────────────────

const BrandMark = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 56px;
`;

const BrandIcon = styled.div`
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.primary};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 900;
  color: #000;
  letter-spacing: -0.5px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.primary}44;
`;

const BrandName = styled.span`
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text};
  font-family: 'Space Grotesk', sans-serif;
`;

const BrandAccent = styled.span`
  color: ${({ theme }) => theme.primary};
`;

// ─── Step indicator ──────────────────────────────────────────────────────────

const StepTrack = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
`;

const StepDot = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme, $active }) =>
    $active ? theme.primary : `${theme.primary}22`};
  transition: all 0.3s ease;
  box-shadow: ${({ $active, theme }) => $active ? `0 0 10px ${theme.primary}66` : 'none'};
`;

const StepConnector = styled.div<{ $filled: boolean }>`
  width: 24px;
  height: 2px;
  border-radius: 2px;
  background: ${({ theme, $filled }) =>
    $filled ? theme.primary : `${theme.primary}22`};
`;

const StepLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${({ theme }) => theme.texttertiary};
  margin-left: 6px;
`;

// ─── Title section ───────────────────────────────────────────────────────────

const TitleSection = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  margin-bottom: 12px;
  letter-spacing: -0.03em;
  font-family: 'Space Grotesk', sans-serif;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.texttertiary};
  line-height: 1.6;
  font-weight: 500;
`;

// ─── Form fields ─────────────────────────────────────────────────────────────

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  padding: 14px 20px;
  border-radius: 12px;
  margin-bottom: 32px;
  font-size: 0.85rem;
  border: 1px solid rgba(239, 68, 68, 0.15);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FieldGroup = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.texttertiary};
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.bg2}22;
  border: 1px solid ${({ theme }) => theme.bg3}15;
  border-radius: 12px;
  padding: 14px 20px;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.bg};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}15;
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const Select = styled.select`
  width: 100%;
  background: ${({ theme }) => theme.bg2}22;
  border: 1px solid ${({ theme }) => theme.bg3}15;
  border-radius: 12px;
  padding: 14px 20px;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.primary}15;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
`;

const StyledCheckbox = styled.input`
  accent-color: ${({ theme }) => theme.primary};
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.texttertiary};
  cursor: pointer;
  font-weight: 500;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.primary};
  color: #000;
  font-weight: 800;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 24px ${({ theme }) => theme.primary}33;

  &:hover:not(:disabled) {
    filter: brightness(1.05);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px ${({ theme }) => theme.primary}44;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ─── Loading overlay ─────────────────────────────────────────────────────────

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.bg}CC;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  gap: 32px;
  backdrop-filter: blur(12px);

  p {
    color: ${({ theme }) => theme.primary};
    font-weight: 800;
    font-size: 0.8rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;

// ─── Image side ───────────────────────────────────────────────────────────────

const ImageSide = styled.div`
  flex: 0.8;
  background: ${({ theme }) => theme.bg2}15;
  display: flex;
  align-items: flex-end;
  padding: 60px;
  position: relative;
  border-left: 1px solid ${({ theme }) => theme.bg3}11;

  @media (max-width: 768px) {
    display: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, ${({ theme }) => theme.bg}, transparent);
    opacity: 0.4;
  }
`;

const ImageContent = styled.div`
  position: relative;
  z-index: 1;
`;

const ImageEyebrow = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 16px;
`;

const ImageHeadline = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin-bottom: 24px;
  font-family: 'Space Grotesk', sans-serif;
`;

const ImageRule = styled.div`
  width: 40px;
  height: 3px;
  background: ${({ theme }) => theme.primary};
  margin-bottom: 24px;
  border-radius: 2px;
`;

const ImageCaption = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.texttertiary};
  line-height: 1.7;
  max-width: 280px;
  font-weight: 500;
`;

export default LoginPage;
