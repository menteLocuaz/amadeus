export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  usuarios: '/usuarios',
  roles: '/roles',
  sucursales: '/sucursales',
  products: {
    base: '/products',
    byId: (id: string) => `/products/${id}`,
  },
} as const;
