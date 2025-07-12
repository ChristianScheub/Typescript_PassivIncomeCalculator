import { FinancialSummary, FinancialRatios } from '@/types/domains/analytics/reporting';

export const calculateRatios = (summary: FinancialSummary): FinancialRatios => {
  const {
    totalMonthlyIncome,
    totalPassiveIncome,
    totalMonthlyExpenses,
    monthlyCashFlow,
    totalAssets,
    totalLiabilities
  } = summary;

  return {
    passiveRatio: totalPassiveIncome / Math.max(totalMonthlyIncome, 1) * 100,
    expenseCoverage: totalPassiveIncome / Math.max(totalMonthlyExpenses, 1) * 100,
    debtRatio: totalLiabilities / Math.max(totalAssets, 1) * 100,
    savingsRate: monthlyCashFlow / Math.max(totalMonthlyIncome, 1) * 100
  };
};
