/**
 * RUTAS DE LA APLICACIÓN
 * Fuente única de verdad para la navegación y el router.
 * Se utiliza un objeto con 'as const' para compatibilidad con 'erasableSyntaxOnly'.
 */
export const ROUTES = {
    LOGIN: "/",
    REGISTER: "/register",
    HOME: "/home",
    PRODUCTOS: "/productos",
    POS: "/pos",
    POS_APERTURA: "/pos/apertura",
    ESTADISTICAS: "/estadisticas",
    DIAGRAMAS: "/diagramas",
    REPORTES: "/reportes",
    CONFIG: "/config",
    ROLES: "/roles",
    CATEGORIAS: "/categorias",
    MEDIDAS: "/medidas",
    MONEDAS: "/monedas",
    INVENTARIO: "/inventario",
    PROVEEDORES: "/proveedores",
    COMPRAS: "/compras",
    KARDEX: "/reportes/kardex",
    SELECT_SYSTEM: "/select-system",
    MECANICAS: "/orion/mecanicas",
    DISPOSITIVOS: "/dispositivos",
    ESTATUS: "/estatus",
    ESTACIONES: "/estaciones",
    EMPRESAS: "/empresas",
    SUCURSALES: "/sucursales",
    USUARIOS: "/usuarios",
} as const;

// Tipo opcional para usar ROUTES como tipo si fuera necesario
export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
