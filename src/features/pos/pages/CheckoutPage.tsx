import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiDelete } from "react-icons/fi";
import { MdPayment } from "react-icons/md";
import { ClimbingBoxLoader } from "react-spinners";
import { usePOSStore } from "../store/usePOSStore";
import { useFormasPago } from "../../formasPago/hooks/useFormasPago";
import { FacturaService } from "../../facturacion/services/FacturaService";
import { ClienteService } from "../../cliente/services/ClienteService";
import { ROUTES } from "../../../core/constants/routes";
import type { CartItem } from "../hooks/useCart";
import type { FacturaCompletaRequest } from "../../facturacion/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  note: string;
}

interface PaymentEntry {
  id_forma_pago: string;
  descripcion: string;
  codigo: string;
  amount: number;
}

type Tab = "cash" | "otros";

// ─── Component ────────────────────────────────────────────────────────────────

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { id_estacion, id_control_estacion, activePeriodo } = usePOSStore();
  const { formasPago } = useFormasPago();

  const state = location.state as LocationState | null;

  // Redirect if no cart data
  useEffect(() => {
    if (!state?.items?.length) {
      navigate(ROUTES.POS, { replace: true });
    }
  }, [state, navigate]);

  const { items = [], subtotal = 0, tax = 0, total = 0, note = "" } = state ?? {};

  // ── Payment state ──────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("cash");
  const [cashInput, setCashInput] = useState<string>(total.toFixed(2));
  const [otherPayments, setOtherPayments] = useState<PaymentEntry[]>([]);
  const [clienteId, setClienteId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ fac_numero: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load consumidor final client
  useEffect(() => {
    ClienteService.getAll().then((res) => {
      const clientes = res.data || (Array.isArray(res) ? res : []);
      const cf = clientes.find(
        (c: any) =>
          (c.nombre?.toUpperCase() || "").includes("CONSUMIDOR") ||
          (c.empresa_cliente?.toUpperCase() || "").includes("CONSUMIDOR") ||
          (c.ruc === "9999999999")
      );
      if (cf) setClienteId(cf.id_cliente ?? "");
      else if (clientes.length > 0) setClienteId(clientes[0].id_cliente ?? "");
    }).catch(() => {});
  }, []);

  // ── Cash numpad ────────────────────────────────────────────────────────────
  const handleNumpad = useCallback((key: string) => {
    setCashInput((prev) => {
      if (key === "⌫") return prev.length > 1 ? prev.slice(0, -1) : "0";
      if (key === "." && prev.includes(".")) return prev;
      if (key === "00") {
        if (prev === "0") return "0";
        const parts = prev.split(".");
        if (parts[1] !== undefined && parts[1].length >= 2) return prev;
        return prev + "00";
      }
      if (prev === "0" && key !== ".") return key;
      const parts = prev.split(".");
      if (parts[1] !== undefined && parts[1].length >= 2) return prev;
      return prev + key;
    });
  }, []);

  const cashAmount = parseFloat(cashInput) || 0;
  const totalPaid = useMemo(() => {
    if (tab === "cash") return cashAmount;
    return otherPayments.reduce((s, p) => s + p.amount, 0);
  }, [tab, cashAmount, otherPayments]);

  const change = totalPaid - total;
  const isPaid = totalPaid >= total;

  // ── Other payments ─────────────────────────────────────────────────────────
  const addOtherPayment = (forma: { id_forma_pago: string; fmp_descripcion: string; fmp_codigo: string }) => {
    setOtherPayments((prev) => {
      const exists = prev.find((p) => p.id_forma_pago === forma.id_forma_pago);
      if (exists) return prev;
      const remaining = Math.max(0, total - prev.reduce((s, p) => s + p.amount, 0));
      return [...prev, { id_forma_pago: forma.id_forma_pago, descripcion: forma.fmp_descripcion, codigo: forma.fmp_codigo, amount: remaining }];
    });
  };

  const updateOtherPayment = (id: string, amount: number) => {
    setOtherPayments((prev) => prev.map((p) => p.id_forma_pago === id ? { ...p, amount } : p));
  };

  const removeOtherPayment = (id: string) => {
    setOtherPayments((prev) => prev.filter((p) => p.id_forma_pago !== id));
  };

  // ── Cash forma de pago id ──────────────────────────────────────────────────
  const cashForma = formasPago.find(
    (f) => f.fmp_codigo === "EF" || f.fmp_descripcion?.toUpperCase().includes("EFECTIVO")
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!isPaid) return;
    if (!id_estacion || !activePeriodo) {
      setError("Sesión de caja no activa. Regresa a apertura.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const pagos =
        tab === "cash"
          ? [{ id_forma_pago: cashForma?.id_forma_pago ?? "", valor_billete: cashAmount, total_pagar: total }]
          : otherPayments.map((p) => ({ id_forma_pago: p.id_forma_pago, valor_billete: p.amount, total_pagar: p.amount }));

      const payload: FacturaCompletaRequest = {
        cabecera: {
          fac_numero: `POS-${Date.now()}`,
          subtotal,
          iva: tax,
          total,
          observacion: note || undefined,
          id_estacion,
          id_control_estacion: id_control_estacion ?? undefined,
          id_cliente: clienteId,
          id_periodo: activePeriodo.id_periodo,
          base_impuesto: subtotal,
          impuesto: 0.19,
          valor_impuesto: tax,
        },
        detalles: items.map((it) => {
          const precio = Number(it.product.precio_venta ?? 0);
          const st = precio * it.qty;
          return {
            id_producto: it.product.id_producto || it.product.id || "",
            cantidad: it.qty,
            precio,
            subtotal: st,
            impuesto: 0.19,
            total: st * 1.19,
            nombre_producto: it.product.nombre,
          };
        }),
        pagos,
      };

      const result = await FacturaService.crearFacturaCompleta(payload);
      setSuccessData({ fac_numero: result.fac_numero ?? payload.cabecera.fac_numero });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (successData) {
    return (
      <SuccessScreen>
        <SuccessCircle>
          <FiCheck size={48} />
        </SuccessCircle>
        <SuccessTitle>Pago Confirmado</SuccessTitle>
        <SuccessSubtitle>Factura {successData.fac_numero}</SuccessSubtitle>
        <SuccessTotal>$ {total.toFixed(2)}</SuccessTotal>
        {change > 0 && tab === "cash" && (
          <ChangeRow>
            <span>Cambio para el cliente</span>
            <strong>$ {change.toFixed(2)}</strong>
          </ChangeRow>
        )}
        <SuccessActions>
          <BackBtn onClick={() => navigate(ROUTES.POS, { replace: true })}>
            Nueva Venta
          </BackBtn>
        </SuccessActions>
      </SuccessScreen>
    );
  }

  if (!state?.items?.length) return null;

  const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "⌫"];

  return (
    <PageWrapper>
      {/* ── LEFT: Order Summary ── */}
      <LeftPanel>
        <PanelHeader>
          <BackLink onClick={() => navigate(-1)}>
            <FiArrowLeft /> Modificar Pedido
          </BackLink>
          <OrderMeta>
            <OrderId>Orden #{activePeriodo?.id_periodo?.slice(0, 8)?.toUpperCase() ?? "—"}</OrderId>
            <OrderSub>Caja · {usePOSStore.getState().estacionNombre ?? "—"}</OrderSub>
          </OrderMeta>
        </PanelHeader>

        <ItemsList>
          {items.map((it) => {
            const precio = Number(it.product.precio_venta ?? 0);
            return (
              <ItemRow key={it.product.id_producto || it.product.id}>
                <ItemQty>{it.qty}x</ItemQty>
                <ItemName>{it.product.nombre}</ItemName>
                <ItemPrice>$ {(precio * it.qty).toFixed(2)}</ItemPrice>
              </ItemRow>
            );
          })}
        </ItemsList>

        <TotalsBlock>
          <TotalLine>
            <span>Subtotal</span>
            <span>$ {subtotal.toFixed(2)}</span>
          </TotalLine>
          <TotalLine>
            <span>IVA (19%)</span>
            <span>$ {tax.toFixed(2)}</span>
          </TotalLine>
          <TotalDivider />
          <GrandTotal>
            <span>Total</span>
            <span>$ {total.toFixed(2)}</span>
          </GrandTotal>
          <TotalDivider />
          <TotalLine $muted>
            <span>Recibido</span>
            <span>$ {totalPaid.toFixed(2)}</span>
          </TotalLine>
          <BalanceLine $positive={change >= 0}>
            <span>{change >= 0 ? "Cambio" : "Pendiente"}</span>
            <strong>$ {Math.abs(change).toFixed(2)}</strong>
          </BalanceLine>
        </TotalsBlock>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <ConfirmBtn
          onClick={handleConfirm}
          disabled={!isPaid || isSubmitting || !clienteId}
        >
          {isSubmitting ? (
            <ClimbingBoxLoader color="#fff" size={8} />
          ) : (
            <>
              <FiCheck /> Confirmar Pago
            </>
          )}
        </ConfirmBtn>
      </LeftPanel>

      {/* ── RIGHT: Payment Panel ── */}
      <RightPanel>
        <PayableLabel>Monto a Cobrar</PayableLabel>
        <PayableAmount>$ {total.toFixed(2)}</PayableAmount>

        {/* Tabs */}
        <TabRow>
          <TabBtn $active={tab === "cash"} onClick={() => setTab("cash")}>Efectivo</TabBtn>
          <TabBtn $active={tab === "otros"} onClick={() => setTab("otros")}>
            <MdPayment style={{ marginRight: 4 }} /> Otros Métodos
          </TabBtn>
          <TabSlider $offset={tab === "cash" ? 0 : 50} />
        </TabRow>

        {tab === "cash" ? (
          <CashPanel>
            <AmountDisplay>
              <span>$</span>
              <AmountValue>{cashInput}</AmountValue>
            </AmountDisplay>

            <Numpad>
              {NUMPAD_KEYS.map((k) => (
                <NumKey
                  key={k}
                  $isDelete={k === "⌫"}
                  onClick={() => handleNumpad(k)}
                >
                  {k === "⌫" ? <FiDelete /> : k}
                </NumKey>
              ))}
            </Numpad>

            <QuickAmounts>
              {[total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50].filter((v, i, a) => a.indexOf(v) === i).map((v) => (
                <QuickBtn key={v} onClick={() => setCashInput(v.toFixed(2))}>
                  $ {v.toFixed(0)}
                </QuickBtn>
              ))}
            </QuickAmounts>
          </CashPanel>
        ) : (
          <OtherPanel>
            <MethodGrid>
              {formasPago
                .filter((f) => f.fmp_codigo !== "EF")
                .map((f) => {
                  const active = otherPayments.some((p) => p.id_forma_pago === f.id_forma_pago);
                  return (
                    <MethodChip
                      key={f.id_forma_pago}
                      $active={active}
                      onClick={() => active ? removeOtherPayment(f.id_forma_pago) : addOtherPayment(f)}
                    >
                      <ChipCode>{f.fmp_codigo}</ChipCode>
                      {f.fmp_descripcion}
                    </MethodChip>
                  );
                })}
            </MethodGrid>

            {otherPayments.length > 0 && (
              <PaymentRows>
                {otherPayments.map((p) => (
                  <PaymentRow key={p.id_forma_pago}>
                    <PaymentRowLabel>
                      <ChipCode $sm>{p.codigo}</ChipCode>
                      {p.descripcion}
                    </PaymentRowLabel>
                    <PaymentRowInput
                      type="number"
                      min={0}
                      step={0.01}
                      value={p.amount}
                      onChange={(e) => updateOtherPayment(p.id_forma_pago, parseFloat(e.target.value) || 0)}
                    />
                  </PaymentRow>
                ))}
                <OtherTotalRow>
                  <span>Total cubierto</span>
                  <strong style={{ color: totalPaid >= total ? theme.success : theme.danger }}>
                    $ {totalPaid.toFixed(2)}
                  </strong>
                </OtherTotalRow>
              </PaymentRows>
            )}

            {otherPayments.length === 0 && (
              <EmptyMethods>Selecciona un método de pago</EmptyMethods>
            )}
          </OtherPanel>
        )}

        {/* Change indicator */}
        <ChangePill $positive={change >= 0} $show={totalPaid > 0}>
          {change >= 0
            ? `Cambio: $ ${change.toFixed(2)}`
            : `Faltan: $ ${Math.abs(change).toFixed(2)}`}
        </ChangePill>
      </RightPanel>
    </PageWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  height: calc(100vh - 40px);
  gap: 0;
  overflow: hidden;
`;

/* ── Left ── */
const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px 36px;
  overflow-y: auto;
  border-right: 1px solid rgba(150, 150, 150, 0.1);
  gap: 0;
`;

const PanelHeader = styled.div`
  margin-bottom: 28px;
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
  margin-bottom: 16px;
  opacity: 0.75;
  transition: opacity 0.15s;
  &:hover { opacity: 1; }
`;

const OrderMeta = styled.div``;
const OrderId = styled.h2`
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0 0 4px;
  color: ${({ theme }) => theme.textprimary};
  letter-spacing: -0.02em;
`;
const OrderSub = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.texttertiary};
  margin: 0;
`;

const ItemsList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 24px;
  overflow-y: auto;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  transition: background 0.1s;
  &:hover { background: rgba(150,150,150,0.05); }
`;

const ItemQty = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  min-width: 28px;
  background: rgba(252,163,17,0.1);
  border-radius: 5px;
  padding: 2px 6px;
  text-align: center;
`;

const ItemName = styled.span`
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textprimary};
`;

const ItemPrice = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textprimary};
  font-variant-numeric: tabular-nums;
`;

const TotalsBlock = styled.div`
  background: rgba(150,150,150,0.04);
  border: 1px solid rgba(150,150,150,0.1);
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 20px;
`;

const TotalLine = styled.div<{ $muted?: boolean }>`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${({ theme, $muted }) => $muted ? theme.texttertiary : theme.textprimary};
  font-weight: ${({ $muted }) => ($muted ? 500 : 600)};
  padding: 4px 0;
`;

const GrandTotal = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textprimary};
  padding: 8px 0;
`;

const TotalDivider = styled.hr`
  border: none;
  height: 1px;
  background: rgba(150,150,150,0.12);
  margin: 8px 0;
`;

const BalanceLine = styled.div<{ $positive: boolean }>`
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  padding: 6px 0;
  color: ${({ theme, $positive }) => ($positive ? theme.success : theme.danger)};
  strong { font-size: 1rem; font-variant-numeric: tabular-nums; }
`;

const ErrorBanner = styled.div`
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  color: ${({ theme }) => theme.danger};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.83rem;
  font-weight: 500;
  margin-bottom: 16px;
`;

const ConfirmBtn = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: ${({ disabled }) => disabled ? "rgba(150,150,150,0.15)" : "#10B981"};
  color: ${({ disabled }) => disabled ? "rgba(150,150,150,0.5)" : "#fff"};
  font-size: 1rem;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  transition: all 0.15s ease;
  letter-spacing: 0.01em;
  margin-top: auto;
  &:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
  }
  &:active:not(:disabled) { transform: translateY(0); }
`;

/* ── Right ── */
const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px 28px;
  background: ${({ theme }) => theme.bgCard};
  overflow-y: auto;
`;

const PayableLabel = styled.p`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.texttertiary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
`;

const PayableAmount = styled.div`
  font-size: 2.4rem;
  font-weight: 900;
  color: ${({ theme }) => theme.success};
  letter-spacing: -0.03em;
  margin-bottom: 24px;
  font-variant-numeric: tabular-nums;
`;

const TabRow = styled.div`
  display: flex;
  position: relative;
  border-bottom: 2px solid rgba(150,150,150,0.12);
  margin-bottom: 24px;
`;

const TabBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  background: none;
  border: none;
  padding: 10px 12px;
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ theme, $active }) => ($active ? theme.textprimary : theme.texttertiary)};
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
`;

const TabSlider = styled.div<{ $offset: number }>`
  position: absolute;
  bottom: -2px;
  left: ${({ $offset }) => $offset}%;
  width: 50%;
  height: 2px;
  background: ${({ theme }) => theme.primary};
  border-radius: 2px;
  transition: left 0.2s ease;
`;

/* ── Cash panel ── */
const CashPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AmountDisplay = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  background: rgba(150,150,150,0.05);
  border: 1px solid rgba(150,150,150,0.12);
  border-radius: 12px;
  padding: 16px 20px;
  span {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.texttertiary};
    font-weight: 600;
  }
`;

const AmountValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.textprimary};
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
`;

const Numpad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const NumKey = styled.button<{ $isDelete?: boolean }>`
  height: 54px;
  border-radius: 10px;
  border: 1px solid rgba(150,150,150,0.12);
  background: ${({ $isDelete, theme }) =>
    $isDelete ? `rgba(239,68,68,0.06)` : theme.bgCard};
  color: ${({ $isDelete, theme }) => ($isDelete ? theme.danger : theme.textprimary)};
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
  &:hover {
    background: ${({ $isDelete }) =>
      $isDelete ? "rgba(239,68,68,0.12)" : "rgba(252,163,17,0.08)"};
    border-color: ${({ $isDelete }) =>
      $isDelete ? "rgba(239,68,68,0.3)" : "rgba(252,163,17,0.3)"};
    transform: scale(0.97);
  }
  &:active { transform: scale(0.93); }
`;

const QuickAmounts = styled.div`
  display: flex;
  gap: 8px;
`;

const QuickBtn = styled.button`
  flex: 1;
  padding: 9px 0;
  border-radius: 8px;
  border: 1px solid rgba(252,163,17,0.25);
  background: rgba(252,163,17,0.06);
  color: ${({ theme }) => theme.primary};
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
  &:hover { background: rgba(252,163,17,0.14); }
`;

/* ── Other panel ── */
const OtherPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MethodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const MethodChip = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? "rgba(252,163,17,0.4)" : "rgba(150,150,150,0.15)")};
  background: ${({ $active }) => ($active ? "rgba(252,163,17,0.1)" : "transparent")};
  color: ${({ theme, $active }) => ($active ? theme.primary : theme.textprimary)};
  font-size: 0.83rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s;
  &:hover { border-color: rgba(252,163,17,0.3); background: rgba(252,163,17,0.06); }
`;

const ChipCode = styled.span<{ $sm?: boolean }>`
  min-width: ${({ $sm }) => ($sm ? "28px" : "32px")};
  height: ${({ $sm }) => ($sm ? "22px" : "26px")};
  border-radius: 5px;
  background: rgba(252,163,17,0.12);
  color: ${({ theme }) => theme.primary};
  font-size: ${({ $sm }) => ($sm ? "0.62rem" : "0.68rem")};
  font-weight: 800;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "SF Mono", "Fira Code", monospace;
  flex-shrink: 0;
`;

const PaymentRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(150,150,150,0.04);
  border: 1px solid rgba(150,150,150,0.1);
  border-radius: 10px;
  padding: 14px;
`;

const PaymentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PaymentRowLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-size: 0.83rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textprimary};
`;

const PaymentRowInput = styled.input`
  width: 110px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(150,150,150,0.15);
  background: ${({ theme }) => theme.bgCard};
  color: ${({ theme }) => theme.textprimary};
  font-size: 0.9rem;
  font-weight: 700;
  text-align: right;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.primary}; }
`;

const OtherTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(150,150,150,0.1);
  font-size: 0.83rem;
  color: ${({ theme }) => theme.texttertiary};
  font-weight: 500;
  strong { font-size: 0.95rem; font-variant-numeric: tabular-nums; }
`;

const EmptyMethods = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.texttertiary};
  font-size: 0.83rem;
  padding: 32px 0;
  opacity: 0.6;
`;

const ChangePill = styled.div<{ $positive: boolean; $show: boolean }>`
  margin-top: auto;
  padding-top: 16px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme, $positive }) => ($positive ? theme.success : theme.danger)};
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  transition: opacity 0.2s;
  font-variant-numeric: tabular-nums;
`;

/* ── Success screen ── */
const SuccessScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 40px);
  gap: 16px;
  padding: 40px;
`;

const SuccessCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(16,185,129,0.12);
  color: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: ${({ theme }) => theme.textprimary};
`;

const SuccessSubtitle = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.texttertiary};
  margin: 0;
  font-weight: 500;
`;

const SuccessTotal = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: #10B981;
  font-variant-numeric: tabular-nums;
`;

const ChangeRow = styled.div`
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.texttertiary};
  strong { color: ${({ theme }) => theme.textprimary}; }
`;

const SuccessActions = styled.div`
  margin-top: 8px;
`;

const BackBtn = styled.button`
  padding: 14px 36px;
  border-radius: 10px;
  border: 1px solid rgba(150,150,150,0.2);
  background: transparent;
  color: ${({ theme }) => theme.textprimary};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  &:hover { background: rgba(150,150,150,0.08); }
`;

export default CheckoutPage;
