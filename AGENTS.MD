# GEMINI.md - Groot-Type Project Context

This file provides the necessary context and guidelines for interacting with the `groot-type` project.

## Project Overview

**Groot-Type** is a modern dashboard application built with **React 19**, **TypeScript**, and **Vite**. It features a responsive sidebar-based layout, dynamic theme switching (Light/Dark), and client-side routing.

### Core Technologies
- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **Styling:** [styled-components](https://styled-components.com/)
- **Icons:** [react-icons](https://react-icons.github.io/react-icons/)

### Architecture
The project follows a standard React directory structure:
- `src/main.tsx`: Application entry point.
- `src/App.tsx`: Root component, manages theme context and high-level layout.
- `src/components/`: Reusable UI components (e.g., `Sidebar.tsx`).
- `src/pages/`: Main view components (Home, Productos, Estadisticas, etc.).
- `src/routes/`: Centralized route definitions in `routes.tsx`.
- `src/styles/`: Theme definitions (`Themes.tsx`) and global variables.

## Building and Running

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Compile TypeScript and build for production. |
| `npm run lint` | Run ESLint to check for code quality issues. |
| `npm run preview` | Preview the production build locally. |

## Development Conventions

### Styling
- Use **styled-components** for all component-specific styles.
- Access theme variables (colors, fonts, etc.) via the `theme` prop provided by `ThemeProvider`.
- Definitions for `Light` and `Dark` themes are located in `src/styles/Themes.tsx`.

### State Management
- Local state is handled via React hooks (`useState`, `useEffect`).
- Theme state is managed in `App.tsx` and shared via `ThemeContext`.

### Routing
- All routes should be defined within `src/routes/routes.tsx`.
- Use `<Link>` or `useNavigate` from `react-router-dom` for navigation.

### Coding Standards
- **Naming:** Use PascalCase for components and files (e.g., `Sidebar.tsx`). Use camelCase for variables and functions.
- **Type Safety:** Always define interfaces or types for component props and data structures.
- **Icons:** Prefer `react-icons` for consistency.

## Key Files
- `package.json`: Project dependencies and scripts.
- `src/App.tsx`: Layout and Theme provider setup.
- `src/routes/routes.tsx`: Navigation mapping.
- `src/styles/Themes.tsx`: Color palettes and design tokens.
