import { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
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
  comingSoon?: boolean;
}

const CATEGORY_ORDER: Category[] = ["Ventas", "Inventario", "Entidades", "Sistema"];

/* ─────────────────────────── Animations ─────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* ─────────────────────────── Page Shell ─────────────────────────────── */
const PageContainer = styled.div`
  padding: 52px 60px;
  max-width: 1480px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;

  /* Subtle dot-grid atmosphere */
  &::before {
    content: "";
    position: fixed;
    inset: 0;
    background-image: radial-gradient(
      ${({ theme }) => theme.bg3}1a 1.5px,
      transparent 1.5px
    );
    background-size: 32px 32px;
    pointer-events: none;
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: 900px) {
    padding: 32px 24px;
  }
`;

/* ─────────────────────────── Header ─────────────────────────────────── */
const Header = styled.header`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 48px;
  margin-bottom: 72px;
  padding-bottom: 36px;
  border-bottom: 1px solid ${({ theme }) => theme.bg3}33;
  animation: ${fadeUp} 0.5s ease both;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 28px;
    margin-bottom: 48px;
  }
`;

const TitleArea = styled.div``;

const Eyebrow = styled.p`
  font-family: "Courier New", "Consolas", monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #fca311;
  margin: 0 0 14px 0;
`;

const MainTitle = styled.h2`
  font-family: "Georgia", "Times New Roman", serif;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 700;
  font-style: italic;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.text};
  margin: 0 0 14px 0;
  line-height: 1;
`;

const SubTitle = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.texttertiary};
  max-width: 420px;
  line-height: 1.65;
  margin: 0;
`;

/* ─────────────────────────── Search ─────────────────────────────────── */
const SearchWrapper = styled.div`
  position: relative;
  width: 280px;
  align-self: end;

  @media (max-width: 768px) {
    width: 100%;
  }

  svg {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    color: #fca311;
    font-size: 1rem;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 10px 12px 10px 30px;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid ${({ theme }) => theme.bg3}55;
    color: ${({ theme }) => theme.text};
    font-size: 0.88rem;
    font-family: "Courier New", "Consolas", monospace;
    letter-spacing: 0.02em;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-bottom-color: #fca311;
    }

    &::placeholder {
      color: ${({ theme }) => theme.texttertiary}55;
      font-family: "Courier New", "Consolas", monospace;
    }
  }
`;

/* ─────────────────────────── Sections ───────────────────────────────── */
const Section = styled.section<{ $index: number }>`
  margin-bottom: 56px;
  animation: ${fadeUp} 0.55s ease both;
  animation-delay: ${({ $index }) => 0.1 + $index * 0.09}s;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
`;

const CategoryIndex = styled.span`
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 0.72rem;
  font-style: italic;
  color: #fca311;
  min-width: 20px;
  letter-spacing: 0.02em;
`;

const CategoryLabel = styled.h3`
  font-family: "Courier New", "Consolas", monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: ${({ theme }) => theme.texttertiary};
  white-space: nowrap;
`;

const SectionLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.bg3}28;
`;

/* ─────────────────────────── Grid ───────────────────────────────────── */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 10px;
`;

/* ─────────────────────────── Card ───────────────────────────────────── */
const CardAccent = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #fca311;
  transform: scaleY(0);
  transform-origin: bottom center;
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
`;

const ModuleCard = styled.button<{ $disabled?: boolean }>`
  all: unset;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 17px 20px 17px 24px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}22;
  border-radius: 3px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease;
  position: relative;
  overflow: hidden;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  box-sizing: border-box;

  &:hover {
    background: ${({ $disabled, theme }) =>
      $disabled ? theme.bg : theme.bg2};
    border-color: ${({ $disabled, theme }) =>
      $disabled ? `${theme.bg3}22` : `${theme.bg3}55`};
    box-shadow: ${({ $disabled }) =>
      $disabled ? "none" : "0 6px 32px rgba(0,0,0,0.09)"};
  }

  &:hover ${CardAccent} {
    transform: ${({ $disabled }) => ($disabled ? "scaleY(0)" : "scaleY(1)")};
  }
`;

const IconBox = styled.div<{ $disabled?: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 2px;
  background: ${({ theme }) => theme.bg2};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg3}22;
  flex-shrink: 0;
  transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;

  ${ModuleCard}:hover & {
    background: ${({ $disabled }) => ($disabled ? "" : "#fca311")};
    color: ${({ $disabled }) => ($disabled ? "" : "#14213d")};
    border-color: ${({ $disabled }) => ($disabled ? "" : "#fca311")};
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    font-size: 0.93rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }

  p {
    font-family: "Courier New", "Consolas", monospace;
    font-size: 0.73rem;
    color: ${({ theme }) => theme.texttertiary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.015em;
  }
`;

const ArrowIcon = styled(FiChevronRight)`
  font-size: 1rem;
  color: #fca311;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;

  ${ModuleCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`;

const PendingBadge = styled.span`
  position: absolute;
  top: 8px;
  right: 10px;
  font-family: "Courier New", "Consolas", monospace;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding: 2px 7px;
  border-radius: 2px;
  background: ${({ theme }) => theme.bg3}22;
  color: ${({ theme }) => theme.texttertiary}88;
  border: 1px solid ${({ theme }) => theme.bg3}22;
`;

/* ─────────────────────────── Empty State ────────────────────────────── */
const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 100px 0;
  text-align: center;
  color: ${({ theme }) => theme.texttertiary};
  animation: ${slideIn} 0.3s ease both;

  svg {
    font-size: 2.2rem;
    margin-bottom: 18px;
    opacity: 0.12;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  p {
    font-family: "Courier New", "Consolas", monospace;
    font-size: 0.8rem;
    letter-spacing: 0.06em;
  }
`;

/* ─────────────────────────── Component ──────────────────────────────── */
export const Configuración: React.FC = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const items: ConfigItem[] = useMemo(
    () => [
      // --- Ventas ---
      { id: "printers",    category: "Ventas",     title: "Impresoras",       description: "Configuración de tickets y comandas",  Icon: FiPrinter,     comingSoon: true },
      { id: "payments",    category: "Ventas",     title: "Métodos de Pago",  description: "Cajas y pasarelas de pago",             Icon: FiCreditCard,  comingSoon: true },
      { id: "dispositivos",category: "Ventas",     title: "Dispositivos POS", description: "Datáfonos y periféricos",               Icon: FiCpu,         path: ROUTES.DISPOSITIVOS },
      { id: "estaciones",  category: "Ventas",     title: "Estaciones POS",   description: "Terminales físicos por sucursal",       Icon: FiMonitor,     path: ROUTES.ESTACIONES },
      { id: "tickets",     category: "Ventas",     title: "Diseño Tickets",   description: "Personalización de comprobantes",       Icon: FiBookmark,    comingSoon: true },
      { id: "invoices",    category: "Ventas",     title: "Facturación",      description: "Parámetros de ley y correlativos",      Icon: FiSettings,    path: ROUTES.FACTURAS_CONFIG },

      // --- Inventario ---
      { id: "products",   category: "Inventario", title: "Productos",        description: "Gestión centralizada de stock",         Icon: FiBox,         path: ROUTES.PRODUCTOS },
      { id: "categories", category: "Inventario", title: "Categorías",       description: "Organización jerárquica",               Icon: FiTag,         path: ROUTES.CATEGORIAS },
      { id: "catalogo",   category: "Inventario", title: "Catálogo General", description: "Vista rápida de precios y stock",       Icon: FiShoppingBag, path: ROUTES.INVENTARIO },
      { id: "medidas",    category: "Inventario", title: "Unidades",         description: "Kilos, metros, unidades y más",         Icon: FiSliders,     path: ROUTES.MEDIDAS },
      { id: "warehouse",  category: "Inventario", title: "Almacenes",        description: "Control de bodegas y transferencias",   Icon: FiMapPin,      comingSoon: true },
      { id: "compras",    category: "Inventario", title: "Compras",          description: "Órdenes de compra y recepciones",       Icon: FiShoppingCart,path: ROUTES.COMPRAS },

      // --- Entidades ---
      { id: "suppliers", category: "Entidades",  title: "Proveedores",      description: "Directorio y órdenes de compra",        Icon: FiTruck,       path: ROUTES.PROVEEDORES },
      { id: "clients",   category: "Entidades",  title: "Clientes",         description: "Cartera y fidelización",                Icon: FiUsers,       path: ROUTES.CLIENTES },
      { id: "branches",  category: "Entidades",  title: "Sucursales",       description: "Puntos de venta operativos",            Icon: FiHome,        path: ROUTES.SUCURSALES },

      // --- Sistema ---
      { id: "company",    category: "Sistema",   title: "Mi Empresa",       description: "Datos fiscales y comerciales",          Icon: FiShoppingCart,path: ROUTES.EMPRESAS },
      { id: "currencies", category: "Sistema",   title: "Monedas",          description: "Divisas y tipos de cambio",             Icon: FiDollarSign,  path: ROUTES.MONEDAS },
      { id: "roles",      category: "Sistema",   title: "Roles y Permisos", description: "Control de acceso de usuarios",         Icon: FiUsers,       path: ROUTES.ROLES },
      { id: "estatus",    category: "Sistema",   title: "Estatus",          description: "Estados lógicos del sistema",           Icon: FiActivity,    path: ROUTES.ESTATUS },
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
    if (item.comingSoon) return;
    if (item.path) navigate(item.path);
    else if (item.onClick) item.onClick();
  };

  return (
    <PageContainer>
      <Header>
        <TitleArea>
          <Eyebrow>// sistema · configuración</Eyebrow>
          <MainTitle>Centro de Control</MainTitle>
          <SubTitle>
            Ajusta el núcleo operativo, gestiona entidades maestras y
            personaliza la lógica de tu negocio.
          </SubTitle>
        </TitleArea>

        <SearchWrapper>
          <FiSearch />
          <input
            type="text"
            placeholder="buscar módulo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchWrapper>
      </Header>

      {CATEGORY_ORDER.map((cat, catIdx) => {
        const modules = grouped[cat];
        if (!modules.length) return null;
        return (
          <Section key={cat} $index={catIdx}>
            <SectionHeader>
              <CategoryIndex>
                {String(catIdx + 1).padStart(2, "0")}
              </CategoryIndex>
              <CategoryLabel>{cat}</CategoryLabel>
              <SectionLine />
            </SectionHeader>
            <Grid>
              {modules.map((item) => (
                <ModuleCard
                  key={item.id}
                  $disabled={item.comingSoon}
                  onClick={() => handleAction(item)}
                >
                  <CardAccent />
                  {item.comingSoon && <PendingBadge>pendiente</PendingBadge>}
                  <IconBox $disabled={item.comingSoon}>
                    <item.Icon />
                  </IconBox>
                  <Content>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </Content>
                  {!item.comingSoon && <ArrowIcon className="arrow-icon" />}
                </ModuleCard>
              ))}
            </Grid>
          </Section>
        );
      })}

      {filtered.length === 0 && (
        <Grid>
          <EmptyState>
            <FiSearch />
            <p>sin resultados · "{query}"</p>
          </EmptyState>
        </Grid>
      )}
    </PageContainer>
  );
};

export default Configuración;
