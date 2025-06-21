import { Asset } from '@/types/domains/assets';
import { Income, Expense, Liability } from '@/types/domains/financial';
import { calculatorService } from '../service';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export interface SortableItem {
  id: string;
  name: string;
}

// Generic sorting function
export const sortItems = <T extends SortableItem>(
  items: T[],
  getValue: (item: T) => number,
  order: SortOrder = SortOrder.DESC
): T[] => {
  return [...items].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);
    
    if (order === SortOrder.ASC) {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });
};

// Specific sorting functions for each entity type

/**
 * Sort assets by their value (highest to lowest by default)
 */
export const sortAssets = (assets: Asset[], order: SortOrder = SortOrder.DESC): Asset[] => {
  return sortItems(assets, (asset) => asset.value, order);
};

/**
 * Sort liabilities by their current balance (highest to lowest by default)
 */
export const sortLiabilities = (liabilities: Liability[], order: SortOrder = SortOrder.DESC): Liability[] => {
  return sortItems(liabilities, (liability) => liability.currentBalance, order);
};

/**
 * Sort income by monthly amount (highest to lowest by default)
 */
export const sortIncome = (incomes: Income[], order: SortOrder = SortOrder.DESC): Income[] => {
  return sortItems(incomes, (income) => calculatorService.calculateMonthlyIncome(income), order);
};

/**
 * Sort expenses by monthly amount (highest to lowest by default)
 */
export const sortExpenses = (expenses: Expense[], order: SortOrder = SortOrder.DESC): Expense[] => {
  return sortItems(expenses, (expense) => calculatorService.calculateMonthlyExpense(expense), order);
};

/**
 * Sort assets by monthly income (highest to lowest by default)
 */
export const sortAssetsByIncome = (assets: Asset[], order: SortOrder = SortOrder.DESC): Asset[] => {
  // Use cache-aware calculation for performance
  return sortItems(assets, (asset) => {
    const result = calculatorService.calculateAssetMonthlyIncomeWithCache?.(asset);
    return result ? result.monthlyAmount : calculatorService.calculateAssetMonthlyIncome(asset);
  }, order);
};

/**
 * Sort liabilities by monthly payment (highest to lowest by default)
 */
export const sortLiabilitiesByPayment = (liabilities: Liability[], order: SortOrder = SortOrder.DESC): Liability[] => {
  return sortItems(liabilities, (liability) => calculatorService.calculateLiabilityMonthlyPayment(liability), order);
};
