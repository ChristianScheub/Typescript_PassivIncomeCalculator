import { Asset, Liability, Expense, Income, AssetDefinition } from '../../../types';
import { FinancialSummary } from '../interfaces/IAnalyticsService';
import calculatorService from '../../calculatorService';
import { calculatePortfolioPositions } from '../../portfolioService/portfolioCalculations';

export const calculateFinancialSummary = (
  assets: Asset[],
  liabilities: Liability[],
  expenses: Expense[],
  income: Income[],
  assetDefinitions: AssetDefinition[] = []
): FinancialSummary => {
  const totalAssets = calculatorService.calculateTotalAssetValue(assets);
  const totalLiabilities = calculatorService.calculateTotalDebt(liabilities);
  const netWorth = calculatorService.calculateNetWorth(totalAssets, totalLiabilities);
  const monthlyIncome = calculatorService.calculateTotalMonthlyIncome(income);
  const monthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);
  const monthlyLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
  const portfolioPositions = calculatePortfolioPositions(assets, assetDefinitions);
  const monthlyAssetIncome = portfolioPositions.reduce((sum, pos) => sum + pos.monthlyIncome, 0);
  
  const passiveIncome = calculatorService.calculatePassiveIncome(income);
  
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;
  const totalPassiveIncome = passiveIncome + monthlyAssetIncome;
  const totalMonthlyExpenses = monthlyExpenses + monthlyLiabilityPayments;
  const monthlyCashFlow = calculatorService.calculateMonthlyCashFlow(
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
