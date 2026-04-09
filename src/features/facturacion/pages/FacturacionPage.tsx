import React, { useState } from "react";
import styled from "styled-components";
import { 
  FiFileText, FiUser, FiPackage, FiCreditCard, FiTrash2, FiPlus, FiPrinter, FiSearch 
} from "react-icons/fi";
import { useFacturacion } from "../hooks/useFacturacion";
import { 
  PageContainer, Card, Button, Table, Badge, FormGroup, Divider, SearchBox 
} from "../../../shared/components/UI";
import { ClimbingBoxLoader } from "react-spinners";

const Workbench = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  h3 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
  }
  svg {
    color: ${({ theme }) => theme.primary};
  }
`;

const ItemTable = styled(Table)`
  th {
    background: transparent;
    border-top: 1px solid ${({ theme }) => theme.bg3}15;
  }
  td {
    font-family: 'Inter', sans-serif;
  }
  .mono {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }
`;

const TicketPreview = styled(Card)`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}22;
  position: sticky;
  top: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  
  .ticket-header {
    text-align: center;
    .brand { font-weight: 900; letter-spacing: 2px; font-size: 0.8rem; }
    .title { font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 800; margin-top: 8px; }
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    .label { font-size: 0.85rem; color: ${({ theme }) => theme.texttertiary}; font-weight: 600; text-transform: uppercase; }
    .value { font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    &.total {
      margin-top: 12px;
      .label { color: ${({ theme }) => theme.text}; font-size: 1rem; }
      .value { color: ${({ theme }) => theme.primary}; font-size: 1.75rem; font-weight: 800; }
    }
  }
`;

const PaymentSection = styled.div`
  background: ${({ theme }) => theme.bg2}33;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FacturacionPage: React.FC = () => {
  const f = useFacturacion();
  const [payAmount, setPayAmount] = useState<number>(0);
  const [selectedPayMethod, setSelectedPayMethod] = useState("");

  if (f.loading && f.productos.length === 0) {
    return (
      <PageContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <ClimbingBoxLoader color="#FCA311" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Facturación</h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Generación de documentos fiscales y gestión de ventas.</p>
      </header>

      <Workbench>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* CLIENTE */}
          <Card style={{ padding: 32 }}>
            <SectionHeader>
              <FiUser />
              <h3>Información del Cliente</h3>
            </SectionHeader>
            <FormGroup style={{ maxWidth: 500 }}>
              <label>Seleccionar Cliente</label>
              <select 
                value={f.selectedCliente} 
                onChange={e => f.setSelectedCliente(e.target.value)}
              >
                <option value="">Consumidor Final / Seleccionar...</option>
                {f.clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} ({c.ruc})</option>
                ))}
              </select>
            </FormGroup>
          </Card>

          {/* ITEMS */}
          <Card style={{ padding: 32 }}>
            <SectionHeader>
              <FiPackage />
              <h3>Detalle de Venta</h3>
            </SectionHeader>
            
            <div style={{ marginBottom: 24 }}>
              <SearchBox style={{ maxWidth: '100%' }}>
                <FiSearch />
                <input 
                  placeholder="Buscar producto por nombre o código..." 
                  onChange={(e) => {
                    // Quick add logic or dropdown could go here
                  }}
                />
              </SearchBox>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {f.productos.slice(0, 8).map(p => (
                  <Button 
                    key={p.id_producto} 
                    $variant="secondary" 
                    $radius="100px"
                    onClick={() => f.addToCart(p)}
                    style={{ fontSize: '0.75rem', padding: '6px 16px' }}
                  >
                    <FiPlus /> {p.nombre}
                  </Button>
                ))}
              </div>
            </div>

            <ItemTable>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Precio</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {f.cart.map(item => (
                  <tr key={item.id_producto}>
                    <td style={{ fontWeight: 600 }}>{item.nombre_producto}</td>
                    <td style={{ textAlign: 'center' }} className="mono">{item.cantidad}</td>
                    <td style={{ textAlign: 'right' }} className="mono">${item.precio.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }} className="mono">${item.subtotal.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Button 
                        $variant="ghost" 
                        onClick={() => f.removeFromCart(item.id_producto)}
                        style={{ color: '#EF4444' }}
                      >
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
                {f.cart.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
                      No hay productos agregados.
                    </td>
                  </tr>
                )}
              </tbody>
            </ItemTable>
          </Card>

          {/* OBSERVACIONES */}
          <Card style={{ padding: 32 }}>
            <SectionHeader>
              <FiFileText />
              <h3>Notas y Observaciones</h3>
            </SectionHeader>
            <textarea 
              style={{ width: '100%', minHeight: 100, padding: 16, borderRadius: 12, border: '1px solid #ddd', outline: 'none' }}
              placeholder="Escriba aquí notas adicionales para la factura..."
              value={f.observacion}
              onChange={e => f.setObservacion(e.target.value)}
            />
          </Card>
        </div>

        <aside>
          <TicketPreview>
            <div className="ticket-header">
              <div className="brand" style={{ color: f.activeTax ? '#FCA311' : 'inherit' }}>GROOT TYPE ECOSYSTEM</div>
              <div className="title">Resumen Fiscal</div>
            </div>

            <Divider />

            <div className="summary-details">
              <div className="summary-row">
                <span className="label">Subtotal</span>
                <span className="value">${f.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="label">{f.activeTax?.nombre || 'Impuestos'}</span>
                <span className="value">${f.taxValue.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span className="label">Total a Pagar</span>
                <span className="value">${f.total.toFixed(2)}</span>
              </div>
            </div>

            <PaymentSection>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 700 }}>
                <FiCreditCard /> FORMAS DE PAGO
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <select 
                  style={{ flex: 1 }} 
                  value={selectedPayMethod} 
                  onChange={e => setSelectedPayMethod(e.target.value)}
                >
                  <option value="">Metodo...</option>
                  {f.formasPago.map(fp => (
                    <option key={fp.id_forma_pago} value={fp.id_forma_pago}>{fp.nombre}</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  style={{ width: 100 }} 
                  placeholder="Monto"
                  value={payAmount || ""}
                  onChange={e => setPayAmount(Number(e.target.value))}
                />
                <Button 
                  onClick={() => {
                    f.addPayment(selectedPayMethod, payAmount);
                    setPayAmount(0);
                  }}
                  disabled={!selectedPayMethod || payAmount <= 0}
                >
                  <FiPlus />
                </Button>
              </div>

              {f.payments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {f.payments.map((p, idx) => (
                    <div key={idx} className="summary-row" style={{ background: '#fff', padding: '8px 12px', borderRadius: 8 }}>
                      <span className="label" style={{ fontSize: '0.7rem' }}>
                        {f.formasPago.find(fp => fp.id_forma_pago === p.id_forma_pago)?.nombre}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="value" style={{ color: '#10B981' }}>${p.valor_billete.toFixed(2)}</span>
                        <FiTrash2 
                          size={14} 
                          style={{ cursor: 'pointer', color: '#EF4444' }} 
                          onClick={() => f.removePayment(idx)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="summary-row" style={{ marginTop: 8 }}>
                <span className="label">Cubierto</span>
                <span className="value" style={{ color: f.pendingAmount <= 0 ? '#10B981' : 'inherit' }}>
                  ${f.totalPaid.toFixed(2)}
                </span>
              </div>
              {f.pendingAmount > 0 && (
                <div className="summary-row">
                  <span className="label">Pendiente</span>
                  <span className="value" style={{ color: '#EF4444' }}>${f.pendingAmount.toFixed(2)}</span>
                </div>
              )}
            </PaymentSection>

            <Button 
              $variant="primary" 
              style={{ height: 60, fontSize: '1.1rem' }}
              disabled={f.loading || f.pendingAmount > 0.01 || f.cart.length === 0}
              onClick={f.handleCreateInvoice}
            >
              {f.loading ? 'Procesando...' : <><FiPrinter /> Emitir Factura</>}
            </Button>
          </TicketPreview>
        </aside>
      </Workbench>
    </PageContainer>
  );
};

export default FacturacionPage;
