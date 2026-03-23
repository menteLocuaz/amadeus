import { useQuery } from '@tanstack/react-query';
import { EstatusService } from '../../auth/services/EstatusService';
import { SucursalService } from '../services/SucursalService';
import { EmpresaService } from '../services/EmpresaService';
import { MonedaService } from '../../products/services/MonedaService';
import { ProductService } from '../../products/services/ProductService';
import { extractData } from './useProveedoresQuery';

export const commonKeys = {
    statuses: (modulo: number) => ['statuses', modulo] as const,
    sucursales: ['sucursales'] as const,
    empresas: ['empresas'] as const,
    monedas: ['monedas'] as const,
    products: ['products'] as const,
};

export const useStatuses = (modulo: number = 2) => {
    return useQuery({
        queryKey: commonKeys.statuses(modulo),
        queryFn: async () => {
            const res = await EstatusService.getByModulo(modulo);
            return extractData(res);
        },
    });
};

export const useSucursales = () => {
    return useQuery({
        queryKey: commonKeys.sucursales,
        queryFn: async () => {
            const res = await SucursalService.getAll();
            return extractData(res);
        },
    });
};

export const useEmpresas = () => {
    return useQuery({
        queryKey: commonKeys.empresas,
        queryFn: async () => {
            const res = await EmpresaService.getAll();
            return extractData(res);
        },
    });
};

export const useMonedas = () => {
    return useQuery({
        queryKey: commonKeys.monedas,
        queryFn: async () => {
            const res = await MonedaService.getAll();
            return extractData(res);
        },
    });
};

export const useProducts = () => {
    return useQuery({
        queryKey: commonKeys.products,
        queryFn: async () => {
            const res = await ProductService.getAll();
            return extractData(res);
        },
    });
};
