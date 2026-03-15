import { useState, useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { MyRoutes } from "./routes/routes";
import { Sidebar } from "./components/Sidebar";
import { Light, Dark } from "./styles/Themes";
import { ThemeContext } from "./context/ThemeContext";

function App() {
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Memorizamos el estilo del tema para evitar cálculos innecesarios en cada render
  const themeStyle = useMemo(() => (theme === "light" ? Light : Dark), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={themeStyle}>
        <BrowserRouter>
          <Container $sidebarOpen={sidebarOpen}>
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
            <ContentArea>
              <MyRoutes />
            </ContentArea>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

// Styled Components con props transitorias ($) para evitar que lleguen al DOM
const Container = styled.div<{ $sidebarOpen: boolean }>`
  display: grid;
  grid-template-columns: ${({ $sidebarOpen }) => ($sidebarOpen ? "300px" : "90px")} auto;
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