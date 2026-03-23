import { useQuery } from '@tanstack/react-query';
import { EstatusService } from '../../auth/services/EstatusService';
import { SucursalService } from '../services/SucursalService';
import { EmpresaService } from '../services/EmpresaService';
import { extractData } from './useProveedoresQuery';

export const commonKeys = {
    statuses: (modulo: number) => ['statuses', modulo] as const,
    sucursales: ['sucursales'] as const,
    empresas: ['empresas'] as const,
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
