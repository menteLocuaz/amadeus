import React, { useMemo, useState } from "react";
import styled from "styled-components";
import type { IconType } from "react-icons";
import { 
  FiPrinter, FiShoppingCart, FiBox, FiUsers, 
  FiTruck, FiCreditCard, FiMapPin, FiUser, 
  FiTag, FiSettings, FiSearch 
} from "react-icons/fi";
import { RiStore2Line } from "react-icons/ri";
import { GiTicket } from "react-icons/gi";
import { useNavigate } from "react-router-dom";

/**
 * Página de Configuración — Adaptada al ecosistema Groot-Type
 */

/* -------------------------------- Types --------------------------------- */
type ConfigItem = {
  id: string;
  title: string;
  description: string;
  Icon: IconType;
  path?: string;
  onClick?: () => void;
};

/* ------------------------------ Styled UI ------------------------------- */
const Page = styled.div`
  padding: 28px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TitleSection = styled.div`
  h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    color: ${({ theme }) => theme.bg4}; // Acento dorado
  }
  span {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.texttertiary};
  }
`;

const Search = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.bg3}33;
  padding: 10px 16px;
  border-radius: 12px;
  min-width: 280px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.bg4};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.bg4}22;
  }

  input {
    border: none;
    outline: none;
    font-size: 1rem;
    background: transparent;
    width: 100%;
    color: ${({ theme }) => theme.text};
    &::placeholder { color: ${({ theme }) => theme.texttertiary}; opacity: 0.5; }
  }

  svg {
    color: ${({ theme }) => theme.bg4};
    font-size: 1.2rem;
  }

  @media (max-width: 640px) {
    margin-left: 0;
    width: 100%;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const Tile = styled.button`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 24px;
  background: ${({ theme }) => theme.bg};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.bg3}22;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;

  &:hover {
    transform: translateY(-5px);
    background: ${({ theme }) => theme.bg2};
    border-color: ${({ theme }) => theme.bg4};
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const IconWrap = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.bg4};
  font-size: 24px;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.bg3}11;
`;

const TileText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TileTitle = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
`;

const TileDesc = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.texttertiary};
  line-height: 1.4;
`;

/* ------------------------------- Component ------------------------------- */
export const Configuración: React.FC = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const items: ConfigItem[] = useMemo(() => [
    { id: "printers", title: "Impresoras", description: "Gestiona tus comprobantes de pago", Icon: FiPrinter, onClick: () => alert("Configurando Impresoras...") },
    { id: "company", title: "Empresa", description: "Configura la información de tu negocio", Icon: FiShoppingCart, onClick: () => alert("Configurando Empresa...") },
    { id: "categories", title: "Categorías", description: "Organiza tus productos por grupos", Icon: FiTag, onClick: () => alert("Configurando Categorías...") },
    { id: "products", title: "Productos", description: "Registro y control de inventario", Icon: FiBox, path: "/productos" },
    { id: "clients", title: "Clientes", description: "Directorio y estados de cuenta", Icon: FiUsers, onClick: () => alert("Configurando Clientes...") },
    { id: "suppliers", title: "Proveedores", description: "Gestión de compras y abastecimiento", Icon: FiTruck, onClick: () => alert("Configurando Proveedores...") },
    { id: "payments", title: "Métodos de pago", description: "Configura cajas y formas de cobro", Icon: FiCreditCard, onClick: () => alert("Configurando Pagos...") },
    { id: "branches", title: "Sucursales", description: "Administra múltiples puntos de venta", Icon: RiStore2Line, onClick: () => alert("Configurando Sucursales...") },
    { id: "roles", title: "Roles", description: "Configura perfiles y permisos de acceso", Icon: FiUsers, path: "/roles" },
    { id: "users", title: "Usuarios", description: "Control de accesos y perfiles", Icon: FiUser, path: "/register" },
    { id: "warehouse", title: "Almacén", description: "Movimientos de stock y bodegas", Icon: FiMapPin, onClick: () => alert("Configurando Almacén...") },
    { id: "tickets", title: "Tickets", description: "Diseño de comprobantes y cupones", Icon: GiTicket, onClick: () => alert("Configurando Tickets...") },
    { id: "invoices", title: "Facturación", description: "Parámetros fiscales y comprobantes", Icon: FiSettings, onClick: () => alert("Configurando Facturación...") },
  ], []);

  const filtered = useMemo(
    () => items.filter(i => (i.title + i.description).toLowerCase().includes(query.trim().toLowerCase())),
    [items, query]
  );

  const handleAction = (item: ConfigItem) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <Page>
      <Header>
        <TitleSection>
          <h2>Configuración</h2>
          <span>Administra los módulos y parámetros de tu sistema</span>
        </TitleSection>

        <Search>
          <FiSearch />
          <input
            placeholder="Buscar configuración..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Search>
      </Header>

      <Grid>
        {filtered.map(item => (
          <Tile
            key={item.id}
            onClick={() => handleAction(item)}
            title={item.title}
          >
            <IconWrap>
              <item.Icon />
            </IconWrap>
            <TileText>
              <TileTitle>{item.title}</TileTitle>
              <TileDesc>{item.description}</TileDesc>
            </TileText>
          </Tile>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: 60, textAlign: "center" }}>
            <p style={{ fontSize: "1.2rem", opacity: 0.5 }}>No se encontraron módulos con esa descripción.</p>
          </div>
        )}
      </Grid>
    </Page>
  );
};

export default Configuración;
