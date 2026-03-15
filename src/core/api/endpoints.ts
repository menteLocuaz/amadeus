export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  usuarios: '/usuarios',
  roles: {
    base: '/roles',
    byId: (id: string) => `/roles/${id}`,
  },
  sucursales: '/sucursales',
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
} as const;
