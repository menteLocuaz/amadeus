import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../UI";
import { useUIStore } from "../../store/useUIStore";

/**
 * MainLayout Component
 * Encapsula la estructura principal del Dashboard: Sidebar + Área de Contenido.
 * Utiliza Zustand para manejar el estado visual del sidebar.
 */
const MainLayout: React.FC = () => {
  const { sidebarOpen } = useUIStore();

  return (
    <Container $sidebarOpen={sidebarOpen}>
      <Sidebar />
      <ContentArea>
        {/* Outlet renderiza los componentes hijos definidos en el Router */}
        <Outlet />
      </ContentArea>
    </Container>
  );
};

// --- Estilos Base del Layout ---

/**
 * Contenedor principal con grid dinámico.
 * El prefijo $ en las props indica que son transitorias para styled-components
 * y no se pasan al elemento DOM real.
 */
const Container = styled.div<{ $sidebarOpen: boolean }>`
  display: grid;
  grid-template-columns: ${({ $sidebarOpen }) => ($sidebarOpen ? "300px 1fr" : "90px 1fr")};
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  transition: grid-template-columns 0.3s ease;
  height: 100vh;
  overflow: hidden;
`;

const ContentArea = styled.main`
  padding: 20px;
  overflow-y: auto;
  position: relative;
`;

export default MainLayout;
