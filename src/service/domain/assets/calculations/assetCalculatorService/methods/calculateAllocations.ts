// Re-export from shared allocation calculations with proper imports
import { Transaction as Asset } from '@/types/domains/assets';
import { IncomeAllocation } from '@/types/domains/portfolio';
import { Income } from '@/types/domains/financial';
import { calculateIncomeAllocation as sharedCalculateIncomeAllocation, calculateAssetAllocation } from '../../../../../shared/calculations/allocationCalculations';
import { calculateMonthlyIncome } from '../../../../financial/income/incomeCalculatorService/methods/calculateIncome';
import { calculateAssetMonthlyIncomeWithCache } from '../../../../../shared/calculations/assetIncomeCalculations';

export const calculateIncomeAllocation = (income: Income[], assets: Asset[]): IncomeAllocation[] => {
  // Use cache-aware calculation and extract just the monthly amount
  const cacheAwareAssetCalculation = (asset: Asset): number => {
    const result = calculateAssetMonthlyIncomeWithCache(asset);
    return result.monthlyAmount;
  };
  
  return sharedCalculateIncomeAllocation(income, assets, calculateMonthlyIncome, cacheAwareAssetCalculation);
};

export { calculateAssetAllocation };
