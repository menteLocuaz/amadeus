export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  usuarios: {
    base: '/usuarios',
    administrar: '/usuarios/administrar',
    byId: (id: string) => `/usuarios/${id}`,
  },
  roles: {
    base: '/roles',
    byId: (id: string) => `/roles/${id}`,
  },
  sucursales: {
    base: '/sucursales',
    byId: (id: string) => `/sucursales/${id}`,
  },
  estatus: {
    base: '/estatus',
    catalogo: '/estatus/catalogo',
    porTipo: (tipo: string) => `/estatus/tipo/${tipo}`,
    porModulo: (id: number) => `/estatus/modulo/${id}`,
  },
  productos: {
    base: '/productos',
    byId: (id: string) => `/productos/${id}`,
  },
  categorias: {
    base: '/categorias',
    byId: (id: string) => `/categorias/${id}`,
  },
  medidas: {
    base: '/medidas',
    byId: (id: string) => `/medidas/${id}`,
  },
  monedas: {
    base: '/monedas',
    byId: (id: string) => `/monedas/${id}`,
  },
  proveedores: {
    base: '/proveedores',
    byId: (id: string) => `/proveedores/${id}`,
  },
  compras: {
    base: '/compras',
    recepcion: '/compras/recepcion',
    byId: (id: string) => `/compras/${id}`,
  },
  inventario: {
    base: '/inventario',
    movimientos: '/inventario/movimientos',
    movimientosByProduct: (id: string) => `/inventario/movimientos/${id}`,
  },
  ordenes: {
    base: '/ordenes',
    updateStatus: (id: string) => `/ordenes/${id}/status`,
  },
  agregadores: {
    base: '/agregadores',
    orden: '/agregadores/orden',
  },
  facturas: {
    base: '/facturas',
    completa: '/facturas/completa',
    impuestos: '/facturas/impuestos',
    formasPago: '/facturas/formas-pago',
  },
  cajas: {
    base: '/cajas',
    byEstacion: (id: string) => `/cajas/estacion/${id}`,
  },
  periodos: {
    base: '/periodos',
    abrir: '/periodos/abrir',
    cerrar: (id: string) => `/periodos/cerrar/${id}`,
    activo: '/periodos/activo',
  },
  pos: {
    base: '/pos',
    abrir: '/pos/abrir',
    desmontar: '/pos/desmontar',
    actualizarValores: '/pos/actualizar-valores',
    estado: (id_estacion: string) => `/pos/estado/${id_estacion}`,
  },
  empresas: {
    base: '/empresas',
    byId: (id: string) => `/empresas/${id}`,
  },
  estacionesPos: {
    base: '/estaciones-pos',
    byId: (id: string) => `/estaciones-pos/${id}`,
  },
  dispositivosPos: {
    base: '/dispositivos-pos',
    byId: (id: string) => `/dispositivos-pos/${id}`,
  },
} as const;
