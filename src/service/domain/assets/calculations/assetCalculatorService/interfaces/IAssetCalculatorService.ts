import { Transaction as Asset } from '@/types/domains/assets/';
import { AssetAllocation } from '@/types/domains/portfolio/';

export interface IAssetCalculatorService {
  // Basic asset calculations
  calculateAssetMonthlyIncome: (asset: Asset) => number;
  calculateAssetIncomeForMonth: (asset: Asset, monthNumber: number) => number;
  calculateTotalAssetValue: (assets: Asset[]) => number;
  calculateLiquidAssetValue: (assets: Asset[]) => number;
  calculateTotalMonthlyAssetIncome: (assets: Asset[]) => number;
  calculateTotalAssetIncomeForMonth: (assets: Asset[], monthNumber: number) => number;
  calculateAnnualAssetIncome: (monthlyIncome: number) => number;
  
  // Asset allocation analysis
  calculateAssetAllocation: (assets: Asset[]) => AssetAllocation[];
  
  // Cached asset calculations
  calculateAssetMonthlyIncomeWithCache?: (asset: Asset) => { 
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
  calculateTotalAssetIncomeForMonthWithCache?: (assets: Asset[], monthNumber: number) => number;
  
  // Cache status helpers
  areAssetsCached?: (assets: Asset[]) => boolean;
}
