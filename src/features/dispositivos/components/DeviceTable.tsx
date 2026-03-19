import React from "react";
import styled from "styled-components";
import { BeatLoader } from "react-spinners";
import { FiCpu, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { 
    TableCard, Table, ActionBtn, Badge 
} from "../../../shared/components/UI";
import { TIPO_META, ESTADO_META, type Dispositivo, type TipoDispositivo } from "../constants/dispositivos";

const TypeDot = styled.span<{ $color: string }>`
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.82rem; font-weight: 700;
    color: ${({ $color }) => $color};
    background: ${({ $color }) => $color}15;
    padding: 3px 10px; border-radius: 20px;
`;

const StatusPill = styled.span<{ $bg: string; $color: string }>`
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.78rem; font-weight: 700;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
    padding: 4px 10px; border-radius: 20px;
`;

const IPChip = styled.code`
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    background: ${({ theme }) => theme.bg2};
    padding: 4px 10px; border-radius: 8px;
    color: ${({ theme }) => theme.text};
    opacity: 0.8;
`;

const EmptyState = styled.div`
    text-align: center; padding: 60px 20px; opacity: 0.45;
    svg { font-size: 3rem; margin-bottom: 12px; }
    p { font-size: 1rem; }
`;

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

interface DeviceTableProps {
    dispositivos: Dispositivo[];
    isPinging: string | null;
    isDeletingId: string | null;
    onPing: (id: string) => void;
    onEdit: (device: Dispositivo) => void;
    onDelete: (id: string) => void;
}

const DeviceTable: React.FC<DeviceTableProps> = ({
    dispositivos,
    isPinging,
    isDeletingId,
    onPing,
    onEdit,
    onDelete
}) => {
    return (
        <TableCard>
            <Table>
                <thead>
                    <tr>
                        <th>Dispositivo</th>
                        <th>Tipo</th>
                        <th>Dirección IP</th>
                        <th>Estado Red</th>
                        <th>Activo</th>
                        <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {dispositivos.length === 0 ? (
                        <tr>
                            <td colSpan={6}>
                                <EmptyState>
                                    <FiCpu />
                                    <p>No se encontraron dispositivos</p>
                                </EmptyState>
                            </td>
                        </tr>
                    ) : dispositivos.map(d => {
                        const tm = TIPO_META[d.tipo as TipoDispositivo];
                        const sm = ESTADO_META[d.estado];
                        return (
                            <tr key={d.id_dispositivo}>
                                <td>
                                    <div style={{ fontWeight: 700 }}>{d.nombre}</div>
                                    <div style={{ fontSize: "0.73rem", opacity: 0.5 }}>{d.id_dispositivo.slice(0, 8)}…</div>
                                </td>
                                <td>
                                    <TypeDot $color={tm.color}>
                                        <tm.Icon /> {tm.label}
                                    </TypeDot>
                                </td>
                                <td><IPChip>{d.ip}</IPChip></td>
                                <td>
                                    <StatusPill $bg={sm.bg} $color={sm.color}>
                                        <sm.icon size={11} /> {d.estado}
                                    </StatusPill>
                                </td>
                                <td>
                                    <Badge style={{
                                        background: !d.deleted_at ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                        color: !d.deleted_at ? "#10b981" : "#ef4444"
                                    }}>
                                        {!d.deleted_at ? "Activo" : "Eliminado"}
                                    </Badge>
                                </td>
                                <td style={{ textAlign: "right" }}>
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
                                    <ActionBtn
                                        $variant="edit"
                                        onClick={() => onEdit(d)}
                                        disabled={!!isDeletingId}
                                        title="Editar"
                                    >
                                        <FiEdit2 />
                                    </ActionBtn>
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
