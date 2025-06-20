import { Asset, AssetDefinition } from '@/types/domains/assets/';
import { Liability, Expense, Income } from '@/types/domains/financial/';
import { FinancialSummary } from '../interfaces/IAnalyticsService';
import { incomeCalculatorService } from '@service/domain/financial/income/incomeCalculatorService';
import { expenseCalculatorService } from '@service/domain/financial/expenses/expenseCalculatorService';
import { liabilityCalculatorService } from '@service/domain/financial/liabilities/liabilityCalculatorService';
import { assetCalculatorService } from '@service/domain/assets/calculations/assetCalculatorService';
import { financialCalculatorService } from '@service/domain/financial/calculations/financialCalculatorService';
import { calculatePortfolioPositions } from '@service/domain/portfolio/management/portfolioService/portfolioCalculations';

export const calculateFinancialSummary = (
  assets: Asset[],
  liabilities: Liability[],
  expenses: Expense[],
  income: Income[],
  assetDefinitions: AssetDefinition[] = []
): FinancialSummary => {
  const totalAssets = assetCalculatorService.calculateTotalAssetValue(assets);
  const totalLiabilities = liabilityCalculatorService.calculateTotalDebt(liabilities);
  const netWorth = financialCalculatorService.calculateNetWorth(totalAssets, totalLiabilities);
  const monthlyIncome = incomeCalculatorService.calculateTotalMonthlyIncome(income);
  const monthlyExpenses = expenseCalculatorService.calculateTotalMonthlyExpenses(expenses);
  const monthlyLiabilityPayments = liabilityCalculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
  const portfolioPositions = calculatePortfolioPositions(assets, assetDefinitions);
  const monthlyAssetIncome = portfolioPositions.reduce((sum: number, pos: any) => sum + pos.monthlyIncome, 0);
  
  const passiveIncome = incomeCalculatorService.calculatePassiveIncome(income);
  
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;
  const totalPassiveIncome = passiveIncome + monthlyAssetIncome;
  const totalMonthlyExpenses = monthlyExpenses + monthlyLiabilityPayments;
  const monthlyCashFlow = financialCalculatorService.calculateMonthlyCashFlow(
    totalMonthlyIncome,
    monthlyExpenses,
    monthlyLiabilityPayments
  );

  return {
    netWorth,
    totalAssets,
    totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlyLiabilityPayments,
    monthlyAssetIncome,
    passiveIncome,
    monthlyCashFlow,
    totalMonthlyIncome,
    totalPassiveIncome,
    totalMonthlyExpenses
  };
};
