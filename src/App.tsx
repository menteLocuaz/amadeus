import { useState, useMemo } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { MyRoutes } from "./routes/routes";
import { Sidebar } from "./components/Sidebar";
import { Light, Dark } from "./styles/Themes";
import { ThemeContext } from "./context/ThemeContext";

function AppContent() {
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const themeStyle = useMemo(() => (theme === "light" ? Light : Dark), [theme]);
  
  // No mostrar sidebar en login ni registro
  const isPublicPage = location.pathname === "/" || location.pathname === "/register";

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={themeStyle}>
        <Container $sidebarOpen={sidebarOpen} $hideSidebar={isPublicPage}>
          {!isPublicPage && (
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
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
  min-height: 100vh;
`;

const ContentArea = styled.main`
  padding: 20px;
  overflow-y: auto;
`;

export default App;