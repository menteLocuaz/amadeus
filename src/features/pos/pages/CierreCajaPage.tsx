import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLock, FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import { usePOSStore } from "../store/usePOSStore";
import { CajaSesionService, type CierreResult } from "../services/CajaSesionService";
import { ROUTES } from "../../../core/constants/routes";

const CierreCajaPage: React.FC = () => {
  const navigate = useNavigate();
  const { activePeriodo, clearEstacion } = usePOSStore();

  const [montoCierre, setMontoCierre] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CierreResult | null>(null);

  const handleCierre = async () => {
    const monto = parseFloat(montoCierre);
    if (isNaN(monto) || monto < 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    if (!activePeriodo?.id_caja) {
      setError("No hay sesión de caja activa.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await CajaSesionService.cerrar(activePeriodo.id_caja, { monto_cierre: monto });
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al procesar el cierre. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    clearEstacion();
    navigate(ROUTES.POS_APERTURA, { replace: true });
  };

  const resultIcon = result
    ? result.resultado === "CUADRADO"
      ? <FiMinus />
      : result.resultado === "SOBRANTE"
      ? <FiTrendingUp />
      : <FiTrendingDown />
    : null;

  const resultColor =
    result?.resultado === "CUADRADO"
      ? "#10B981"
      : result?.resultado === "SOBRANTE"
      ? "#3B82F6"
      : "#EF4444";

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <PageWrapper>
        <CenteredCard>
          <ResultIcon $color={resultColor}>{resultIcon}</ResultIcon>
          <ResultTitle $color={resultColor}>{result.resultado}</ResultTitle>
          <ResultMsg>{result.mensaje}</ResultMsg>

          <BreakdownGrid>
            <BreakdownItem>
              <BreakdownLabel>Ventas del sistema</BreakdownLabel>
              <BreakdownValue>$ {result.ventas_sistema.toFixed(2)}</BreakdownValue>
            </BreakdownItem>
            <BreakdownItem>
              <BreakdownLabel>Efectivo declarado</BreakdownLabel>
              <BreakdownValue>$ {result.efectivo_fisico.toFixed(2)}</BreakdownValue>
            </BreakdownItem>
            <BreakdownItem $span>
              <BreakdownLabel>Diferencia</BreakdownLabel>
              <BreakdownValue $color={resultColor}>
                {result.diferencia >= 0 ? "+" : ""}$ {result.diferencia.toFixed(2)}
              </BreakdownValue>
            </BreakdownItem>
          </BreakdownGrid>

          <SecurityNotice>
            <FiLock size={13} />
            Tu sesión de cajero ha sido cerrada. Un administrador debe habilitarte para un nuevo turno.
          </SecurityNotice>

          <FinishBtn onClick={handleFinish}>Volver al Inicio</FinishBtn>
        </CenteredCard>
      </PageWrapper>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <CenteredCard>
        <BackLink onClick={() => navigate(-1)}>
          <FiArrowLeft /> Volver al POS
        </BackLink>

        <FormHeader>
          <LockIcon><FiLock /></LockIcon>
          <FormTitle>Cierre de Turno</FormTitle>
          <FormSubtitle>
            Ingresa el efectivo físico que tienes en caja. El sistema calculará el arqueo automáticamente.
          </FormSubtitle>
        </FormHeader>

        {activePeriodo && (
          <SessionInfo>
            <InfoRow>
              <span>Período</span>
              <strong>{activePeriodo.id_periodo.slice(0, 8).toUpperCase()}</strong>
            </InfoRow>
            <InfoRow>
              <span>Fondo inicial</span>
              <strong>$ {activePeriodo.monto_apertura?.toFixed(2) ?? "—"}</strong>
            </InfoRow>
            <InfoRow>
              <span>Estado</span>
              <StatusBadge>{activePeriodo.estatus}</StatusBadge>
            </InfoRow>
          </SessionInfo>
        )}

        <FieldGroup>
          <FieldLabel>Efectivo físico contado</FieldLabel>
          <AmountInput
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            value={montoCierre}
            onChange={(e) => setMontoCierre(e.target.value)}
          />
          <FieldHint>
            Cuenta el dinero en billetes y monedas y escribe el total exacto.
          </FieldHint>
        </FieldGroup>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <CierreBtn
          onClick={handleCierre}
          disabled={isLoading || !montoCierre}
        >
          {isLoading ? "Procesando arqueo…" : "Cerrar Turno y Hacer Arqueo"}
        </CierreBtn>

        <DisclaimerText>
          Esta acción es irreversible. Tu usuario quedará bloqueado para nuevas ventas hasta que un administrador te asigne a un nuevo turno.
        </DisclaimerText>
      </CenteredCard>
    </PageWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 40px);
  padding: 40px 24px;
`;

const CenteredCard = styled.div`
  background: ${({ theme }) => theme.bgCard};
  border: 1px solid rgba(150,150,150,0.12);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.texttertiary};
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  opacity: 0.75;
  transition: opacity 0.15s;
  align-self: flex-start;
  &:hover { opacity: 1; }
`;

const FormHeader = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const LockIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(239,68,68,0.08);
  color: #EF4444;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const FormTitle = styled.h1`
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.textprimary};
  letter-spacing: -0.02em;
`;

const FormSubtitle = styled.p`
  font-size: 0.83rem;
  color: ${({ theme }) => theme.texttertiary};
  margin: 0;
  line-height: 1.5;
  max-width: 340px;
`;

const SessionInfo = styled.div`
  background: rgba(150,150,150,0.04);
  border: 1px solid rgba(150,150,150,0.1);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.83rem;
  span { color: ${({ theme }) => theme.texttertiary}; font-weight: 500; }
  strong { color: ${({ theme }) => theme.textprimary}; font-weight: 700; font-variant-numeric: tabular-nums; }
`;

const StatusBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(16,185,129,0.1);
  color: #10B981;
  border-radius: 20px;
  padding: 2px 10px;
  letter-spacing: 0.04em;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 0.83rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textprimary};
`;

const AmountInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid rgba(150,150,150,0.15);
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.textprimary};
  font-size: 1.4rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: right;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s;
  &:focus { border-color: ${({ theme }) => theme.primary}; }
  &::placeholder { opacity: 0.3; }
`;

const FieldHint = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.texttertiary};
  margin: 0;
  opacity: 0.7;
`;

const ErrorBanner = styled.div`
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  color: ${({ theme }) => theme.danger};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.83rem;
  font-weight: 500;
`;

const CierreBtn = styled.button`
  width: 100%;
  padding: 15px;
  border-radius: 10px;
  border: none;
  background: ${({ disabled }) => disabled ? "rgba(150,150,150,0.12)" : "#EF4444"};
  color: ${({ disabled }) => disabled ? "rgba(150,150,150,0.4)" : "#fff"};
  font-size: 0.95rem;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-family: inherit;
  transition: all 0.15s;
  letter-spacing: 0.01em;
  &:hover:not(:disabled) { background: #DC2626; }
`;

const DisclaimerText = styled.p`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.texttertiary};
  text-align: center;
  margin: 0;
  opacity: 0.6;
  line-height: 1.5;
`;

/* ── Result ── */
const ResultIcon = styled.div<{ $color: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ $color }) => `${$color}18`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  align-self: center;
`;

const ResultTitle = styled.h1<{ $color: string }>`
  font-size: 1.8rem;
  font-weight: 900;
  color: ${({ $color }) => $color};
  margin: 0;
  text-align: center;
  letter-spacing: 0.02em;
`;

const ResultMsg = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.texttertiary};
  text-align: center;
  margin: 0;
`;

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const BreakdownItem = styled.div<{ $span?: boolean }>`
  grid-column: ${({ $span }) => ($span ? "1 / -1" : "auto")};
  background: rgba(150,150,150,0.04);
  border: 1px solid rgba(150,150,150,0.1);
  border-radius: 10px;
  padding: 14px 16px;
`;

const BreakdownLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ theme }) => theme.texttertiary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px;
`;

const BreakdownValue = styled.p<{ $color?: string }>`
  font-size: 1.2rem;
  font-weight: 800;
  color: ${({ $color, theme }) => $color ?? theme.textprimary};
  margin: 0;
  font-variant-numeric: tabular-nums;
`;

const SecurityNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(239,68,68,0.06);
  border: 1px solid rgba(239,68,68,0.15);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.danger};
  font-weight: 500;
  line-height: 1.5;
`;

const FinishBtn = styled.button`
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(150,150,150,0.15);
  background: transparent;
  color: ${({ theme }) => theme.textprimary};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover { background: rgba(150,150,150,0.08); }
`;

export default CierreCajaPage;
