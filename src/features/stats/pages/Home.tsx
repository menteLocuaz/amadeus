import { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useDashboard } from "../hooks/useDashboard";
import { KpiCard } from "../components/KpiCards";
import { 
  FiPackage, FiAlertTriangle, FiClock, FiActivity 
} from "react-icons/fi";

import {
  PageContainer,
  TableCard
} from "../../../shared/components/UI";

/**
 * Home Dashboard Component
 * Uses Recharts for high-quality data visualization.
 */
export default function Home() {
  const { user, isLoading: isAuthLoading, fetchMe } = useAuthStore();
  const { resumen, deuda, composicion, mermas, isLoading: isDashLoading } = useDashboard();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !isAuthLoading) {
      fetchMe().catch(() => navigate("/"));
    }
  }, [user, fetchMe, navigate, isAuthLoading]);

  if (isAuthLoading || isDashLoading) return <Loading>Cargando Dashboard PRUNUS...</Loading>;

  // --- Data Normalization (Safeguards against '.map' errors) ---
  const safeMermas = Array.isArray(mermas?.items) ? mermas.items : [];
  const safeDeuda = Array.isArray(deuda) ? deuda : [];
  const safeComposicion = Array.isArray(composicion) ? composicion : [];
  const safeVentasCompras = Array.isArray(resumen?.ventas_vs_compras) ? resumen.ventas_vs_compras : [];
  const safeTopProducts = Array.isArray(resumen?.top_productos) ? resumen.top_productos : [];

  const COLORS = ["#FCA311", "#14213D", "#E5E5E5", "#6366f1", "#10b981", "#ef4444"];

  return (
    <PageContainer>
      <HeaderSection>
        <div>
          <h1>Panel de Control PRUNUS</h1>
          <WelcomeMessage>
            Bienvenido, <strong>{user?.usu_nombre}</strong>. 
            Gestionando sucursal <span>{user?.sucursal?.nombre_sucursal || "Central"}</span>.
          </WelcomeMessage>
        </div>
        <LastSync>Actualizado hace un momento</LastSync>
      </HeaderSection>

      {/* KPIs Críticos */}
      <DashboardStats>
        <KpiCard 
          label="Valor Inventario" 
          value={`$${resumen?.valor_inventario_total?.toLocaleString() || "0"}`} 
          icon={<FiPackage />} 
          color="#FCA311"
        />
        <KpiCard 
          label="Punto de Equilibrio" 
          value={`$${resumen?.punto_equilibrio?.toLocaleString() || "0"}`} 
          icon={<FiActivity />} 
          color="#6366f1"
        />
        <KpiCard 
          label="Productos Bajo Stock" 
          value={resumen?.productos_bajo_stock || 0} 
          icon={<FiAlertTriangle />} 
          color="#ef4444"
        />
        <KpiCard 
          label="Ciclo de Efectivo" 
          value={`${resumen?.ciclo_conversion_efectivo || 0} Días`} 
          icon={<FiClock />} 
          color="#10b981"
        />
      </DashboardStats>

      <ChartsGrid>
        {/* Gráfico 1: Ventas vs Compras (LineChart) */}
        <ChartCard>
          <h3>Ventas vs Compras Mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={safeVentasCompras}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="ventas" stroke="#FCA311" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Ventas" />
              <Line type="monotone" dataKey="compras" stroke="#14213D" strokeWidth={3} dot={{r: 4}} name="Compras" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfico 2: Composición por Categoría (PieChart) */}
        <ChartCard>
          <h3>Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={safeComposicion}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="valor"
                nameKey="categoria"
              >
                {safeComposicion.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfico 3: Antigüedad de Deuda (BarChart) */}
        <ChartCard>
          <h3>Antigüedad de Cuentas por Cobrar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={safeDeuda} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" hide />
              <YAxis dataKey="rango" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
              <Bar dataKey="monto" fill="#FCA311" radius={[0, 4, 4, 0]} barSize={20} name="Monto Deuda" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfico 4: Rentabilidad (BarChart) */}
        <ChartCard>
          <h3>Top Productos Más Rentables</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={safeTopProducts}>
              <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <YAxis axisLine={false} tickLine={false} hide />
              <Tooltip />
              <Bar dataKey="rentabilidad" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} name="Rentabilidad" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>

      {/* Sección Inferior: Mermas */}
      <BottomSection>
        <SectionTitleRow>
          <SectionTitle>Mermas y Caducidad Reciente</SectionTitle>
          <TotalMermas>
            Total: <strong>-${mermas.total_mermas.toLocaleString()}</strong> {mermas.moneda}
          </TotalMermas>
        </SectionTitleRow>
        <MermasTable>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Código</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th>Fecha</th>
              <th>Pérdida</th>
            </tr>
          </thead>
          <tbody>
            {safeMermas.map((m, i) => (
              <tr key={i}>
                <td>{m.pro_nombre}</td>
                <td style={{ opacity: 0.6, fontSize: "0.85rem" }}>{m.pro_codigo}</td>
                <td>{m.cantidad_merma}</td>
                <td><Badge $type={m.motivo}>{m.motivo}</Badge></td>
                <td style={{ opacity: 0.6, fontSize: "0.85rem" }}>{new Date(m.fecha).toLocaleDateString()}</td>
                <td className="amount">-${m.costo_total.toLocaleString()}</td>
              </tr>
            ))}
            {safeMermas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "40px", opacity: 0.5 }}>
                  No se encontraron mermas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </MermasTable>
      </BottomSection>
    </PageContainer>
  );
}

const Loading = styled.div`
  padding: 100px; text-align: center; font-size: 1.2rem; 
  color: ${({ theme }) => theme.primary}; font-weight: 700;
`;

const HeaderSection = styled.div`
  margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-start;
  h1 { font-size: 2.2rem; font-weight: 800; color: ${({ theme }) => theme.text}; margin: 0; }
`;

const LastSync = styled.span` font-size: 0.85rem; opacity: 0.5; font-weight: 600; `;

const WelcomeMessage = styled.p`
  font-size: 1rem; margin: 8px 0 0 0; color: ${({ theme }) => theme.textsecondary};
  span { font-weight: 700; color: ${({ theme }) => theme.primary}; }
`;

const DashboardStats = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px; margin-bottom: 32px;
`;

const ChartsGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 24px; margin-bottom: 32px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const ChartCard = styled(TableCard)`
  padding: 24px;
  h3 { font-size: 1rem; font-weight: 700; margin-bottom: 20px; opacity: 0.8; }
`;

const BottomSection = styled.div`
  background: ${({ theme }) => theme.bgCard}; padding: 32px;
  border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);
`;

const SectionTitleRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
`;

const SectionTitle = styled.h3` margin: 0; font-size: 1.2rem; font-weight: 700; `;

const TotalMermas = styled.span`
  font-size: 0.95rem; color: ${({ theme }) => theme.textsecondary};
  strong { color: ${({ theme }) => theme.danger}; }
`;

const MermasTable = styled.table`
  width: 100%; border-collapse: collapse;
  th { text-align: left; padding: 12px; border-bottom: 2px solid rgba(0,0,0,0.05); font-size: 0.85rem; opacity: 0.6; }
  td { padding: 16px 12px; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 0.95rem; }
  .amount { font-weight: 700; color: ${({ theme }) => theme.danger}; text-align: right; }
`;

const Badge = styled.span<{ $type: string }>`
  padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;
  background: ${props => props.$type === "Vencimiento" ? "#fef3c7" : "#fee2e2"};
  color: ${props => props.$type === "Vencimiento" ? "#f59e0b" : "#ef4444"};
`;
