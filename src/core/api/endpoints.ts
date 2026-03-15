export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  usuarios: '/usuarios',
  roles: '/roles',
  sucursales: '/sucursales',
  productos: {
    base: '/productos',
    byId: (id: string) => `/productos/${id}`,
  },
} as const;
