import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiSearch, FiEye, FiDownload, FiCalendar, FiClock, FiUser, FiAlertTriangle } from "react-icons/fi";
import { FacturaService } from "../services/FacturaService";
import type { FacturaResponse } from "../types";
import {
  PageContainer, Card, Table, Badge, Button, Toolbar, SearchBox
} from "../../../shared/components/UI";
import { ClimbingBoxLoader } from "react-spinners";
import { formatDate } from "../../../utils/dateUtils";
import { extractData } from "../../proveedor/hooks/useProveedoresQuery";

const LedgerTable = styled(Table)`
  tr {
    cursor: pointer;
    transition: all 0.2s;
    &:hover { background: ${({ theme }) => theme.bg2}15; }
  }
  .invoice-num { font-family: 'JetBrains Mono', monospace; font-weight: 800; color: ${({ theme }) => theme.primary}; }
  .total-cell { font-family: 'JetBrains Mono', monospace; font-weight: 800; text-align: right; font-size: 1.1rem; }
`;

const HistorialPage: React.FC = () => {
  const [invoices, setInvoices] = useState<FacturaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const data = await FacturaService.getFacturas();
        setInvoices(extractData(data));
        setError(null);
      } catch (err: any) {
        const status = err?.response?.status;
        setError(status === 500
          ? "Error interno del servidor (500). Revisa los logs del backend."
          : (err?.message ?? "Error al cargar facturas.")
        );
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filtered = Array.isArray(invoices) ? invoices.filter(inv => {
    const q = query.toLowerCase();
    return (inv.fac_numero ?? '').toLowerCase().includes(q)
        || (inv.cliente?.nombre ?? '').toLowerCase().includes(q);
  }) : [];

  return (
    <PageContainer>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Historial de Ventas</h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Auditoría y consulta de facturas emitidas.</p>
      </header>

      <Toolbar style={{ marginBottom: 24 }}>
        <SearchBox style={{ maxWidth: 400 }}>
          <FiSearch />
          <input 
            placeholder="Buscar por Nº Factura o Cliente..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </SearchBox>
        <div style={{ flex: 1 }} />
        <Button $variant="secondary">
          <FiCalendar /> Filtrar por Fecha
        </Button>
      </Toolbar>

      <Card style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 100, display: 'flex', justifyContent: 'center' }}>
            <ClimbingBoxLoader color="#FCA311" />
          </div>
        ) : error ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#EF4444', opacity: 0.8 }}>
            <FiAlertTriangle size={32} style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        ) : (
          <LedgerTable>
            <thead>
              <tr>
                <th>Nº Factura</th>
                <th>Fecha & Hora</th>
                <th>Cliente</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id_factura}>
                  <td className="invoice-num">{inv.fac_numero}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatDate(inv.fecha_operacion)}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                        <FiClock size={10} /> {new Date(inv.fecha_operacion).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiUser size={14} style={{ opacity: 0.4 }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{inv.cliente?.nombre || 'Consumidor Final'}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{inv.cliente?.ruc || '---'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Badge $color={inv.id_status === 'ANULADA' ? '#EF4444' : '#10B981'}>
                      {inv.id_status || 'PAGADA'}
                    </Badge>
                  </td>
                  <td className="total-cell">${inv.total.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <Button $variant="ghost" title="Ver Detalle" style={{ padding: 8 }}>
                        <FiEye />
                      </Button>
                      <Button $variant="ghost" title="Descargar PDF" style={{ padding: 8 }}>
                        <FiDownload />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 60, opacity: 0.5 }}>
                    No se encontraron registros en el historial.
                  </td>
                </tr>
              )}
            </tbody>
          </LedgerTable>
        )}
      </Card>
    </PageContainer>
  );
};

export default HistorialPage;
