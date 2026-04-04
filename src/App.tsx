import { useMemo, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { MyRoutes } from "./routes/routes";
import { Light, Dark } from "./core/styles/Themes";
import { useAuthStore } from "./features/auth/store/useAuthStore";
import { useUIStore } from "./shared/store/useUIStore";

/**
 * AppContent Component
 * Se encarga de la configuración global de UI y autenticación.
 * 
 * Mejoras aplicadas:
 * 1. Eliminación de ThemeContext redundante (ahora centralizado en Zustand).
 * 2. Desacoplamiento de Layouts (movidos a MainLayout.tsx).
 * 3. Simplificación del renderizado.
 */
function AppContent() {
  const { theme } = useUIStore();
  const { user, token, fetchMe } = useAuthStore();

  // --- Sincronización de Sesión ---
  // Si el usuario refresca la página pero tiene un token válido, recuperamos sus datos.
  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [user, token, fetchMe]);

  // --- Gestión de Temas ---
  // Memoizamos el objeto de tema de styled-components para evitar re-renders innecesarios.
  const themeStyle = useMemo(() => (theme === "light" ? Light : Dark), [theme]);

  return (
    <ThemeProvider theme={themeStyle}>
      {/* 
        MyRoutes ahora gestiona internamente qué páginas llevan Sidebar 
        mediante el componente MainLayout. 
      */}
      <MyRoutes />
    </ThemeProvider>
  );
}

/**
 * Entry Point Principal
 */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
