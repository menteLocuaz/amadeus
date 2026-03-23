import { useMemo, useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { MyRoutes } from "./routes/routes";
import { Sidebar } from "./shared/layout/Sidebar";
import { Light, Dark } from "./core/styles/Themes";
import { ThemeContext } from "./core/context/ThemeContext";
import { ROUTES } from "./core/constants/routes";
import { useAuthStore } from "./features/auth/store/useAuthStore";
import { useUIStore } from "./shared/store/useUIStore";

function AppContent() {
  const { theme, toggleTheme, sidebarOpen } = useUIStore();
  const location = useLocation();
  const { user, fetchMe } = useAuthStore();

  // Restaurar sesión si hay token pero no usuario en el store (ej: refresh)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      fetchMe();
    }
  }, [user, fetchMe]);

  const themeStyle = useMemo(() => (theme === "light" ? Light : Dark), [theme]);
  
  // No mostrar sidebar en login, registro ni en la selección de sistema
  const isPublicPage = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.SELECT_SYSTEM].includes(location.pathname as any);

  // Adaptamos el setter del contexto para que use el store si algún componente lo requiere aún
  const setThemeFromContext = (value: any) => {
    if (typeof value === 'function') {
      const nextTheme = value(theme);
      if (nextTheme !== theme) toggleTheme();
    } else if (value !== theme) {
      toggleTheme();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeFromContext }}>
      <ThemeProvider theme={themeStyle}>
        <Container $sidebarOpen={sidebarOpen} $hideSidebar={isPublicPage}>
          {!isPublicPage && (
            <Sidebar />
          )}
          <ContentArea>
            <MyRoutes />
          </ContentArea>
        </Container>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// Styled Components con props transitorias ($) para evitar que lleguen al DOM
const Container = styled.div<{ $sidebarOpen: boolean; $hideSidebar: boolean }>`
  display: grid;
  grid-template-columns: ${({ $sidebarOpen, $hideSidebar }) => 
    $hideSidebar ? "1fr" : ($sidebarOpen ? "300px auto" : "90px auto")};
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  transition: grid-template-columns 0.3s ease;
  height: 100vh;
  overflow: hidden;
`;

const ContentArea = styled.main`
  padding: 20px;
  overflow-y: auto;
`;

export default App;
