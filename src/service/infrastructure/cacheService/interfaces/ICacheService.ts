import { Transaction as Asset } from '@/types/domains/assets/';

export interface ICacheService {
  // Asset income cache methods
  calculateAssetMonthlyIncomeWithCache: (asset: Asset) => { 
    monthlyAmount: number; 
    annualAmount: number; 
    monthlyBreakdown: Record<number, number>;
    cacheHit: boolean;
    cacheDataToUpdate?: {
      monthlyAmount: number;
      annualAmount: number;
      monthlyBreakdown: Record<number, number>;
    };
  };
  
  // Cache management
  clearCache: () => void;
  getCacheStats: () => {
    assetCacheCount: number;
    portfolioCacheCount: number;
    lastCacheUpdate: string;
  };
}
