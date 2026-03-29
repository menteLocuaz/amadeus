// ─── Estatus Feature — Public API ─────────────────────────────────────────────
// Importa desde aquí en lugar de rutas internas:
//   import EstatusPage from "@features/estatus"
//   import { useEstatus } from "@features/estatus"

export { default } from "./pages/Estatuspage";
export { useEstatus } from "./hooks/useEstatus";
export { EstatusStats } from "./components/EstatusStats";
export { EstatusModal } from "./components/EstatusModal";
export { ModuleGroup } from "./components/ModuleGroup";
export * from "./constants";