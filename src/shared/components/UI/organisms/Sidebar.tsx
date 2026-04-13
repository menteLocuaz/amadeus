import React, { useCallback } from "react";
import styled from "styled-components";
import { NavLink, useNavigate } from "react-router-dom";
import {
    AiOutlineLeft,
    AiOutlineHome,
    AiOutlineApartment,
    AiOutlineSetting,
} from "react-icons/ai";
import { MdOutlineAnalytics, MdLogout, MdPointOfSale, MdBusiness } from "react-icons/md";
import { FiMapPin, FiUsers, FiShoppingBag, FiFileText } from "react-icons/fi";
import { useAuthStore } from "../../../../features/auth/store/useAuthStore";
import { useUIStore } from "../../../store/useUIStore";
import { ROUTES } from "../../../../core/constants/routes";
import logo from "../../../../assets/react.svg";

// --- Interfaces ---
interface NavLinkItem {
    label: string;
    icon: React.ReactNode;
    to: string;
    onClick?: () => void;
}

// --- Componente Principal ---
export const Sidebar: React.FC = () => {
    const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUIStore();
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = useCallback(async () => {
        await logout();
        navigate(ROUTES.LOGIN);
    }, [logout, navigate]);

    // Datos de Configuración
    const primaryLinks: NavLinkItem[] = [
        { label: "Home",             icon: <AiOutlineHome />,       to: ROUTES.HOME },
        // --- Ventas ---
        { label: "Caja (POS)",       icon: <MdPointOfSale />,       to: ROUTES.POS },
        { label: "Cierre de Caja",   icon: <MdPointOfSale />,       to: ROUTES.POS_CIERRE },
        { label: "Facturación",      icon: <FiFileText />,          to: ROUTES.FACTURACION },
        { label: "Historial Ventas", icon: <MdOutlineAnalytics />,  to: ROUTES.FACTURAS_HISTORIAL },
        { label: "Formas de Pago",   icon: <MdPointOfSale />,       to: ROUTES.FORMAS_PAGO },
        // --- Inventario ---
        { label: "Productos",        icon: <AiOutlineApartment />,  to: ROUTES.PRODUCTOS },
        { label: "Inventario",       icon: <FiShoppingBag />,       to: ROUTES.INVENTARIO },
        { label: "Catálogo",         icon: <FiShoppingBag />,       to: ROUTES.CATALOGO },
        { label: "Compras",          icon: <FiShoppingBag />,       to: ROUTES.COMPRAS },
        { label: "Proveedores",      icon: <FiShoppingBag />,       to: ROUTES.PROVEEDORES },
        { label: "Kardex",           icon: <MdOutlineAnalytics />,  to: ROUTES.KARDEX },
        // --- Entidades ---
        { label: "Clientes",         icon: <FiUsers />,             to: ROUTES.CLIENTES },
        { label: "Empresas",         icon: <MdBusiness />,          to: ROUTES.EMPRESAS },
        { label: "Sucursales",       icon: <FiMapPin />,            to: ROUTES.SUCURSALES },
        { label: "Usuarios",         icon: <FiUsers />,             to: ROUTES.USUARIOS },
        // --- Sistema ---
        { label: "Roles",            icon: <FiUsers />,             to: ROUTES.ROLES },
        { label: "Categorías",       icon: <AiOutlineApartment />,  to: ROUTES.CATEGORIAS },
        { label: "Monedas",          icon: <MdOutlineAnalytics />,  to: ROUTES.MONEDAS },
        { label: "Estatus",          icon: <AiOutlineSetting />,    to: ROUTES.ESTATUS },
        { label: "Estaciones POS",   icon: <MdPointOfSale />,       to: ROUTES.ESTACIONES },
        { label: "Dispositivos",     icon: <AiOutlineSetting />,    to: ROUTES.DISPOSITIVOS },
    ];

    const secondaryLinks: NavLinkItem[] = [
        { label: "Configuración", icon: <AiOutlineSetting />, to: ROUTES.CONFIG },
        { label: "Salir", icon: <MdLogout />, to: ROUTES.LOGIN, onClick: handleLogout },
    ];

    return (
        <Container $isOpen={sidebarOpen}>
            {/* Botón de colapso - Fuera del contexto de scroll para evitar clipping */}
            <CollapseButton onClick={toggleSidebar} $isOpen={sidebarOpen}>
                <AiOutlineLeft />
            </CollapseButton>

            <ScrollableContent>
                {/* Header / Logo */}
                <LogoSection $isOpen={sidebarOpen}>
                    <div className="img-content">
                        <img src={logo} alt="Logo" />
                    </div>
                    {sidebarOpen && <h2>Groot-Type</h2>}
                </LogoSection>

                {/* Secciones de Navegación */}
                <NavSection
                  links={primaryLinks.filter(link => {
                    // Administradores ven todo
                    if (user?.rol?.nombre_rol === 'Administrador Global') return true;
                    // Si el backend no envía permisos, mostramos todo (fallback)
                    if (!user?.permisos || !Array.isArray(user.permisos) || user.permisos.length === 0) return true;
                    return user.permisos.includes(link.to);
                  })}
                  sidebarOpen={sidebarOpen}
                />
                <Divider />
                <NavSection links={secondaryLinks} sidebarOpen={sidebarOpen} />
                <Divider />

                {/* Control de Tema */}
                <ThemeToggle $isOpen={sidebarOpen}>
                    {sidebarOpen && <span className="title">Dark Mode</span>}
                    <ToggleWrapper>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={theme === "dark"}
                                onChange={toggleTheme}
                            />
                            <span className="slider round"></span>
                        </label>
                    </ToggleWrapper>
                </ThemeToggle>
            </ScrollableContent>
        </Container>
    );
};

// --- Subcomponente de Navegación ---
const NavSection = ({ links, sidebarOpen }: { links: NavLinkItem[], sidebarOpen: boolean }) => (
    <LinksWrapper>
        {links.map(({ label, icon, to, onClick }) => (
            <div className="link-container" key={label}>
                {onClick ? (
                    <button className="link-item" onClick={(e) => {
                        e.preventDefault();
                        onClick();
                    }}>
                        <div className="icon-box">{icon}</div>
                        {sidebarOpen && <span>{label}</span>}
                    </button>
                ) : (
                    <NavLink
                        to={to}
                        className={({ isActive }) => `link-item ${isActive ? "active" : ""}`}
                    >
                        <div className="icon-box">{icon}</div>
                        {sidebarOpen && <span>{label}</span>}
                    </NavLink>
                )}
            </div>
        ))}
    </LinksWrapper>
);

// --- Estilos ---
const Container = styled.div<{ $isOpen: boolean }>`
  font-family: inherit;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 16px 0 0 0;
  transition: width 0.2s ease-in-out;
  z-index: 1000;
  border-right: 1px solid rgba(150, 150, 150, 0.15); /* Whisper-quiet border */
  display: flex;
  flex-direction: column;
  
  /* Subtle depth */
  box-shadow: 1px 0 0 rgba(0,0,0,0.02);
`;

const ScrollableContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0 16px 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { 
    background: rgba(150, 150, 150, 0.2); 
    border-radius: 4px; 
  }
`;

const CollapseButton = styled.button<{ $isOpen: boolean }>`
  position: absolute;
  top: 24px;
  right: -12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }: any) => theme.textMuted || theme.text};
  border: 1px solid rgba(150, 150, 150, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(0deg)" : "rotate(180deg)")};
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
  z-index: 10;
  opacity: 0; /* Hidden by default */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  ${Container}:hover & {
    opacity: 1; /* Shows only when hovering near the sidebar */
  }

  &:hover { 
    background: ${({ theme }) => theme.bg3};
    transform: ${({ $isOpen }) => ($isOpen ? "rotate(0deg) scale(1.05)" : "rotate(180deg) scale(1.05)")};
  }
  
  svg { font-size: 12px; }
`;

const LogoSection = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${({ $isOpen }) => ($isOpen ? "12px 20px 24px" : "12px 0 24px")};
  width: 100%;
  justify-content: center;
  
  .img-content {
    display: flex;
    justify-content: center;
    align-items: center;
    img { width: 28px; opacity: 0.9; }
    transition: transform 0.2s ease;
  }
  
  h2 { 
    font-size: 1rem; 
    font-weight: 600;
    margin: 0; 
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    color: ${({ theme }) => theme.text};
    letter-spacing: -0.01em;
  }
`;

const LinksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 12px;

  .link-container {
    width: 100%;
  }

  .link-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 12px;
    text-decoration: none;
    color: ${({ theme }: any) => theme.textMuted || theme.text};
    border-radius: 6px;
    transition: all 0.15s ease;
    white-space: nowrap;
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    position: relative;
    opacity: 0.85;

    &:hover { 
      background: rgba(150, 150, 150, 0.08); 
      opacity: 1;
    }
    
    &.active {
      color: ${({ theme }) => theme.text};
      background: rgba(150, 150, 150, 0.12); /* Inset feel */
      font-weight: 600;
      opacity: 1;
      
      /* Hardware Status Indicator */
      &::before {
        content: '';
        position: absolute;
        left: 4px;
        top: 50%;
        transform: translateY(-50%);
        height: 14px;
        width: 3px;
        border-radius: 2px;
        background: ${({ theme }) => theme.text};
        box-shadow: 0 0 8px rgba(255,255,255,0.1);
      }
    }

    .icon-box {
      min-width: 32px;
      display: flex;
      font-size: 18px;
    }
    
    span {
      padding-top: 1px;
    }
  }
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: rgba(150, 150, 150, 0.15);
  margin: 16px 16px;
`;

const ThemeToggle = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isOpen }) => ($isOpen ? "space-between" : "center")};
  padding: ${({ $isOpen }) => ($isOpen ? "16px 20px" : "16px 0")};
  margin-top: auto;
  border-top: 1px solid rgba(150, 150, 150, 0.1);
  
  .title { 
    font-weight: 500; 
    font-size: 0.75rem; 
    color: ${({ theme }: any) => theme.textMuted || theme.text};
    opacity: 0.8;
  }
`;

const ToggleWrapper = styled.div`
  .switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
    
    input { opacity: 0; width: 0; height: 0; }
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(150, 150, 150, 0.2);
      transition: .2s ease;
      border-radius: 20px; /* Soft pill */
      border: 1px solid rgba(150, 150, 150, 0.1);

      &:before {
        position: absolute;
        content: "";
        height: 14px; width: 14px;
        left: 2px; bottom: 2px;
        background-color: ${({ theme }) => theme.text};
        transition: .2s ease;
        border-radius: 50%;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
    }

    input:checked + .slider { 
      background-color: rgba(150, 150, 150, 0.3);
    }
    input:checked + .slider:before { 
      transform: translateX(16px); 
    }
  }
`;
