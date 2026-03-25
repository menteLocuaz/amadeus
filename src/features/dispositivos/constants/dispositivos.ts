/**
 * dispositivos.ts
 * Constantes de configuración visual del módulo de Dispositivos POS.
 *
 * Responsabilidad: centralizar los metadatos de presentación (íconos, colores,
 * labels) para los tipos de dispositivo y estados de conexión, de modo que
 * cualquier componente del módulo pueda renderizar badges, tarjetas y tablas
 * de forma consistente sin hardcodear valores visuales.
 *
 * Patrón: "Meta Object" — un Record indexado por el union type correspondiente
 * garantiza exhaustividad en tiempo de compilación: si se agrega un nuevo
 * TipoDispositivo o EstadoConexion al union, TypeScript exigirá que se agregue
 * su entrada en el meta object antes de compilar.
 *
 * Nota sobre tipos duplicados (TipoDispositivo, EstadoConexion, Dispositivo):
 * Están definidos aquí Y en useDispositivos.ts. La fuente de verdad es este
 * archivo; useDispositivos.ts debería importarlos desde aquí para evitar
 * divergencias. Ver TODO al final del archivo.
 */

import React from "react";
import {
    FiPrinter, FiMonitor, FiCreditCard, FiCpu,
    FiWifi, FiWifiOff, FiMaximize, FiTarget, FiBox
} from "react-icons/fi";
import { type DispositivoAPI } from "../services/DispositivoService";

// ── Tipos del Módulo ───────────────────────────────────────────────────────

/** Tipos de hardware POS soportados. Fuente de verdad: este archivo. */
export type TipoDispositivo = "IMPRESORA" | "DATAFONO" | "KIOSKO" | "MONITOR" | "SCANNER" | "BASCULA" | "VISOR";

/**
 * Estado de conectividad de red del dispositivo.
 * No persiste en el backend; se gestiona localmente en useDispositivos.
 *  - DESCONOCIDO → estado inicial antes del primer ping
 *  - ONLINE / OFFLINE → resultado del último ping ejecutado
 */
export type EstadoConexion = "ONLINE" | "OFFLINE" | "DESCONOCIDO";

/**
 * Extiende DispositivoAPI con el estado de conexión local.
 * El campo `estado` no viene del backend; se agrega al mapear
 * la respuesta de getAll() y se actualiza con handlePing.
 */
export type Dispositivo = DispositivoAPI & { estado: EstadoConexion };

// ── Metadatos Visuales por Tipo de Dispositivo ────────────────────────────

/**
 * TIPO_META: configuración visual para cada tipo de hardware POS.
 *
 * Campos:
 *  - label  → texto legible para el usuario (UI, tooltips, filtros)
 *  - color  → color de acento en hex (badges, bordes, íconos activos)
 *  - Icon   → componente de react-icons para renderizado directo (<meta.Icon />)
 *
 * Uso típico:
 *  const meta = TIPO_META[dispositivo.tipo];
 *  return <meta.Icon color={meta.color} />;
 *
 * Notas de asignación de íconos:
 *  - MONITOR usa FiCpu (no FiMonitor) para diferenciarlo visualmente de KIOSKO.
 *  - SCANNER usa FiMaximize como aproximación visual (no hay ícono de scanner en fi).
 *  - VISOR usa FiTarget para representar un display de cliente orientado al punto de venta.
 */
export const TIPO_META: Record<TipoDispositivo, { label: string; color: string; Icon: React.ElementType }> = {
    IMPRESORA: { label: "Impresora", color: "#3b82f6", Icon: FiPrinter    }, // Azul  → periférico de salida
    DATAFONO:  { label: "Datáfono",  color: "#8b5cf6", Icon: FiCreditCard }, // Violeta → pago
    KIOSKO:    { label: "Kiosko",    color: "#f97316", Icon: FiMonitor    }, // Naranja → autoservicio
    MONITOR:   { label: "Monitor",   color: "#06b6d4", Icon: FiCpu        }, // Cyan  → pantalla de operador
    SCANNER:   { label: "Scanner",   color: "#10b981", Icon: FiMaximize   }, // Verde → lectura de códigos
    BASCULA:   { label: "Báscula",   color: "#f59e0b", Icon: FiBox        }, // Ámbar → pesaje
    VISOR:     { label: "Visor",     color: "#ec4899", Icon: FiTarget     }, // Rosa  → display de cliente
};

// ── Metadatos Visuales por Estado de Conexión ─────────────────────────────

/**
 * ESTADO_META: configuración visual para cada estado de conectividad.
 *
 * Campos:
 *  - icon  → componente de react-icons para el indicador de estado
 *  - color → color del texto/ícono del badge
 *  - bg    → color de fondo del badge (mismo tono con baja opacidad)
 *
 * Uso típico:
 *  const meta = ESTADO_META[dispositivo.estado];
 *  return (
 *    <Badge style={{ color: meta.color, background: meta.bg }}>
 *      <meta.icon /> {dispositivo.estado}
 *    </Badge>
 *  );
 *
 * Nota: DESCONOCIDO usa FiWifi (igual que ONLINE) pero con color ámbar
 * para indicar "estado pendiente de verificación" sin alarmar al usuario.
 * FiWifiOff se reserva exclusivamente para OFFLINE confirmado.
 */
export const ESTADO_META: Record<EstadoConexion, { icon: React.ElementType; color: string; bg: string }> = {
    ONLINE:      { icon: FiWifi,    color: "#10b981", bg: "rgba(16,185,129,0.1)"  }, // Verde  → conectado
    OFFLINE:     { icon: FiWifiOff, color: "#ef4444", bg: "rgba(239,68,68,0.1)"  }, // Rojo   → sin conexión
    DESCONOCIDO: { icon: FiWifi,    color: "#f59e0b", bg: "rgba(245,158,11,0.1)" }, // Ámbar  → sin verificar
};

/*
 * TODO: Consolidar tipos duplicados
 * TipoDispositivo, EstadoConexion y Dispositivo están definidos tanto aquí
 * como en useDispositivos.ts. Para eliminar la duplicación, useDispositivos.ts
 * debería importarlos desde este archivo:
 *
 *   import { type TipoDispositivo, type EstadoConexion, type Dispositivo } from "../constants/dispositivos";
 *
 * Esto garantiza una única fuente de verdad y evita que los tipos diverjan
 * si se agrega un nuevo valor al union en el futuro.
 */