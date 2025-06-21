import { Asset, AssetDefinition } from '@/types/domains/assets/';
import { Liability, Expense, Income } from '@/types/domains/financial/';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { incomeCalculatorService } from '@service/domain/financial/income/incomeCalculatorService';
import { expenseCalculatorService } from '@service/domain/financial/expenses/expenseCalculatorService';
import { liabilityCalculatorService } from '@service/domain/financial/liabilities/liabilityCalculatorService';
import { financialCalculatorService } from '@service/domain/financial/calculations/financialCalculatorService';
import { calculatePortfolioPositions } from '@service/domain/portfolio/management/portfolioService/portfolioCalculations';
import { FinancialSummary } from '@/types/domains/analytics';

export const calculateFinancialSummary = (
  assets: Asset[],
  liabilities: Liability[],
  expenses: Expense[],
  income: Income[],
  assetDefinitions: AssetDefinition[] = []
): FinancialSummary => {
  // Calculate portfolio positions to get the correct asset values (considering buy/sell transactions)
  const portfolioPositions = calculatePortfolioPositions(assets, assetDefinitions);
  const totalAssets = portfolioPositions.reduce((sum: number, pos: PortfolioPosition) => sum + pos.currentValue, 0);
  
  const totalLiabilities = liabilityCalculatorService.calculateTotalDebt(liabilities);
  const netWorth = financialCalculatorService.calculateNetWorth(totalAssets, totalLiabilities);
  const monthlyIncome = incomeCalculatorService.calculateTotalMonthlyIncome(income);
  const monthlyExpenses = expenseCalculatorService.calculateTotalMonthlyExpenses(expenses);
  const monthlyLiabilityPayments = liabilityCalculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
  const monthlyAssetIncome = portfolioPositions.reduce((sum: number, pos: PortfolioPosition) => sum + pos.monthlyIncome, 0);
  
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
