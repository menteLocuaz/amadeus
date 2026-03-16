import { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth/store/useAuthStore";

export function Home() {
  const { user, isLoading, error, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      fetchMe().catch(() => {
        navigate("/");
      });
    }
  }, [user, fetchMe, navigate]);

  useEffect(() => {
    if (!isLoading && error && !user) {
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, user, navigate]);

  if (isLoading) return <Loading>Cargando perfil de usuario...</Loading>;

  return (
    <Container>
      <HeaderSection>
        <h1>Panel de Control PRUNUS</h1>
        {user ? (
          <WelcomeMessage>
            Bienvenido, <strong>{user.usu_nombre}</strong>. 
            Estás conectado como <span>{user.rol.nombre_rol}</span> en <span>{user.sucursal.nombre_sucursal}</span>.
          </WelcomeMessage>
        ) : (
          <WelcomeMessage>Bienvenido al sistema.</WelcomeMessage>
        )}
      </HeaderSection>

      {error && <ErrorMessage>No se pudo sincronizar el perfil: {error}</ErrorMessage>}

      <DashboardStats>
        <StatCard>
          <div className="icon">👤</div>
          <div className="label">Tu Email</div>
          {/* truncamos y mostramos el valor completo en title */}
          <div
            className="value truncate"
            title={user?.email ?? "---"}
          >
            {user?.email || "---"}
          </div>
        </StatCard>
        
        <StatCard>
          <div className="icon">🏢</div>
          <div className="label">Sucursal</div>
          {/* también truncamos la sucursal (si prefieres wrap, usa className="value wrap") */}
          <div
            className="value truncate"
            title={user?.sucursal?.nombre_sucursal ?? "---"}
          >
            {user?.sucursal?.nombre_sucursal || "---"}
          </div>
        </StatCard>
        
        <StatCard>
          <div className="icon">🛡️</div>
          <div className="label">Rol de Acceso</div>
          <div className="value truncate" title={user?.rol?.nombre_rol ?? "---"}>
            {user?.rol?.nombre_rol || "---"}
          </div>
        </StatCard>
      </DashboardStats>
    </Container>
  );
}

/* ---------- estilos ---------- */

const Container = styled.div`
  padding: 40px;
`;

const HeaderSection = styled.div`
  margin-bottom: 40px;
  h1 { font-size: 2.5rem; color: ${({ theme }) => theme.bg4}; margin-bottom: 10px; }
`;

const WelcomeMessage = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
  strong { color: ${({ theme }) => theme.bg4}; }
  span { font-weight: 700; color: ${({ theme }) => theme.textsecondary}; }
`;

const DashboardStats = styled.div`
  display: grid;
  /* ajustar el minmax para evitar columnas demasiado estrechas que provoquen overflow */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 25px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 120px;

  .icon { font-size: 2rem; }
  .label { font-size: 0.9rem; color: ${({ theme }) => theme.textsecondary}; text-transform: uppercase; }

  /* valor principal con manejo de overflow */
  .value {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
    /* por defecto truncamos si es muy largo */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    display: block;
  }

  /* variante para permitir wrapping (si la quieres usar, aplica className="value wrap") */
  .value.wrap {
    white-space: normal;
    overflow: visible;
    word-break: break-word;
  }

  /* responsive: en pantallas muy pequeñas permitimos wrap para evitar truncado excesivo */
  @media (max-width: 420px) {
    .value {
      white-space: normal;
      word-break: break-word;
    }
  }
`;

const Loading = styled.div`
  padding: 40px;
  text-align: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.bg4};
`;

const ErrorMessage = styled(Loading)`
  color: #ff4d4d;
`;