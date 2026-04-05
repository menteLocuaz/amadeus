# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (API expected at http://localhost:9090/api/v1)
npm run build     # tsc -b && vite build
npm run lint      # ESLint (flat config, ESLint 9)
npm run preview   # Preview production build
```

No test suite is configured.

## Architecture

**Groot-Type** is a multi-tenant retail dashboard (Spanish-language UI) built with React 19 + TypeScript + Vite.

### Directory layout

```
src/
├── core/
│   ├── api/          # Axios singleton (axiosClient) + ENDPOINTS map
│   ├── constants/    # Route path constants
│   ├── context/      # Legacy ThemeContext (mostly superseded by Zustand)
│   ├── styles/       # Light/Dark themes, global CSS variables
│   └── types/        # styled.d.ts (DefaultTheme declaration)
├── features/         # 18 business modules (see below)
├── routes/           # routes.tsx — all React Router definitions
└── shared/
    ├── components/
    │   ├── UI/       # Atomic components: atoms/, molecules/, organisms/
    │   └── Layouts/  # MainLayout (sidebar + content grid)
    └── store/        # Global Zustand stores
```

### Feature module structure

Each feature under `src/features/<name>/` follows this layered pattern:

```
services/    # API calls via axiosClient — defines TS interfaces for req/res
hooks/       # useXxxQueries (React Query), useXxxMutations, useXxx (composite)
pages/       # Page component (lazy-loaded in routes.tsx)
components/  # Feature-scoped components
```

### State management

| Store | Key | Persisted |
|---|---|---|
| `useAuthStore` | `user`, `token`, login/logout, `setSucursalActiva` | Yes (localStorage) |
| `useUIStore` | `theme`, `sidebarOpen` | Yes (localStorage) |
| `useCatalogStore` | categories, units, currencies, branches, statuses | No |

- **React Query** handles server state (staleTime 5 min, retry 1, no refetch-on-focus).
- `useCatalogStore` has an `isInitialized` guard to prevent duplicate fetches on mount.

### API layer

`src/core/api/axiosClient.ts` is a singleton with two interceptors:
1. **Request**: injects `Authorization: Bearer <token>` from `useAuthStore`.
2. **Response**: on 401/403 clears session and redirects to `/login` (guards against recursive calls during logout).

All endpoint strings live in `src/core/api/endpoints.ts` as an `ENDPOINTS` object keyed by domain (auth, productos, inventario, compras, pos, etc.).

### Routing

`src/routes/routes.tsx` defines all 28 routes using `React.lazy` + `Suspense`. Public routes (login) render without `MainLayout`; all other routes are wrapped in `ProtectedRoute` (checks token) and nested under `MainLayout`.

### Styling conventions

- **styled-components** for all styles; never inline styles or CSS modules.
- Access design tokens via the `theme` prop: `${({ theme }) => theme.primaryColor}`.
- Use transient props (`$propName`) to avoid passing custom props to the DOM.
- Theme definitions: `src/core/styles/Themes.tsx` — primary `#FCA311`, secondary `#14213D`.

### Naming conventions

- PascalCase for component files and React components.
- camelCase for variables, functions, and hooks.
- Feature service files: `XxxService.ts`; hook files: `useXxx.ts` or `useXxxQueries.ts`.
- All UI text and identifiers are in Spanish.
