import { Income, Expense, Liability, MonthlyProjection, Asset } from '../../../types';
import Logger from '../../Logger/logger';
import { calculateTotalMonthlyIncome } from './calculateIncome';
import { calculateTotalMonthlyExpenses } from './calculateExpenses';
import { calculateTotalMonthlyLiabilityPayments } from './calculateLiabilities';
import { calculatePassiveIncome } from './calculateIncome';

export const calculateProjections = (
  income: Income[],
  expenses: Expense[],
  liabilities: Liability[],
  assets: Asset[] = [],
  months = 12
): MonthlyProjection[] => {
  const projections: MonthlyProjection[] = [];
  
  // Calculate monthly income
  const monthlyIncome = calculateTotalMonthlyIncome(income);
  
  // Calculate monthly expenses
  const monthlyExpenses = calculateTotalMonthlyExpenses(expenses);
  
  // Calculate monthly liability payments
  const monthlyLiabilityPayments = calculateTotalMonthlyLiabilityPayments(liabilities);
  
  // Calculate passive income
  const passiveIncome = calculatePassiveIncome(income, assets);
  
  Logger.info(`Starting projection calculations - monthlyIncome: ${monthlyIncome}, monthlyExpenses: ${monthlyExpenses}, monthlyLiabilityPayments: ${monthlyLiabilityPayments}, passiveIncome: ${passiveIncome}`);

  // Generate projections for each month
  let accumulatedSavings = 0;
  
  for (let i = 0; i < months; i++) {
    const totalIncome = monthlyIncome + passiveIncome;
    const netCashFlow = totalIncome - monthlyExpenses - monthlyLiabilityPayments;
    accumulatedSavings += netCashFlow;
    
    const projection = {
      month: new Date(new Date().getFullYear(), new Date().getMonth() + i, 1).toISOString(),
      activeIncome: monthlyIncome,
      passiveIncome: passiveIncome,
      assetIncome: passiveIncome, // Asset income is the same as passive income in this context
      expenseTotal: monthlyExpenses,
      liabilityPayments: monthlyLiabilityPayments,
      incomeTotal: totalIncome,
      netCashFlow: netCashFlow,
      passiveIncomeCoverage: monthlyExpenses > 0 ? passiveIncome / monthlyExpenses : 0
    };

    projections.push(projection);
  }

  Logger.info(`Projections calculated - months: ${months}, final accumulated savings: ${accumulatedSavings}`);
  return projections;
};
