// ─── Roles Feature — Public API ───────────────────────────────────────────────
// Importa desde aquí en lugar de rutas internas:
//   import RolesPage from "@features/roles"
//   import { useRoles } from "@features/roles"

export { default }      from "./pages/RolesPage";
export { useRoles }     from "./hooks/useRoles";
export { RolesTable }   from "./components/RolesTable";
export { RolModal }     from "./components/RolModal";
export * from "./types";