import React, { useContext, useCallback } from "react";
import styled from "styled-components";
import { NavLink, useNavigate } from "react-router-dom";
import {
    AiOutlineLeft,
    AiOutlineHome,
    AiOutlineApartment,
    AiOutlineSetting,
} from "react-icons/ai";
import { MdOutlineAnalytics, MdLogout, MdPointOfSale } from "react-icons/md";
import { ThemeContext } from "../context/ThemeContext";
import { useAuthStore } from "../store/useAuthStore";
import { v } from "../styles/Variables";
import logo from "../assets/react.svg";

// --- Interfaces ---
interface NavLinkItem {
    label: string;
    icon: React.ReactNode;
    to: string;
    onClick?: () => void;
}

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

// --- Componente Principal ---
export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const context = useContext(ThemeContext);
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const toggleSidebar = useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen, setSidebarOpen]);

    const toggleTheme = useCallback(() => {
        if (context) {
            context.setTheme((curr) => (curr === "light" ? "dark" : "light"));
        }
    }, [context]);

    const handleLogout = useCallback(() => {
        logout();
        navigate("/");
    }, [logout, navigate]);

    // Manejo seguro del contexto (después de los hooks)
    if (!context) return null;
    const { theme } = context;

    // Datos de Configuración
    const primaryLinks: NavLinkItem[] = [
        { label: "Home", icon: <AiOutlineHome />, to: "/home" },
        { label: "Caja (POS)", icon: <MdPointOfSale />, to: "/pos" },
        { label: "Estadísticas", icon: <MdOutlineAnalytics />, to: "/estadisticas" },
        { label: "Productos", icon: <AiOutlineApartment />, to: "/productos" },
        { label: "Diagramas", icon: <MdOutlineAnalytics />, to: "/diagramas" },
        { label: "Reportes", icon: <MdOutlineAnalytics />, to: "/reportes" }
    ];

    const secondaryLinks: NavLinkItem[] = [
        { label: "Configuración", icon: <AiOutlineSetting />, to: "/config" },
        { label: "Salir", icon: <MdLogout />, to: "/", onClick: handleLogout },
    ];

    return (
        <Container $isOpen={sidebarOpen}>
            {/* Botón de colapso */}
            <CollapseButton onClick={toggleSidebar} $isOpen={sidebarOpen}>
                <AiOutlineLeft />
            </CollapseButton>

            {/* Header / Logo */}
            <LogoSection $isOpen={sidebarOpen}>
                <div className="img-content">
                    <img src={logo} alt="Logo" />
                </div>
                {sidebarOpen && <h2>Groot-Type</h2>}
            </LogoSection>

            {/* Secciones de Navegación */}
            <NavSection links={primaryLinks} sidebarOpen={sidebarOpen} />
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
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 20px 0;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
`;

const CollapseButton = styled.button<{ $isOpen: boolean }>`
  position: absolute;
  top: ${v.xxlSpacing};
  right: -16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.bgtgderecha};
  color: inherit;
  border: 1px solid ${({ theme }) => theme.bg3};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(0deg)" : "rotate(180deg)")};
  transition: all 0.3s ease;
  &:hover { background: ${({ theme }) => theme.bg3}; }
`;

const LogoSection = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 20px 30px;
  
  .img-content {
    img { width: 40px; }
    transform: ${({ $isOpen }) => ($isOpen ? "scale(1)" : "scale(1.3)")};
    transition: transform 0.3s ease;
  }
  
  h2 { font-size: 1.2rem; margin: 0; }
`;

const LinksWrapper = styled.div`
  .link-container {
    padding: 0 10px;
    margin: 4px 0;
  }

  .link-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 15px;
    text-decoration: none;
    color: inherit;
    border-radius: 8px;
    transition: background 0.2s;
    white-space: nowrap;
    background: none;
    border: none;
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    text-align: left;

    &:hover { background: ${({ theme }) => theme.bg3}; }
    &.active {
      color: ${({ theme }) => theme.bg4};
      background: ${({ theme }) => theme.bg2};
      font-weight: 600;
    }

    .icon-box {
      min-width: 40px;
      display: flex;
      font-size: 24px;
    }
  }
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.bg3};
  margin: 15px 20px;
`;

const ThemeToggle = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isOpen }) => ($isOpen ? "space-between" : "center")};
  padding: 10px 20px;
  
  .title { font-weight: 600; font-size: 0.9rem; }
`;

const ToggleWrapper = styled.div`
  .switch {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 24px;
    
    input { opacity: 0; width: 0; height: 0; }
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;

      &:before {
        position: absolute;
        content: "";
        height: 18px; width: 18px;
        left: 3px; bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
    }

    input:checked + .slider { background-color: #2196F3; }
    input:checked + .slider:before { transform: translateX(22px); }
  }
`;
