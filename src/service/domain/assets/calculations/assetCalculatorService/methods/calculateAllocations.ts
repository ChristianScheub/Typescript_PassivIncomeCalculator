// Re-export from shared allocation calculations with proper imports
import { Transaction as Asset } from '../../../../../../types/domains/assets';
import { IncomeAllocation } from '../../../../../../types/domains/portfolio';
import { Income } from '../../../../../../types/domains/financial';
import { calculateIncomeAllocation as sharedCalculateIncomeAllocation, calculateAssetAllocation } from '../../../../../shared/calculations/allocationCalculations';
import { calculateMonthlyIncome } from '../../../../financial/income/incomeCalculatorService/methods/calculateIncome';
import { calculateAssetMonthlyIncome } from './calculateAssetIncome';

export const calculateIncomeAllocation = (income: Income[], assets: Asset[]): IncomeAllocation[] => {
  return sharedCalculateIncomeAllocation(income, assets, calculateMonthlyIncome, calculateAssetMonthlyIncome);
};

export { calculateAssetAllocation };
