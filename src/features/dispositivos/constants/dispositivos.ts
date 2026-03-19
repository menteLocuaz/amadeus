import React from "react";
import { FiPrinter, FiMonitor, FiCreditCard, FiCpu, FiWifi, FiWifiOff } from "react-icons/fi";
import { type DispositivoAPI } from "../services/DispositivoService";

/* ═══════════════════════════════════════════════════════════
   TIPOS
═══════════════════════════════════════════════════════════ */
export type TipoDispositivo = "IMPRESORA" | "DATAFONO" | "KIOSKO" | "MONITOR";
export type EstadoConexion  = "ONLINE" | "OFFLINE" | "DESCONOCIDO";

export type Dispositivo = DispositivoAPI & { estado: EstadoConexion };

/* ═══════════════════════════════════════════════════════════
   CONFIGURACIÓN VISUAL (META)
═══════════════════════════════════════════════════════════ */
export const TIPO_META: Record<TipoDispositivo, { label: string; color: string; Icon: React.ElementType }> = {
    IMPRESORA: { label: "Impresora",  color: "#3b82f6", Icon: FiPrinter    },
    DATAFONO:  { label: "Datáfono",   color: "#8b5cf6", Icon: FiCreditCard },
    KIOSKO:    { label: "Kiosko",     color: "#f97316", Icon: FiMonitor    },
    MONITOR:   { label: "Monitor",    color: "#06b6d4", Icon: FiCpu       },
};

export const ESTADO_META: Record<EstadoConexion, { icon: React.ElementType; color: string; bg: string }> = {
    ONLINE:      { icon: FiWifi,    color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
    OFFLINE:     { icon: FiWifiOff, color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
    DESCONOCIDO: { icon: FiWifi,    color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};
