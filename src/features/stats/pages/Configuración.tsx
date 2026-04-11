import { useMemo, useState } from "react";
import styled from "styled-components";
import type { IconType } from "react-icons";
import {
  FiPrinter,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiTruck,
  FiCreditCard,
  FiMapPin,
  FiTag,
  FiSettings,
  FiSearch,
  FiSliders,
  FiDollarSign,
  FiShoppingBag,
  FiCpu,
  FiActivity,
  FiMonitor,
  FiBookmark,
  FiHome,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../core/constants/routes";

/* -------------------------------- Types --------------------------------- */
type Category = "Ventas" | "Inventario" | "Entidades" | "Sistema";

interface ConfigItem {
  id: string;
  title: string;
  description: string;
  category: Category;
  Icon: IconType;
  path?: string;
  onClick?: () => void;
}

/* ------------------------------ Styled UI ------------------------------- */
const PageContainer = styled.div`
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
`;

const Header = styled.header`
  margin-bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid ${({ theme }) => theme.bg3}33;
  padding-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
`;

const TitleArea = styled.div`
  h2 {
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.text};
    margin: 0 0 8px 0;
  }
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.texttertiary};
    max-width: 500px;
    line-height: 1.5;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.bg4};
    font-size: 1.1rem;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    background: ${({ theme }) => theme.bg2};
    border: 1px solid ${({ theme }) => theme.bg3}66;
    border-radius: 12px;
    color: ${({ theme }) => theme.text};
    font-size: 0.95rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.bg4};
      background: ${({ theme }) => theme.bg};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.bg4}15;
    }

    &::placeholder {
      color: ${({ theme }) => theme.texttertiary}88;
    }
  }
`;

const Section = styled.section`
  margin-bottom: 48px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  h3 {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${({ theme }) => theme.texttertiary};
  }

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.bg3}22;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
`;

const ModuleCard = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${({ theme }) => theme.bg2};
    border-color: ${({ theme }) => theme.bg4}88;
    transform: translateY(-2px);
    
    .arrow-icon {
      transform: translateX(4px);
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ theme }) => theme.bg2};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg3}22;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    margin-bottom: 4px;
  }

  p {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.texttertiary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ArrowIcon = styled(FiChevronRight)`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.bg4};
  opacity: 0.3;
  transition: all 0.2s ease;
  margin-left: 8px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 80px 0;
  text-align: center;
  color: ${({ theme }) => theme.texttertiary};
  
  svg {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.2;
  }
`;

/* ------------------------------- Component ------------------------------- */
export const Configuración: React.FC = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const items: ConfigItem[] = useMemo(
    () => [
      // --- Ventas ---
      { id: "printers", category: "Ventas", title: "Impresoras", description: "Configuración de tickets y comandas", Icon: FiPrinter, onClick: () => alert("Módulo de Impresoras") },
      { id: "payments", category: "Ventas", title: "Métodos de Pago", description: "Cajas y pasarelas de pago", Icon: FiCreditCard, onClick: () => alert("Módulo de Pagos") },
      { id: "dispositivos", category: "Ventas", title: "Dispositivos POS", description: "Datáfonos y periféricos", Icon: FiCpu, path: ROUTES.DISPOSITIVOS },
      { id: "estaciones", category: "Ventas", title: "Estaciones POS", description: "Terminales físicos por sucursal", Icon: FiMonitor, path: ROUTES.ESTACIONES },
      { id: "tickets", category: "Ventas", title: "Diseño Tickets", description: "Personalización de comprobantes", Icon: FiBookmark, onClick: () => alert("Módulo de Tickets") },
      { id: "invoices", category: "Ventas", title: "Facturación", description: "Parámetros de ley y correlativos", Icon: FiSettings, onClick: () => alert("Módulo de Facturación") },

      // --- Inventario ---
      { id: "products", category: "Inventario", title: "Productos", description: "Gestión centralizada de stock", Icon: FiBox, path: ROUTES.PRODUCTOS },
      { id: "categories", category: "Inventario", title: "Categorías", description: "Organización jerárquica", Icon: FiTag, path: ROUTES.CATEGORIAS },
      { id: "catalogo", category: "Inventario", title: "Catálogo General", description: "Vista rápida de precios y stock", Icon: FiShoppingBag, path: ROUTES.INVENTARIO },
      { id: "medidas", category: "Inventario", title: "Unidades", description: "Kilos, metros, unidades y más", Icon: FiSliders, path: ROUTES.MEDIDAS },
      { id: "warehouse", category: "Inventario", title: "Almacenes", description: "Control de bodegas y transferencias", Icon: FiMapPin, onClick: () => alert("Módulo de Almacén") },

      // --- Inventario (compras) ---
      { id: "compras", category: "Inventario", title: "Compras", description: "Órdenes de compra y recepciones", Icon: FiShoppingCart, path: ROUTES.COMPRAS },

      // --- Entidades ---
      { id: "suppliers", category: "Entidades", title: "Proveedores", description: "Directorio y órdenes de compra", Icon: FiTruck, path: ROUTES.PROVEEDORES },
      { id: "clients", category: "Entidades", title: "Clientes", description: "Cartera y fidelización", Icon: FiUsers, path: ROUTES.CLIENTES },
      { id: "branches", category: "Entidades", title: "Sucursales", description: "Puntos de venta operativos", Icon: FiHome, path: ROUTES.SUCURSALES },

      // --- Sistema ---
      { id: "company", category: "Sistema", title: "Mi Empresa", description: "Datos fiscales y comerciales", Icon: FiShoppingCart, path: ROUTES.EMPRESAS },
      { id: "currencies", category: "Sistema", title: "Monedas", description: "Divisas y tipos de cambio", Icon: FiDollarSign, path: ROUTES.MONEDAS },
      { id: "roles", category: "Sistema", title: "Roles y Permisos", description: "Control de acceso de usuarios", Icon: FiUsers, path: ROUTES.ROLES },
      { id: "estatus", category: "Sistema", title: "Estatus", description: "Estados lógicos del sistema", Icon: FiActivity, path: ROUTES.ESTATUS },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const groups: Record<Category, ConfigItem[]> = {
      Ventas: [],
      Inventario: [],
      Entidades: [],
      Sistema: [],
    };
    filtered.forEach((item) => groups[item.category].push(item));
    return groups;
  }, [filtered]);

  const handleAction = (item: ConfigItem) => {
    if (item.path) navigate(item.path);
    else if (item.onClick) item.onClick();
  };

  return (
    <PageContainer>
      <Header>
        <TitleArea>
          <h2>Centro de Control</h2>
          <p>Ajusta el núcleo operativo, gestiona entidades maestras y personaliza la lógica de tu negocio.</p>
        </TitleArea>

        <SearchWrapper>
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por módulo o función..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchWrapper>
      </Header>

      {(Object.entries(grouped) as [Category, ConfigItem[]][]).map(
        ([cat, modules]) =>
          modules.length > 0 && (
            <Section key={cat}>
              <SectionHeader>
                <h3>{cat}</h3>
              </SectionHeader>
              <Grid>
                {modules.map((item) => (
                  <ModuleCard key={item.id} onClick={() => handleAction(item)}>
                    <IconBox>
                      <item.Icon />
                    </IconBox>
                    <Content>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </Content>
                    <ArrowIcon className="arrow-icon" />
                  </ModuleCard>
                ))}
              </Grid>
            </Section>
          )
      )}

      {filtered.length === 0 && (
        <EmptyState>
          <FiSearch />
          <p>No se encontraron módulos para "{query}"</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default Configuración;
