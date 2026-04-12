import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners";
import { FiMonitor, FiCheckCircle, FiDollarSign, FiCalendar } from "react-icons/fi";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { usePOSStore } from "../store/usePOSStore";
import { EstacionService, type EstacionAPI } from "../../estacion/services/EstacionService";
import { PeriodoService } from "../services/PeriodoService";
import { POSService } from "../services/POSService";
import { AuthService } from "../../auth/services/AuthService";

/* ═══════════════════════════════════════════════════════════
   TYPES & ENUMS
═══════════════════════════════════════════════════════════ */
type OperativeState = 
  | 'INIT' 
  | 'CAJA_SELECTED' 
  | 'PERIODO_ABIERTO' 
  | 'BASE_ASIGNADA' 
  | 'READY_TO_SELL';

/* ═══════════════════════════════════════════════════════════
   ANIMATIONS & STYLES
═══════════════════════════════════════════════════════════ */
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const MainWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
`;

const TerminalCard = styled.div`
  width: 100%;
  max-width: 600px;
  background: ${({ theme }) => theme.bg2 || '#1E293B'};
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  padding: 30px;
  animation: ${fadeIn} 0.4s ease;
  color: ${({ theme }) => theme.text || '#fff'};
`;

const Title = styled.h2`
  font-size: 1.6rem;
  margin: 0 0 10px;
  text-align: center;
  color: ${({ theme }) => theme.text || '#fff'};
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  text-align: center;
  color: ${({ theme }) => theme.texttertiary || '#94A3B8'};
  margin-bottom: 30px;
`;

const Btn = styled.button<{ $variant?: 'primary'|'danger'|'outline'|'success' }>`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'danger': return `background: #EF4444; color: white;`;
      case 'outline': return `background: transparent; border: 2px solid ${theme.bg3 || '#334155'}; color: ${theme.text || '#fff'};`;
      case 'success': return `background: #10B981; color: white;`;
      default: return `background: #10B981; color: white;`;
    }
  }}

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const SelectBox = styled.select`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg || '#0F172A'};
  border: 1px solid ${({ theme }) => theme.bg3 || '#334155'};
  color: ${({ theme }) => theme.text || '#fff'};
  font-size: 1rem;
  margin-bottom: 20px;
  &:focus { outline: none; border-color: #3B82F6; }
`;

const InputNumber = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 1.8rem;
  text-align: center;
  background: ${({ theme }) => theme.bg || '#0F172A'};
  border: 2px solid #10B981;
  border-radius: 8px;
  color: ${({ theme }) => theme.text || '#fff'};
  margin-bottom: 20px;
  &:focus { outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
`;

const PanelData = styled.div`
  background: ${({ theme }) => theme.bg || '#0F172A'};
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid ${({ theme }) => theme.bg3 || '#334155'};
`;

const RowItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed ${({ theme }) => theme.bg3 || '#334155'};
  &:last-child { border: none; padding-bottom: 0; }
  span { color: ${({ theme }) => theme.texttertiary || '#94A3B8'}; font-size: 0.9rem; }
  strong { color: ${({ theme }) => theme.text || '#fff'}; font-size: 1.05rem; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.bg2 || '#1E293B'};
  padding: 35px;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  animation: ${fadeIn} 0.3s ease;
  text-align: center;
`;

/* MaxPoint Styles */
const MaxPointContainer = styled.div`
  background: #2B3A4A;
  border-radius: 10px;
  padding: 24px;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
`;
const MaxTitle = styled.h1`
  font-size: 2.2rem;
  color: #10B981;
  font-weight: 300;
  text-align: center;
  margin: 0;
  letter-spacing: 2px;
  span { color: #3B82F6; }
`;
const MaxVersion = styled.p`
  text-align: center;
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  letter-spacing: 1px;
  margin-top: 5px;
  margin-bottom: 30px;
`;
const MaxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
`;
const MaxLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const MaxCajaLabel = styled.div`
  background: #0078D7;
  color: white;
  padding: 12px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
`;
const MaxInput = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: none;
  background: white;
`;
const UserInfoBlock = styled.div`
  margin-top: 20px;
  h4 { color: white; margin: 0 0 10px; font-weight: normal; font-size: 1rem; }
  h2 { color: white; margin: 0 0 5px; font-size: 1.4rem; }
  p { color: #A0AAB5; margin: 0; font-size: 0.8rem; }
`;
const Keypad = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr) 1.2fr;
  gap: 8px;
`;
const KeyBtn = styled.button<{ $isOk?: boolean }>`
  background: ${({ $isOk }) => $isOk ? '#22C55E' : '#FFFFFF'};
  color: ${({ $isOk }) => $isOk ? '#FFF' : '#333'};
  border: none;
  font-size: 1.4rem;
  font-weight: bold;
  padding: 15px 0;
  cursor: pointer;
  border-radius: 2px;
  grid-row: ${({ $isOk }) => $isOk ? '1 / span 4' : 'auto'};
  grid-column: ${({ $isOk }) => $isOk ? '4' : 'auto'};
  &:hover { opacity: 0.9; }
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const AperturaCajaProgressive: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { id_estacion, estacionNombre, setEstacion, setControlEstacion, clearEstacion, initialize, setPeriodo } = usePOSStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<OperativeState>('INIT');

  const [sucursales, setSucursales] = useState<any[]>([]);
  const [estaciones, setEstaciones] = useState<EstacionAPI[]>([]);
  
  const [selectedSucursal, setSelectedSucursal] = useState("");
  const [selectedEstacion, setSelectedEstacion] = useState("");
  const [cajaInfo, setCajaInfo] = useState<any>(null);

  const [baseAmount, setBaseAmount] = useState<string>("0");

  const [pinEntry, setPinEntry] = useState("");

  useEffect(() => {
    initialize();
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. Cargas iniciales
      const sucs = await AuthService.getSucursales();
      setSucursales(sucs.data || []);
      
      const ests = await EstacionService.getAll();
      setEstaciones(ests);

      // Si ya hay estación guardada localmente
      if (id_estacion) {
        checkEstacionStatus(id_estacion);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkEstacionStatus = async (estacionId: string) => {
    setSubmitting(true);
    try {
      const resp = await POSService.getEstado(estacionId);
      const NULL_UUID = "00000000-0000-0000-0000-000000000000";

      setCajaInfo({
        id: resp.id_control_estacion !== NULL_UUID ? resp.id_control_estacion : estacionId,
        nombre: resp.nombre_estacion,
        estado: resp.status_descripcion,
        fondo_base: resp.fondo_base,
      });

      const isActive = resp.status_descripcion?.toLowerCase() !== 'cerrada'
        && resp.id_control_estacion !== NULL_UUID;

      if (isActive) {
        setControlEstacion(resp.id_control_estacion);
        setBaseAmount(String(resp.fondo_base ?? 0));
        setState('READY_TO_SELL');
      } else {
        setState('CAJA_SELECTED');
      }
    } catch (e: any) {
      if (e.response?.status === 404) {
        alert("Esa estación no tiene una caja vinculada o está inválida.");
      }
      clearEstacion();
      setState('INIT');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectSystem = async () => {
    if (!selectedEstacion) return alert("Selecciona la Estación / Caja");
    const est = estaciones.find(e => e.id_estacion === selectedEstacion);
    if(est) {
      setEstacion(est.id_estacion, est.nombre);
      await checkEstacionStatus(est.id_estacion);
    }
  };

  const handleOpenPeriodo = async () => {
    setSubmitting(true);
    try {
      const periodo = await PeriodoService.abrir();
      if (periodo) setPeriodo(periodo);
      setState('PERIODO_ABIERTO');
    } catch (e: any) {
      // 400/409 = ya hay un periodo activo → continuar sin bloquear
      if (e.response?.status === 400 || e.response?.status === 409) {
        setState('PERIODO_ABIERTO');
        return;
      }
      alert(e.response?.data?.message || "Error al abrir periodo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBaseAsignada = () => {
    if (isNaN(Number(baseAmount)) || Number(baseAmount) < 0) {
      return alert("Ingresa un monto válido");
    }
    setState('BASE_ASIGNADA');
  };

  const handleConfirmarFondos = async () => {
    if (!id_estacion) return alert("No se ha seleccionado una estación");
    
    // User ID is required by the backend to track who opened the POS session
    const id_user_pos = user?.id || (user as any)?.id_usuario || "";
    if (!id_user_pos) return alert("No se pudo identificar al usuario actual");

    setSubmitting(true);
    try {
      const payload = { 
        id_estacion, 
        fondo_base: Number(baseAmount),
        id_user_pos
      };

      const aperturaRes = await POSService.abrir(payload);
      if (aperturaRes?.id_control_estacion) {
        setControlEstacion(aperturaRes.id_control_estacion);
      }
      setState('READY_TO_SELL');
    } catch (e: any) {
      // 400/409 often means session already active/open for this terminal
      if (e.response?.status === 400 || e.response?.status === 409) {
        setState('READY_TO_SELL');
        return;
      }
      const errorMsg = e.response?.data?.message || "Error al asignar fondo a la caja";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDesasignar = () => {
    clearEstacion();
    setState('INIT');
    setBaseAmount("0");
  };

  const onPadPress = (key: string) => {
    if (key === '<=') {
      setPinEntry(prev => prev.slice(0, -1));
    } else if (key === 'Borrar') {
      setPinEntry("");
    } else {
      setPinEntry(prev => prev + key);
    }
  };

  const handleLoginPos = () => {
    if (pinEntry.length > 0) {
      // Si validamos pin internamente, se haría aquí.
      navigate("/pos");
    } else {
      navigate("/pos");
    }
  };

  if (loading) {
    return <MainWrap><ClimbingBoxLoader color="#10B981" /></MainWrap>;
  }

  // PANTALLA FINAL: LISTA PARA VENDER
  if (state === 'READY_TO_SELL') {
    return (
      <MainWrap>
        <TerminalCard>
          {/* Badge de estado */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              background: '#10B981',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: '99px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>🟢 Lista para vender</span>
          </div>

          <Title style={{ marginBottom: '4px' }}>Caja Activa</Title>
          <Subtitle>{cajaInfo?.nombre || estacionNombre} — {new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}</Subtitle>

          {/* Checkmarks de estado */}
          <PanelData style={{ marginBottom: '28px' }}>
            <RowItem>
              <span>Estado del periodo</span>
              <strong style={{ color: '#10B981' }}>✅ Periodo activo</strong>
            </RowItem>
            <RowItem>
              <span>Caja asignada</span>
              <strong style={{ color: '#10B981' }}>✅ {cajaInfo?.nombre || estacionNombre}</strong>
            </RowItem>
            <RowItem>
              <span>Fondo inicial confirmado</span>
              <strong style={{ color: '#10B981' }}>✅ ${Number(baseAmount).toFixed(2)}</strong>
            </RowItem>
            <RowItem>
              <span>Cajero</span>
              <strong>{user?.usu_nombre || 'Cajero actual'}</strong>
            </RowItem>
          </PanelData>

          {/* Acciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Btn $variant="success" onClick={() => navigate('/pos')}>
              🟢 Ingresar al POS (comenzar ventas)
            </Btn>
            <Btn $variant="outline" onClick={handleDesasignar}>
              🔄 Reasignar caja / cambiar caja
            </Btn>
          </div>
        </TerminalCard>
      </MainWrap>
    );
  }

  return (
    <MainWrap>
      {/* 
        =============================================
        STATE: INIT
        =============================================
      */}
      {state === 'INIT' && (
        <TerminalCard>
          <FiMonitor size={42} color="#10B981" style={{ display: 'block', margin: '0 auto 15px' }} />
          <Title>Selección de Caja y ERP</Title>
          <Subtitle>Por favor elige la sucursal y la caja disponible para iniciar el turno.</Subtitle>

          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Sucursal / ERP</label>
          <SelectBox value={selectedSucursal} onChange={e => setSelectedSucursal(e.target.value)}>
            <option value="">Seleccionar Sucursal...</option>
            {sucursales.map(s => <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre_sucursal}</option>)}
          </SelectBox>

          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Caja Disponible (Estación)</label>
          <SelectBox value={selectedEstacion} onChange={e => setSelectedEstacion(e.target.value)}>
            <option value="">Listado de Cajas...</option>
            {estaciones.map(e => <option key={e.id_estacion} value={e.id_estacion}>{e.nombre}</option>)}
          </SelectBox>

          <Btn onClick={handleSelectSystem} disabled={submitting}>
            {submitting ? "Verificando..." : "Continuar"}
          </Btn>
        </TerminalCard>
      )}

      {/* 
        =============================================
        MODAL 1: CONFIRMACIÓN APERTURA
        =============================================
      */}
      {state === 'CAJA_SELECTED' && (
        <ModalOverlay>
          <ModalBox>
            <FiCalendar size={50} color="#3B82F6" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 10px', color: '#fff' }}>¿Deseas abrir el periodo de ventas?</h2>
            <p style={{ color: '#94A3B8', marginBottom: '30px' }}>
              Se asignará el inicio de operaciones para <strong>{cajaInfo?.nombre}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Btn $variant="outline" onClick={() => setState('INIT')}>❌ Cancelar</Btn>
              <Btn $variant="success" onClick={handleOpenPeriodo} disabled={submitting}>
                {submitting ? "Abriendo..." : "✅ Abrir periodo"}
              </Btn>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* 
        =============================================
        MODAL 2: ASIGNACIÓN DE BASE
        =============================================
      */}
      {state === 'PERIODO_ABIERTO' && (
        <ModalOverlay>
          <ModalBox>
            <FiDollarSign size={50} color="#10B981" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ margin: '0 0 10px', color: '#fff' }}>Fondo Inicial</h2>
            <p style={{ color: '#94A3B8', marginBottom: '25px' }}>
              Asigna la base de caja (efectivo inicial) para <strong>{cajaInfo?.nombre}</strong>
            </p>
            <InputNumber 
              type="number" 
              value={baseAmount} 
              onChange={e => setBaseAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <div style={{ display: 'flex', gap: '15px' }}>
              <Btn $variant="outline" onClick={() => { clearEstacion(); setState('INIT'); }}>❌ Cancelar</Btn>
              <Btn $variant="success" onClick={handleBaseAsignada}>✅ Confirmar base</Btn>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* 
        =============================================
        PANEL: CONFIRMACIÓN CAJERO
        =============================================
      */}
      {state === 'BASE_ASIGNADA' && (
        <TerminalCard>
          <FiCheckCircle size={46} color="#10B981" style={{ display: 'block', margin: '0 auto 15px' }} />
          <Title>Confirmación de Fondos</Title>
          <Subtitle>Confirma que el fondo inicial es correcto antes de comenzar.</Subtitle>

          <PanelData>
             <RowItem>
               <span>Nombre de la caja</span>
               <strong>{cajaInfo?.nombre || estacionNombre}</strong>
             </RowItem>
             <RowItem>
               <span>Fecha de periodo</span>
               <strong>{new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}</strong>
             </RowItem>
             <RowItem>
               <span>Cajero Asignado</span>
               <strong>{user?.usu_nombre || "Cajero actual"}</strong>
             </RowItem>
             <RowItem>
               <span>Monto Asignado</span>
               <strong style={{ color: '#10B981', fontSize: '1.2rem' }}>${Number(baseAmount).toFixed(2)}</strong>
             </RowItem>
          </PanelData>

          <div style={{ display: 'flex', gap: '15px' }}>
            <Btn $variant="outline" onClick={() => setState('PERIODO_ABIERTO')}>❌ Rechazar</Btn>
            <Btn $variant="success" onClick={handleConfirmarFondos} disabled={submitting}>
              {submitting ? "Guardando..." : "✅ Confirmar fondos"}
            </Btn>
          </div>
        </TerminalCard>
      )}
      
    </MainWrap>
  );
};

export default AperturaCajaProgressive;
