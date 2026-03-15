# Groot-Type Dashboard

Una aplicación de dashboard moderna construida con **React 19**, **TypeScript** y **Vite**, enfocada en la escalabilidad y el uso de patrones de diseño profesionales.

## 🚀 Características

- **Theming Dinámico:** Soporte completo para modo Claro (Light) y Oscuro (Dark) mediante `styled-components`.
- **Navegación Fluida:** Enrutamiento del lado del cliente con **React Router 7**.
- **Arquitectura Robusta:** Implementación de patrones de diseño para el manejo de datos.
- **Estado Global:** Gestión de estado eficiente con **Zustand**.
- **Consumo de API:** Cliente de API centralizado con **Axios**.
- **UI Responsiva:** Sidebar interactivo y layouts optimizados.

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + TypeScript
- **Estilos:** styled-components
- **Estado:** Zustand
- **HTTP:** Axios
- **Iconos:** react-icons
- **Build Tool:** Vite

## 🧩 Patrones de Diseño Implementados

Para garantizar un código limpio y mantenible, el proyecto utiliza:

1.  **Singleton (Axios Client):** Centraliza la configuración de la API en `src/api/axiosClient.ts`, asegurando una única instancia de comunicación.
2.  **Factory / Service Layer:** Los servicios en `src/services/` encapsulan la lógica de las peticiones, separando la infraestructura de la UI.
3.  **Observer (Zustand):** Los componentes se suscriben a los stores en `src/store/`, reaccionando automáticamente a los cambios de datos.

## 📁 Estructura del Proyecto

```text
src/
├── api/            # Instancia de Axios (Singleton)
├── components/     # Componentes de UI reutilizables
├── context/        # Contextos de React (Tema)
├── pages/          # Vistas principales de la aplicación
├── routes/         # Configuración de rutas
├── services/       # Capa de servicios (Lógica de API)
├── store/          # Gestión de estado global (Zustand)
├── styles/         # Temas y variables globales
└── styled.d.ts     # Definiciones de tipos para styled-components
```

## ⚙️ Instalación y Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone [url-del-repo]
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Construir para producción:**
    ```bash
    npm run build
    ```

5.  **Linting:**
    ```bash
    npm run lint
    ```

---
Desarrollado con ❤️ para el proyecto Groot-Type.
