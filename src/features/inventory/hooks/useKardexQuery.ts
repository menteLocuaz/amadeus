import { useQuery } from '@tanstack/react-query';
import { KardexService } from '../services/KardexService';

export const kardexKeys = {
    all: ['kardex'] as const,
    byProduct: (productId: string, start?: string, end?: string) => 
        [...kardexKeys.all, productId, { start, end }] as const,
};

export const useKardexData = (productId: string, startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: kardexKeys.byProduct(productId, startDate, endDate),
        queryFn: async () => {
            if (!productId) return [];
            const res = await KardexService.getMovimientos(productId, startDate, endDate);
            return res.success ? res.data : [];
        },
        enabled: !!productId,
    });
};
