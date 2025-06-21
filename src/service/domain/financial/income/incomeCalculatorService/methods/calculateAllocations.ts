// Re-export from shared allocation calculations with proper imports
import { Transaction as Asset } from '@/types/domains/assets/entities';
import { IncomeAllocation } from '@/types/domains/portfolio/allocations';
import { Income } from '@/types/domains/financial/entities';
import { calculateIncomeAllocation as sharedCalculateIncomeAllocation, calculateAssetAllocation } from '../../../../../shared/calculations/allocationCalculations';
import { calculateMonthlyIncome } from '../methods/calculateIncome';
import { calculateAssetMonthlyIncome } from '../../../../assets/calculations/assetCalculatorService/methods/calculateAssetIncomeCore';

export const calculateIncomeAllocation = (income: Income[], assets: Asset[]): IncomeAllocation[] => {
  return sharedCalculateIncomeAllocation(income, assets, calculateMonthlyIncome, calculateAssetMonthlyIncome);
};

export { calculateAssetAllocation };
