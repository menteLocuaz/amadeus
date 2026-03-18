# Groot-Type Dashboard

Una aplicación de dashboard moderna construida con **React 19**, **TypeScript** y **Vite**, enfocada en la escalabilidad y el uso de patrones de diseño profesionales con una arquitectura orientada a características (Feature-based architecture).

## 🚀 Características

- **Theming Dinámico:** Soporte completo para modo Claro (Light) y Oscuro (Dark) mediante `styled-components`.
- **Navegación Fluida:** Enrutamiento del lado del cliente con **React Router 7**.
- **Arquitectura Robusta:** Implementación de arquitectura por módulos (features) para escalabilidad.
- **Estado Global:** Gestión de estado eficiente con **Zustand**.
- **Consumo de API:** Cliente de API centralizado con **Axios**.
- **UI Responsiva:** Sidebar interactivo y layouts optimizados.

- **Abastecimiento y Compras:** Registro de entradas de mercancía con cálculo de rentabilidad en tiempo real.
- **Gestión de Inventario:** Control de stock físico con niveles críticos (+10% para reabastecimiento) y visualización por sucursales.
- **Trazabilidad (Kardex):** Historial completo de movimientos de productos (Compra, Ajuste, Venta).

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + TypeScript
- **Estilos:** styled-components (Vanilla CSS feel with custom themes)
- **Componentes Atómicos:** Sistema de UI propio con átomos, bloques y componentes reutilizables.
- **Estado:** Zustand & Context API
- **HTTP:** Axios
- **Validación:** Yup + React Hook Form

## 🧩 Patrones de Diseño Implementados

Para garantizar un código limpio y mantenible, el proyecto utiliza:

1.  **Atomic Design (UI Components):** Los componentes en `src/shared/components/UI` (como `StockIndicator`) son independientes y reutilizables en toda la aplicación.
2.  **Singleton (Axios Client):** Centraliza la configuración de la API en `src/core/api/axiosClient.ts`.
3.  **Service Layer (Feature-scoped):** Servicios por módulo (ej. `InventoryService.ts`) que encapsulan fetch/mutate.
4.  **Custom Hooks (Logic Separation):** Los hooks (ej. `useInventory.ts`) separan la lógica de negocio del componente visual.

## 📁 Estructura del Proyecto

```text
src/
├── core/           # API, Context y Estilos globales
├── features/       # Módulos de negocio (Features)
│   ├── auth/       # Login, roles y usuarios
│   ├── pos/        # Punto de Venta y Carrito
│   ├── products/   # Catálogo maestro de productos
│   ├── inventory/  # Stock actual, Kardex y Ajustes (NUEVO)
│   ├── purchases/  # Registro de entradas y proveedores (NUEVO)
│   └── stats/      # Reportes y Dashboards
├── routes/         # Enrutamiento React Router 7
├── shared/         # UI/Atoms/Layout compartidos
└── assets/         # Imágenes y constantes
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
