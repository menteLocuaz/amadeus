import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiPlus, FiSettings, FiCreditCard, FiPercent, FiTrash2, FiActivity } from "react-icons/fi";
import { FacturaService } from "../services/FacturaService";
import { Impuesto, FormaPago } from "../types";
import { 
  PageContainer, Card, Table, Badge, Button, Grid, Divider 
} from "../../../shared/components/UI";
import { ClimbingBoxLoader } from "react-spinners";
import { extractData } from "../../proveedor/hooks/useProveedoresQuery";

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  h2 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  svg { color: ${({ theme }) => theme.primary}; }
`;

const ConfiguracionPage: React.FC = () => {
  const [impuestos, setImpuestos] = useState<Impuesto[]>([]);
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [iRes, fRes] = await Promise.all([
          FacturaService.getImpuestos(),
          FacturaService.getFormasPago()
        ]);
        setImpuestos(extractData(iRes));
        setFormasPago(extractData(fRes));
      } catch (error) {
        console.error("Error fetching config", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <PageContainer style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <ClimbingBoxLoader color="#FCA311" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Configuración de Facturación</h1>
        <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Parámetros fiscales, impuestos y métodos de recaudo.</p>
      </header>

      <ConfigGrid>
        {/* IMPUESTOS */}
        <section>
          <SectionHeader>
            <h2><FiPercent /> Impuestos</h2>
            <Button $radius="8px"><FiPlus /> Nuevo</Button>
          </SectionHeader>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th style={{ textAlign: 'center' }}>Valor (%)</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {impuestos.map(i => (
                  <tr key={i.id_impuesto}>
                    <td style={{ fontWeight: 700 }}>{i.nombre}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                      {(i.valor * 100).toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge $color="#10B981">Activo</Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button $variant="ghost" style={{ color: '#EF4444' }}><FiTrash2 /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </section>

        {/* FORMAS DE PAGO */}
        <section>
          <SectionHeader>
            <h2><FiCreditCard /> Formas de Pago</h2>
            <Button $radius="8px"><FiPlus /> Nueva</Button>
          </SectionHeader>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th style={{ textAlign: 'center' }}>Tipo</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {formasPago.map(fp => (
                  <tr key={fp.id_forma_pago}>
                    <td style={{ fontWeight: 700 }}>{fp.nombre}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge $variant="outline" $color="#3B82F6">{fp.tipo}</Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge $color="#10B981">Habilitado</Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button $variant="ghost" style={{ color: '#EF4444' }}><FiTrash2 /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </section>
      </ConfigGrid>

      <Divider style={{ margin: '48px 0' }} />

      {/* PARAMETROS FISCALES */}
      <section>
        <SectionHeader>
          <h2><FiActivity /> Parámetros Operativos</h2>
        </SectionHeader>
        <Card style={{ padding: 32 }}>
          <Grid $cols="repeat(auto-fit, minmax(250px, 1fr))" $gap="24px">
            <FormGroup>
              <label>Correlativo Siguiente</label>
              <input type="text" defaultValue="FAC-0001" />
            </label>
            <FormGroup>
              <label>Prefijo de Factura</label>
              <input type="text" defaultValue="FAC" />
            </label>
            <FormGroup>
              <label>Resolución Fiscal</label>
              <input type="text" placeholder="Número de resolución..." />
            </label>
          </Grid>
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
            <Button $variant="primary" style={{ padding: '12px 48px' }}>Guardar Cambios</Button>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
};

export default ConfiguracionPage;
