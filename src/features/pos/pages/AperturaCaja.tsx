import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners";
import {
    FiCalendar, FiClock, FiDollarSign, FiUser,
    FiSun, FiSunset, FiMoon, FiMapPin,
    FiFileText, FiCheckCircle, FiArrowLeft,
    FiAlertCircle, FiMonitor
} from "react-icons/fi";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useCatalogStore } from "../../../shared/store/useCatalogStore";
import { CajaService, type Caja } from "../services/CajaService";
import { 
    PageContainer, 
    TableCard, 
    FormGroup as UIFormGroup, 
    Badge as UIBadge,
    ModalOverlay,
    ModalContent
} from "../../../shared/components/UI";

/* ═══════════════════════════════════════════════════════════
   VALIDACIÓN Y TIPOS (Sincronizados)
═══════════════════════════════════════════════════════════ */
const schema = yup.object({
    monto_inicial: yup
        .number()
        .typeError("Ingresa un monto válido")
        .min(0, "El monto no puede ser negativo")
        .required("El monto es requerido"),
    id_caja: yup.string().required("Selecciona la estación (Caja)"),
    cajero: yup.string().required("El cajero es requerido"),
    turno: yup.string().oneOf(["matutino", "vespertino", "nocturno"] as const).required("Selecciona un turno"),
    id_sucursal: yup.string().required("Selecciona una sucursal"),
    notas: yup.string().ensure().default(""),
});

export interface AperturaForm {
    monto_inicial: number;
    id_caja: string;
    cajero: string;
    turno: "matutino" | "vespertino" | "nocturno";
    id_sucursal: string;
    notas: string;
}

type Turno = AperturaForm["turno"];

interface PeriodoInfo {
    fechaApertura: string;
    inicioMes: string;
    finMes: string;
    labelMes: string;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("es-MX", opts);

const fmtTime = (d: Date) =>
    d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v);

function buildPeriodo(date: Date): PeriodoInfo {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const short = (d: Date) => fmt(d, { day: "2-digit", month: "short", year: "numeric" });
    return {
        fechaApertura: fmt(date, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        inicioMes: short(start),
        finMes: short(end),
        labelMes: fmt(date, { month: "long", year: "numeric" }),
    };
}

const TURNOS: { value: Turno; label: string; Icon: React.ElementType }[] = [
    { value: "matutino", label: "Matutino", Icon: FiSun },
    { value: "vespertino", label: "Vespertino", Icon: FiSunset },
    { value: "nocturno", label: "Nocturno", Icon: FiMoon },
];

/* ═══════════════════════════════════════════════════════════
   ANIMACIONES Y ESTILOS ESPECIALIZADOS
═══════════════════════════════════════════════════════════ */
const pulse = keyframes`0%,100% { opacity: 1; } 50% { opacity: 0.6; }`;
const pop = keyframes`0% { transform: scale(0.7); opacity: 0; } 80% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; }`;

const PageLayout = styled.div`
  min-height: calc(100vh - 160px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, rgba(252,163,17,0.12), rgba(252,163,17,0.04));
  border-bottom: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 28px 35px 22px;
`;

const Title = styled.h2`
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.text}80;
  font-size: 0.88rem;
`;

const CardBody = styled.div`
  padding: 28px 35px;
`;

const PeriodBox = styled.div`
  background: ${({ theme }) => theme.bg3}22;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 22px;
  border: 1px solid ${({ theme }) => theme.bg3}33;
`;

const PeriodLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text}80;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PeriodGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const PeriodItem = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.bg3}22;
`;

const PeriodItemLabel = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.text}66;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PeriodItemValue = styled.div<{ $accent?: string }>`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ $accent, theme }) => $accent || theme.text};
  font-variant-numeric: tabular-nums;
`;

const PeriodFooter = styled.div`
  margin-top: 10px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text}80;
  display: flex;
  align-items: center;
  gap: 6px;
  strong { color: ${({ theme }) => theme.text}; }
`;

const MontoBox = styled.div`
  background: rgba(252,163,17,0.08);
  border: 1.5px solid rgba(252,163,17,0.3);
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const MontoIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(252,163,17,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FCA311;
  font-size: 1.4rem;
  flex-shrink: 0;
`;

const MontoLabel = styled.div`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.text}80;
  margin-bottom: 4px;
`;

const MontoValue = styled.div`
  font-size: 1.9rem;
  font-weight: 900;
  color: #FCA311;
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

const ErrorMsg = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #EF4444;
  font-size: 0.78rem;
  margin-top: 5px;
`;

const TurnoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const TurnoBtn = styled.button<{ $active: boolean }>`
  padding: 10px 8px;
  border-radius: 10px;
  border: 1.5px solid ${({ $active }) => $active ? "#FCA311" : "rgba(0,0,0,0.1)"};
  background: ${({ $active }) => $active ? "rgba(252,163,17,0.12)" : "transparent"};
  color: ${({ $active, theme }) => $active ? "#FCA311" : theme.text + "80"};
  font-size: 0.82rem;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  &:hover { border-color: #FCA311; color: #FCA311; }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.bg3}33;
  margin: 20px 0;
`;

const BtnPrimary = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: #FCA311;
  color: #000;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
  &:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }
`;

const BtnBack = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text}80;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  &:hover { color: #FCA311; }
`;

const SuccessIcon = styled.div`
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: rgba(16,185,129,0.15);
  border: 2px solid #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10B981;
  font-size: 2rem;
  margin-bottom: 18px;
  animation: ${pop} 0.5s ease;
  margin: 0 auto 18px;
`;

const SuccessTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.text};
`;

const SuccessSubtitle = styled.p`
  color: ${({ theme }) => theme.text}80;
  margin: 0 0 24px;
  font-size: 0.9rem;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin-bottom: 24px;
`;

const LiveClock = styled.span`
  animation: ${pulse} 2s infinite;
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
const AperturaCaja: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { sucursales, fetchCatalogs } = useCatalogStore();
    
    const [cajas, setCajas] = useState<Caja[]>([]);
    const [loadingCajas, setLoadingCajas] = useState(false);
    const [time, setTime] = useState(new Date());
    const [submitted, setSubmitted] = useState(false);
    const [savedData, setSavedData] = useState<AperturaForm | null>(null);

    const now = new Date();
    const periodo = buildPeriodo(now);

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        fetchCatalogs();
        
        const loadCajas = async () => {
            setLoadingCajas(true);
            try {
                const list = await CajaService.getCajas();
                setCajas(list);
            } catch (err) {
                console.error("Error cargando cajas:", err);
            } finally {
                setLoadingCajas(false);
            }
        };
        loadCajas();

        return () => clearInterval(t);
    }, [fetchCatalogs]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AperturaForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            monto_inicial: 0,
            cajero: user?.usu_nombre || "",
            turno: "matutino",
            id_sucursal: "",
            id_caja: "",
            notas: "",
        },
    });

    useEffect(() => {
        if (user?.usu_nombre) setValue("cajero", user.usu_nombre);
    }, [user, setValue]);

    const montoWatch = watch("monto_inicial");
    const idSucursalWatch = watch("id_sucursal");

    const filteredCajas = idSucursalWatch 
        ? cajas.filter(c => c.id_sucursal === idSucursalWatch)
        : cajas;

    const onSubmit = async (data: AperturaForm) => {
        try {
            await CajaService.abrirCaja({
                id_caja: data.id_caja,
                id_usuario: user?.id_usuario || "",
                monto_apertura: data.monto_inicial,
                turno: data.turno,
                notas: data.notas
            });
            setSavedData(data);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Error al abrir la caja. Por favor intente de nuevo.");
        }
    };

    const renderSuccess = () => {
        if (!savedData) return null;
        const sucursalNombre = sucursales.find(s => (s.id || s.id_sucursal) === savedData.id_sucursal)?.nombre || "Sucursal";
        const cajaNombre = cajas.find(c => c.id === savedData.id_caja)?.nombre || "Terminal";
        const turnoNombre = TURNOS.find(t => t.value === savedData.turno)?.label || savedData.turno;

        return (
            <ModalOverlay>
                <ModalContent style={{ maxWidth: '480px', textAlign: 'center' }}>
                    <SuccessIcon><FiCheckCircle /></SuccessIcon>
                    <SuccessTitle>¡Caja Abierta!</SuccessTitle>
                    <SuccessSubtitle>La apertura fue registrada exitosamente en {cajaNombre}.</SuccessSubtitle>

                    <SummaryGrid>
                        {[
                            { label: "Cajero", value: savedData.cajero, accent: undefined },
                            { label: "Sucursal", value: sucursalNombre, accent: undefined },
                            { label: "Estación", value: cajaNombre, accent: undefined },
                            { label: "Monto", value: fmtCurrency(savedData.monto_inicial), accent: "#FCA311" },
                            { label: "Turno", value: turnoNombre, accent: undefined },
                            { label: "Fecha", value: fmt(now, { dateStyle: 'medium' }), accent: undefined },
                        ].map(({ label, value, accent }) => (
                            <PeriodItem key={label}>
                                <PeriodItemLabel>{label}</PeriodItemLabel>
                                <PeriodItemValue $accent={accent}>{value}</PeriodItemValue>
                            </PeriodItem>
                        ))}
                    </SummaryGrid>

                    <BtnPrimary onClick={() => navigate("/pos")}>
                        Ir al Punto de Venta
                    </BtnPrimary>
                </ModalContent>
            </ModalOverlay>
        );
    };

    return (
        <PageContainer>
            {submitted && renderSuccess()}
            
            <PageLayout>
                <TableCard style={{ maxWidth: '580px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                    <FormHeader>
                        <UIBadge style={{ marginBottom: '12px' }}>🏪 Sistema POS</UIBadge>
                        <Title>Apertura de Caja</Title>
                        <Subtitle>Registra el fondo inicial para comenzar el turno</Subtitle>
                    </FormHeader>

                    <CardBody>
                        <BtnBack type="button" onClick={() => navigate(-1)}>
                            <FiArrowLeft /> Volver
                        </BtnBack>

                        <PeriodBox>
                            <PeriodLabel><FiCalendar size={13} /> Período de operación</PeriodLabel>
                            <PeriodGrid>
                                <PeriodItem>
                                    <PeriodItemLabel><FiCalendar size={11} /> Fecha de apertura</PeriodItemLabel>
                                    <PeriodItemValue $accent="#FCA311" style={{ fontSize: "0.82rem" }}>
                                        {periodo.fechaApertura}
                                    </PeriodItemValue>
                                </PeriodItem>
                                <PeriodItem>
                                    <PeriodItemLabel><FiClock size={11} /> Hora actual</PeriodItemLabel>
                                    <PeriodItemValue $accent="#3B82F6">
                                        <LiveClock>{fmtTime(time)}</LiveClock>
                                    </PeriodItemValue>
                                </PeriodItem>
                            </PeriodGrid>
                            <PeriodFooter>
                                Período mensual: <strong>{periodo.labelMes}</strong>
                            </PeriodFooter>
                        </PeriodBox>

                        <MontoBox>
                            <MontoIcon><FiDollarSign /></MontoIcon>
                            <div>
                                <MontoLabel>Fondo de apertura</MontoLabel>
                                <MontoValue>
                                    {fmtCurrency(Number(montoWatch || 0))}
                                </MontoValue>
                            </div>
                        </MontoBox>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <UIFormGroup>
                                <label htmlFor="monto_inicial">
                                    <FiDollarSign size={13} /> Monto inicial en caja *
                                </label>
                                <input
                                    id="monto_inicial"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    style={errors.monto_inicial ? { borderColor: '#EF4444' } : {}}
                                    {...register("monto_inicial", { valueAsNumber: true })}
                                />
                                {errors.monto_inicial && (
                                    <ErrorMsg><FiAlertCircle size={12} />{errors.monto_inicial.message}</ErrorMsg>
                                )}
                            </UIFormGroup>

                            <Divider />

                            <FormRow>
                                <UIFormGroup>
                                    <label htmlFor="cajero">
                                        <FiUser size={13} /> Cajero responsable *
                                    </label>
                                    <input
                                        id="cajero"
                                        placeholder="Nombre del cajero"
                                        {...register("cajero")}
                                        readOnly
                                    />
                                </UIFormGroup>

                                <UIFormGroup>
                                    <label htmlFor="id_sucursal">
                                        <FiMapPin size={13} /> Sucursal *
                                    </label>
                                    <select
                                        id="id_sucursal"
                                        style={errors.id_sucursal ? { borderColor: '#EF4444' } : {}}
                                        {...register("id_sucursal")}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {sucursales.map(s => {
                                            const sid = s.id || s.id_sucursal;
                                            return <option key={sid} value={sid}>{s.nombre}</option>;
                                        })}
                                    </select>
                                </UIFormGroup>
                            </FormRow>

                            <UIFormGroup>
                                <label htmlFor="id_caja">
                                    <FiMonitor size={13} /> Estación de Cobro (Caja) *
                                </label>
                                <select
                                    id="id_caja"
                                    style={errors.id_caja ? { borderColor: '#EF4444' } : {}}
                                    {...register("id_caja")}
                                    disabled={loadingCajas || !idSucursalWatch}
                                >
                                    <option value="">{loadingCajas ? "Cargando..." : (idSucursalWatch ? "Seleccionar Caja" : "Primero elija sucursal")}</option>
                                    {filteredCajas.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                                {errors.id_caja && (
                                    <ErrorMsg><FiAlertCircle size={12} />{errors.id_caja.message}</ErrorMsg>
                                )}
                            </UIFormGroup>

                            <UIFormGroup>
                                <label><FiSun size={13} /> Turno *</label>
                                <Controller
                                    name="turno"
                                    control={control}
                                    render={({ field }) => (
                                        <TurnoGrid>
                                            {TURNOS.map(({ value, label, Icon }) => (
                                                <TurnoBtn
                                                    key={value}
                                                    type="button"
                                                    $active={field.value === value}
                                                    onClick={() => field.onChange(value)}
                                                >
                                                    <Icon size={18} />
                                                    {label}
                                                </TurnoBtn>
                                            ))}
                                        </TurnoGrid>
                                    )}
                                />
                            </UIFormGroup>

                            <UIFormGroup>
                                <label htmlFor="notas">
                                    <FiFileText size={13} /> Notas u observaciones
                                </label>
                                <textarea
                                    id="notas"
                                    placeholder="Ej: Billetes en buen estado..."
                                    {...register("notas")}
                                />
                            </UIFormGroup>

                            <BtnPrimary type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <ClimbingBoxLoader color="#000" size={12} />
                                    : <><FiCheckCircle /> Abrir Caja</>}
                            </BtnPrimary>
                        </form>
                    </CardBody>
                </TableCard>
            </PageLayout>
        </PageContainer>
    );
};

export default AperturaCaja;
