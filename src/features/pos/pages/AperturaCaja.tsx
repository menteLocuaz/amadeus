import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners";
import {
    FiCalendar, FiClock, FiDollarSign, FiUser,
    FiSun, FiSunset, FiMoon,
    FiFileText, FiCheckCircle, FiMonitor, FiSettings, FiAlertTriangle,
} from "react-icons/fi";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { usePOSStore } from "../store/usePOSStore";
import { type Caja } from "../services/CajaService";
import { PeriodoService } from "../services/PeriodoService";
import { POSService } from "../services/POSService";
import { EstacionService, type EstacionAPI } from "../../estacion/services/EstacionService";
import {
    PageContainer,
    TableCard,
    FormGroup as UIFormGroup,
    Badge as UIBadge,
    ModalOverlay,
    ModalContent
} from "../../../shared/components/UI";

/* ═══════════════════════════════════════════════════════════
   VALIDACIÓN Y TIPOS
═══════════════════════════════════════════════════════════ */
const schema = yup.object({
    monto_inicial: yup
        .number()
        .typeError("Ingresa un monto válido")
        .min(0, "El monto no puede ser negativo")
        .required("El monto es requerido"),
    id_caja: yup.string().required("La caja es requerida"),
    cajero: yup.string().required("El cajero es requerido"),
    turno: yup.string().oneOf(["matutino", "vespertino", "nocturno"] as const).required("Selecciona un turno"),
    notas: yup.string().ensure().default(""),
});

export interface AperturaForm {
    monto_inicial: number;
    id_caja: string;
    cajero: string;
    turno: "matutino" | "vespertino" | "nocturno";
    notas: string;
}

type Turno = AperturaForm["turno"];

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("es-MX", opts);

const fmtTime = (d: Date) =>
    d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v);

const TURNOS: { value: Turno; label: string; Icon: React.ElementType }[] = [
    { value: "matutino", label: "Matutino", Icon: FiSun },
    { value: "vespertino", label: "Vespertino", Icon: FiSunset },
    { value: "nocturno", label: "Nocturno", Icon: FiMoon },
];

/* ═══════════════════════════════════════════════════════════
   ANIMACIONES Y ESTILOS
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

const LiveClock = styled.span`
  animation: ${pulse} 2s infinite;
`;

const InfoBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.bg3}11;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text}CC;
  svg { color: #FCA311; }
`;

const AnimatedTerminalSetup = styled.div`
  animation: ${pop} 0.4s ease;
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════════════════ */
const AperturaCaja: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { id_estacion, estacionNombre, setEstacion, setPeriodo, initialize } = usePOSStore();

    const [estaciones, setEstaciones] = useState<EstacionAPI[]>([]);
    const [caja, setCaja] = useState<Caja | null>(null);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        initialize();
        return () => clearInterval(t);
    }, [initialize]);

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
            id_caja: "",
            notas: "",
        },
    });

    useEffect(() => {
        if (user?.usu_nombre && watch("cajero") !== user.usu_nombre) {
            setValue("cajero", user.usu_nombre);
        }
    }, [user, setValue, watch]);

    // Cargar estaciones si no hay una seleccionada
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                if (!id_estacion) {
                    const list = await EstacionService.getAll();
                    setEstaciones(list);
                } else {
                    const { caja: cajaData, periodo } = await POSService.getEstado(id_estacion);
                    if (cajaData) {
                        setCaja(cajaData);
                        setValue("id_caja", cajaData.id);
                    }
                    if (periodo) {
                        setPeriodo(periodo);
                        // Si ya hay un periodo activo, redirigir al POS
                        navigate("/pos");
                    }
                }
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id_estacion, setValue, navigate, setPeriodo]);

    const montoWatch = watch("monto_inicial");

    const onSelectEstacion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const est = estaciones.find(est => est.id_estacion === id);
        if (est) {
            setEstacion(est.id_estacion, est.nombre);
        }
    };

    const onSubmit = async (data: AperturaForm) => {
        try {
            const newPeriodo = await PeriodoService.abrir({
                id_caja: data.id_caja,
                monto_apertura: data.monto_inicial,
                comentario: data.notas
            });
            setPeriodo(newPeriodo);
            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Error al abrir la caja.");
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <PageLayout>
                    <ClimbingBoxLoader color="#FCA311" />
                </PageLayout>
            </PageContainer>
        );
    }

    if (submitted) {
        return (
            <ModalOverlay>
                <ModalContent style={{ maxWidth: '480px', textAlign: 'center' }}>
                    <div style={{ color: '#10B981', fontSize: '4rem', marginBottom: '20px' }}>
                        <FiCheckCircle />
                    </div>
                    <Title>¡Caja Abierta!</Title>
                    <Subtitle>El turno ha comenzado exitosamente.</Subtitle>
                    <BtnPrimary style={{ marginTop: '30px' }} onClick={() => navigate("/pos")}>
                        Ir al Punto de Venta
                    </BtnPrimary>
                </ModalContent>
            </ModalOverlay>
        );
    }

    return (
        <PageContainer>
            <PageLayout>
                <TableCard style={{ maxWidth: '580px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                    <FormHeader>
                        <UIBadge style={{ marginBottom: '12px' }}>🏪 Sistema POS</UIBadge>
                        <Title>Apertura de Caja</Title>
                        <Subtitle>Vincula tu estación y registra el fondo inicial</Subtitle>
                    </FormHeader>

                    <CardBody>
                        {!id_estacion ? (
                            <AnimatedTerminalSetup>
                                <InfoBar>
                                    <FiSettings /> Esta terminal aún no está configurada.
                                </InfoBar>
                                <UIFormGroup>
                                    <label><FiMonitor /> Selecciona esta Estación POS</label>
                                    <select onChange={onSelectEstacion}>
                                        <option value="">Seleccionar...</option>
                                        {estaciones.map(e => (
                                            <option key={e.id_estacion} value={e.id_estacion}>{e.nombre} ({e.ip})</option>
                                        ))}
                                    </select>
                                    <Subtitle style={{ marginTop: '8px' }}>
                                        Esta configuración se guardará localmente en este navegador.
                                    </Subtitle>
                                </UIFormGroup>
                            </AnimatedTerminalSetup>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <InfoBar>
                                    <FiMonitor /> Estación: <strong>{estacionNombre}</strong>
                                    <button
                                        type="button"
                                        onClick={() => usePOSStore.getState().clearEstacion()}
                                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                                    >
                                        CAMBIAR
                                    </button>
                                </InfoBar>

                                <PeriodBox>
                                    <PeriodLabel><FiCalendar size={13} /> Operación</PeriodLabel>
                                    <PeriodGrid>
                                        <PeriodItem>
                                            <PeriodItemLabel><FiCalendar size={11} /> Fecha</PeriodItemLabel>
                                            <PeriodItemValue $accent="#FCA311">
                                                {fmt(time, { dateStyle: 'medium' })}
                                            </PeriodItemValue>
                                        </PeriodItem>
                                        <PeriodItem>
                                            <PeriodItemLabel><FiClock size={11} /> Hora</PeriodItemLabel>
                                            <PeriodItemValue $accent="#3B82F6">
                                                <LiveClock>{fmtTime(time)}</LiveClock>
                                            </PeriodItemValue>
                                        </PeriodItem>
                                    </PeriodGrid>
                                </PeriodBox>

                                <MontoBox>
                                    <MontoIcon><FiDollarSign /></MontoIcon>
                                    <div>
                                        <Subtitle style={{ marginBottom: '4px' }}>Fondo de apertura</Subtitle>
                                        <MontoValue>{fmtCurrency(Number(montoWatch || 0))}</MontoValue>
                                    </div>
                                </MontoBox>

                                <UIFormGroup>
                                    <label htmlFor="monto_inicial">Monto inicial en caja *</label>
                                    <input
                                        id="monto_inicial"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register("monto_inicial", { valueAsNumber: true })}
                                    />
                                    {errors.monto_inicial && <ErrorMsg>{errors.monto_inicial.message}</ErrorMsg>}
                                </UIFormGroup>

                                <UIFormGroup>
                                    <label htmlFor="cajero"><FiUser size={13} /> Cajero responsable</label>
                                    <input id="cajero" {...register("cajero")} readOnly />
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
                                    <label htmlFor="notas"><FiFileText size={13} /> Notas</label>
                                    <textarea id="notas" placeholder="Observaciones..." {...register("notas")} />
                                </UIFormGroup>

                                <input type="hidden" {...register("id_caja")} />
                                {!caja && !loading && (
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#EF4444',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '20px',
                                        border: '1px solid rgba(239, 68, 68, 0.2)'
                                    }}>
                                        <FiAlertTriangle size={20} />
                                        <span>Esta terminal no está autorizada para realizar ventas. Contacte al administrador para vincular esta estación a una caja.</span>
                                    </div>
                                )}

                                <BtnPrimary type="submit" disabled={isSubmitting || !caja}>
                                    {isSubmitting ? <ClimbingBoxLoader color="#000" size={12} /> : "Abrir Caja"}
                                </BtnPrimary>                            </form>
                        )}
                    </CardBody>
                </TableCard>
            </PageLayout>
        </PageContainer>
    );
};

export default AperturaCaja;
