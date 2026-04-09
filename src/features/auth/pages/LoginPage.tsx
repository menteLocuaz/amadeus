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
    } catch (e) {
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
  background-image: radial-gradient(
    circle,
    ${({ theme }) => theme.bg4}18 1px,
    transparent 1px
  );
  background-size: 28px 28px;
`;

const Card = styled.div`
  display: flex;
  width: 920px;
  max-width: 95vw;
  height: 580px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.18),
    0 32px 64px rgba(0, 0, 0, 0.22);
  background: ${({ theme }) => theme.bg};
`;

const FormSide = styled.div`
  flex: 1.15;
  background: ${({ theme }) => theme.bg};
  border-left: 4px solid ${({ theme }) => theme.bg4};
  padding: 52px 56px 52px 52px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

// ─── Brand mark ─────────────────────────────────────────────────────────────

const BrandMark = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
`;

const BrandIcon = styled.div`
  width: 34px;
  height: 34px;
  background: ${({ theme }) => theme.bg4};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 900;
  color: #000;
  letter-spacing: -0.5px;
  flex-shrink: 0;
`;

const BrandName = styled.span`
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text};
`;

const BrandAccent = styled.span`
  color: ${({ theme }) => theme.bg4};
`;

// ─── Step indicator ──────────────────────────────────────────────────────────

const StepTrack = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
`;

const StepDot = styled.div<{ $active: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ theme, $active }) =>
    $active ? theme.bg4 : `${theme.bg4}30`};
  transition: background 0.35s ease;
  flex-shrink: 0;
`;

const StepConnector = styled.div<{ $filled: boolean }>`
  width: 20px;
  height: 2px;
  border-radius: 1px;
  background: ${({ theme, $filled }) =>
    $filled ? theme.bg4 : `${theme.bg4}30`};
  transition: background 0.35s ease;
`;

const StepLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${({ theme }) => theme.bg4};
  margin-left: 4px;
`;

// ─── Title section ───────────────────────────────────────────────────────────

const TitleSection = styled.div`
  margin-bottom: 28px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
  line-height: 1.2;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textsecondary};
  opacity: 0.75;
  line-height: 1.5;
`;

// ─── Form fields ─────────────────────────────────────────────────────────────

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 18px;
  font-size: 0.85rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  line-height: 1.4;
`;

const FieldGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.bg4};
  margin-bottom: 7px;
`;

const Input = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 13px 16px;
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.texttertiary};
    opacity: 0.45;
  }

  &:focus {
    border-color: ${({ theme }) => theme.bg4};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.bg4}1A;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 13px 16px;
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.bg4};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.bg4}1A;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  margin-top: 4px;
`;

const StyledCheckbox = styled.input`
  accent-color: ${({ theme }) => theme.bg4};
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
`;

const CheckboxLabel = styled.label`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textsecondary};
  cursor: pointer;
  opacity: 0.8;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background: ${({ theme }) => theme.bg4};
  color: #000;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  margin-bottom: 0;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${({ theme }) => theme.bg4}40;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

// ─── Loading overlay ─────────────────────────────────────────────────────────

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.bg}F0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 0;
  gap: 24px;
  backdrop-filter: blur(2px);

  p {
    color: ${({ theme }) => theme.bg4};
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
`;

// ─── Image side ───────────────────────────────────────────────────────────────

const ImageSide = styled.div`
  flex: 1;
  background:
    linear-gradient(
      170deg,
      rgba(20, 33, 61, 0.72) 0%,
      rgba(20, 33, 61, 0.45) 45%,
      rgba(20, 33, 61, 0.82) 100%
    ),
    url(${FontLogin});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 44px 40px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(20, 33, 61, 0.6) 0%,
      transparent 50%
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ImageContent = styled.div`
  position: relative;
  z-index: 1;
`;

const ImageEyebrow = styled.p`
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #FCA311;
  margin-bottom: 10px;
  opacity: 0.9;
`;

const ImageHeadline = styled.h2`
  font-size: 2.4rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  letter-spacing: -1px;
  margin-bottom: 16px;
`;

const ImageRule = styled.div`
  width: 36px;
  height: 3px;
  border-radius: 2px;
  background: #FCA311;
  margin-bottom: 14px;
`;

const ImageCaption = styled.p`
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  max-width: 220px;
`;

export default LoginPage;