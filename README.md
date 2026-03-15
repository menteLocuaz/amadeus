# Groot-Type Dashboard

Una aplicación de dashboard moderna construida con **React 19**, **TypeScript** y **Vite**, enfocada en la escalabilidad y el uso de patrones de diseño profesionales con una arquitectura orientada a características (Feature-based architecture).

## 🚀 Características

- **Theming Dinámico:** Soporte completo para modo Claro (Light) y Oscuro (Dark) mediante `styled-components`.
- **Navegación Fluida:** Enrutamiento del lado del cliente con **React Router 7**.
- **Arquitectura Robusta:** Implementación de arquitectura por módulos (features) para escalabilidad.
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

1.  **Singleton (Axios Client):** Centraliza la configuración de la API en `src/core/api/axiosClient.ts`, asegurando una única instancia de comunicación.
2.  **Service Layer (Feature-scoped):** Los servicios dentro de cada característica (ej. `src/features/auth/services/`) encapsulan la lógica de las peticiones, separando la infraestructura de la UI.
3.  **Observer (Zustand):** Los componentes se suscriben a los stores locales de cada característica (ej. `src/features/products/store/`), reaccionando automáticamente a los cambios de datos.
4.  **Feature-based Architecture:** Organización del código por dominios de negocio (Auth, POS, Products, Stats), facilitando el mantenimiento y la escalabilidad.

## 📁 Estructura del Proyecto

```text
src/
├── core/           # Núcleo de la aplicación (API, Context, Estilos globales)
│   ├── api/        # Configuración de Axios
│   ├── context/    # Contextos globales (ej. Tema)
│   └── styles/     # Definiciones de temas y variables
├── features/       # Módulos basados en características del negocio
│   ├── auth/       # Autenticación, roles y usuarios
│   ├── pos/        # Punto de Venta (Carrito, Grid de productos)
│   ├── products/   # Gestión de productos
│   └── stats/      # Estadísticas, reportes y dashboards
├── routes/         # Configuración centralizada de rutas
├── shared/         # Recursos compartidos entre características
│   ├── components/ # Componentes UI genéricos
│   └── layout/     # Componentes de estructura (Sidebar, Navbar)
└── assets/         # Recursos estáticos (Imágenes, SVGs)
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
