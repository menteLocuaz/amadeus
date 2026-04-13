/**
 * DeviceTable.tsx
 * Tabla de dispositivos POS con resolución de relaciones y acciones por fila.
 *
 * Responsabilidad: renderizar la lista de dispositivos con sus datos resueltos
 * (tipo → label/color/ícono, estado → badge visual, estación → nombre,
 * estación → sucursal) y exponer las acciones de ping, edición y eliminación.
 *
 * Resolución de relaciones (sin peticiones adicionales al backend):
 *   dispositivo.id_estacion → estacionMap → { nombre, id_sucursal }
 *                                         → sucursalMap → nombre de sucursal
 *
 * Estados de carga por fila (no globales):
 *   isPinging    === d.id_dispositivo → loader en botón Ping de esa fila
 *   isDeletingId === d.id_dispositivo → loader en botón Eliminar de esa fila
 * Esto permite que las demás filas permanezcan interactivas durante la operación.
 */

import React from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiCpu, FiEdit2, FiTrash2, FiRefreshCw, FiMonitor, FiMapPin } from "react-icons/fi";
import { TableCard, Table, ActionBtn, Badge } from "../../../shared/components/UI";
import { TIPO_META, ESTADO_META, type Dispositivo, type TipoDispositivo } from "../constants/dispositivos";

// ── Styled Components ──────────────────────────────────────────────────────

/**
 * Badge de tipo de dispositivo con color de acento dinámico.
 * Usa la prop transitoria `$color` (prefijo $) para evitar que
 * styled-components reenvíe el atributo al DOM y genere warnings.
 * El fondo usa el mismo color con opacidad 15 (hex) ≈ 8%.
 */
const TypeDot = styled.span<{ $color: string }>`
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.82rem; font-weight: 700;
    color: ${({ $color }) => $color};
    background: ${({ $color }) => $color}15;
    padding: 3px 10px; border-radius: 20px;
`;

/**
 * Badge de estado de conexión (ONLINE / OFFLINE / DESCONOCIDO).
 * Recibe `$bg` y `$color` por separado porque el fondo ya viene
 * pre-calculado con opacidad desde ESTADO_META (ej: rgba(16,185,129,0.1)).
 */
const StatusPill = styled.span<{ $bg: string; $color: string }>`
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.78rem; font-weight: 700;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
    padding: 4px 10px; border-radius: 20px;
`;

/**
 * Chip de dirección IP con fuente monoespaciada.
 * Usa `<code>` semánticamente para indicar que es un valor técnico.
 * El fondo usa theme.bg2 para integrarse con el tema oscuro/claro.
 */
const IPChip = styled.code`
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    background: ${({ theme }) => theme.bg2};
    padding: 4px 10px; border-radius: 8px;
    color: ${({ theme }) => theme.text};
    opacity: 0.8;
`;

/** Estado vacío cuando no hay dispositivos que coincidan con el filtro activo. */
const EmptyState = styled.div`
    text-align: center; padding: 60px 20px; opacity: 0.45;
    svg { font-size: 3rem; margin-bottom: 12px; }
    p { font-size: 1rem; }
`;

/**
 * Botón de ping con estilo secundario (outline).
 * Diferenciado de ActionBtn (ícono cuadrado) porque incluye texto ("Ping")
 * y tiene un comportamiento visual distinto al hover.
 * Deshabilitado durante cualquier eliminación en curso (!!isDeletingId)
 * para evitar operaciones concurrentes sobre la misma fila.
 */
const PingBtn = styled.button`
    background: transparent;
    border: 1px solid ${({ theme }) => theme.bg3}55;
    color: ${({ theme }) => theme.text};
    padding: 6px 12px; border-radius: 8px; cursor: pointer;
    font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s;
    &:hover { background: ${({ theme }) => theme.bg2}; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ── Props ──────────────────────────────────────────────────────────────────

interface DeviceTableProps {
    /** Lista de dispositivos ya filtrada (por búsqueda y tipo). */
    dispositivos: Dispositivo[];

    /**
     * ID del dispositivo cuyo ping está en curso.
     * null si ningún ping está activo.
     * Usado para mostrar BeatLoader en el botón Ping de la fila correspondiente.
     */
    isPinging: string | null;

    /**
     * ID del dispositivo siendo eliminado.
     * null si ninguna eliminación está activa.
     * Usado para mostrar BeatLoader en el botón Eliminar y deshabilitar
     * todas las acciones de la tabla mientras la operación está en curso.
     */
    isDeletingId: string | null;

    onPing:   (id: string) => void;
    onEdit:   (device: Dispositivo) => void;
    onDelete: (id: string) => void;

    /**
     * Mapa id_sucursal → nombre para resolución sin petición adicional.
     * Construido en useDispositivos a partir del catálogo global de sucursales.
     */
    sucursalMap: Record<string, string>;

    /**
     * Mapa id_estacion → { nombre, id_sucursal } para resolución en dos pasos:
     *   1. dispositivo.id_estacion → estacionMap → { nombre, id_sucursal }
     *   2. id_sucursal → sucursalMap → nombre de sucursal
     */
    estacionMap: Record<string, { nombre: string; id_sucursal: string }>;
}

// ── Componente ─────────────────────────────────────────────────────────────

const DeviceTable: React.FC<DeviceTableProps> = ({
    dispositivos,
    isPinging,
    isDeletingId,
    onPing,
    onEdit,
    onDelete,
    sucursalMap,
    estacionMap,
}) => {
    return (
        <TableCard>
            <Table>
                <thead>
                    <tr>
                        <th>Dispositivo</th>
                        <th>Tipo</th>
                        <th>Sucursal</th>
                        <th>Estación POS</th>
                        <th>Dirección IP</th>
                        <th>Estado Red</th>
                        <th>Activo</th>
                        <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {dispositivos.length === 0 ? (
                        // Estado vacío: cubre toda la fila con colspan=8
                        <tr>
                            <td colSpan={8}>
                                <EmptyState>
                                    <FiCpu />
                                    <p>No se encontraron dispositivos</p>
                                </EmptyState>
                            </td>
                        </tr>
                    ) : dispositivos.map(d => {

                        // Resolución de metadatos visuales desde las constantes
                        const tm = TIPO_META[d.tipo_dispositivo as TipoDispositivo]; // tipo_dispositivo → label, color, Icon
                        const sm = ESTADO_META[d.estado];                // estado → icon, color, bg

                        // Resolución de relaciones en dos pasos (sin petición al backend)
                        const estData     = estacionMap[d.id_estacion];                          // Step 1: estación
                        const sucursalName = estData ? sucursalMap[estData.id_sucursal] : "N/A"; // Step 2: sucursal

                        return (
                            <tr key={d.id_dispositivo}>

                                {/* ── Nombre + ID truncado ── */}
                                <td>
                                    <div style={{ fontWeight: 700 }}>{d.nombre}</div>
                                    {/* Muestra solo los primeros 8 caracteres del UUID para identificación rápida */}
                                    <div style={{ fontSize: "0.73rem", opacity: 0.5 }}>
                                        {d.id_dispositivo.slice(0, 8)}…
                                    </div>
                                </td>

                                {/* ── Tipo con ícono y color de acento ── */}
                                <td>
                                    <TypeDot $color={tm.color}>
                                        <tm.Icon /> {tm.label}
                                    </TypeDot>
                                </td>

                                {/* ── Sucursal (resuelta desde estacionMap → sucursalMap) ── */}
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <FiMapPin size={12} opacity={0.5} />
                                        {sucursalName || "N/A"}
                                    </div>
                                </td>

                                {/* ── Estación POS vinculada ── */}
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <FiMonitor size={12} opacity={0.5} />
                                        {estData?.nombre || "Sin Estación"}
                                    </div>
                                </td>

                                {/* ── Dirección IP en fuente monoespaciada ── */}
                                <td><IPChip>{d.ip ?? (d.configuracion?.ip as string) ?? "—"}</IPChip></td>

                                {/* ── Estado de conexión (ONLINE / OFFLINE / DESCONOCIDO) ── */}
                                <td>
                                    <StatusPill $bg={sm.bg} $color={sm.color}>
                                        <sm.icon size={11} /> {d.estado}
                                    </StatusPill>
                                </td>

                                {/* ── Soft Delete: activo si deleted_at es null/undefined ── */}
                                <td>
                                    <Badge style={{
                                        background: !d.deleted_at ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                        color:      !d.deleted_at ? "#10b981"               : "#ef4444",
                                    }}>
                                        {!d.deleted_at ? "Activo" : "Eliminado"}
                                    </Badge>
                                </td>

                                {/* ── Acciones: Ping / Editar / Eliminar ── */}
                                <td style={{ textAlign: "right" }}>

                                    {/*
                                     * Botón Ping:
                                     *  - Deshabilitado si este dispositivo está siendo pinguado (isPinging === id)
                                     *  - Deshabilitado si cualquier dispositivo está siendo eliminado (!!isDeletingId)
                                     *    para evitar operaciones concurrentes que puedan afectar el estado local.
                                     */}
                                    <PingBtn
                                        onClick={() => onPing(d.id_dispositivo)}
                                        disabled={isPinging === d.id_dispositivo || !!isDeletingId}
                                        title="Verificar conectividad"
                                    >
                                        {isPinging === d.id_dispositivo
                                            ? <BeatLoader size={5} color="#FCA311" />
                                            : <><FiRefreshCw size={12} /> Ping</>
                                        }
                                    </PingBtn>
                                    {" "}

                                    {/* Editar: deshabilitado durante cualquier eliminación en curso */}
                                    <ActionBtn
                                        $variant="edit"
                                        onClick={() => onEdit(d)}
                                        disabled={!!isDeletingId}
                                        title="Editar"
                                    >
                                        <FiEdit2 />
                                    </ActionBtn>

                                    {/*
                                     * Eliminar: muestra BeatLoader solo en la fila siendo eliminada.
                                     * Las demás filas muestran FiTrash2 pero con disabled=true
                                     * (!!isDeletingId es true para cualquier fila mientras hay una eliminación activa).
                                     */}
                                    <ActionBtn
                                        $variant="delete"
                                        onClick={() => onDelete(d.id_dispositivo)}
                                        disabled={!!isDeletingId}
                                        title="Eliminar"
                                    >
                                        {isDeletingId === d.id_dispositivo
                                            ? <BeatLoader size={5} color="#ff4d4d" />
                                            : <FiTrash2 />
                                        }
                                    </ActionBtn>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </TableCard>
    );
};

export default DeviceTable;