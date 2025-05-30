import { Income, Expense, Liability, MonthlyProjection, Asset } from '../../../types';
import Logger from '../../Logger/logger';
import { calculateTotalMonthlyIncome } from './calculateIncome';
import { calculateTotalMonthlyExpenses } from './calculateExpenses';
import { calculateTotalMonthlyLiabilityPayments } from './calculateLiabilities';
import { calculatePassiveIncome } from './calculateIncome';
import { calculateTotalAssetIncomeForMonth } from './calculateAssetIncome';

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
  
  // Calculate passive income from income sources only
  const passiveIncome = calculatePassiveIncome(income);
  
  Logger.info(`Starting projection calculations - monthlyIncome: ${monthlyIncome}, monthlyExpenses: ${monthlyExpenses}, monthlyLiabilityPayments: ${monthlyLiabilityPayments}, passiveIncome: ${passiveIncome}`);

  // Generate projections for each month
  let accumulatedSavings = 0;
  
  for (let i = 0; i < months; i++) {
    // Berechne das aktuelle Datum für den Monat
    const currentDate = new Date(new Date().getFullYear(), new Date().getMonth() + i, 1);
    const monthNumber = currentDate.getMonth() + 1; // 1-12
    
    // Berechne Asset-Einkommen für diesen spezifischen Monat (berücksichtigt Dividendentermine)
    const monthlyAssetIncome = calculateTotalAssetIncomeForMonth(assets, monthNumber);
    
    const totalIncome = monthlyIncome + passiveIncome + monthlyAssetIncome;
    const netCashFlow = totalIncome - monthlyExpenses - monthlyLiabilityPayments;
    accumulatedSavings += netCashFlow;
    
    const totalMonthlyObligations = monthlyExpenses + monthlyLiabilityPayments;
    const totalPassiveIncome = passiveIncome + monthlyAssetIncome;
    
    const projection = {
      month: currentDate.toISOString(),
      activeIncome: monthlyIncome,
      passiveIncome: passiveIncome,
      assetIncome: monthlyAssetIncome,
      expenseTotal: monthlyExpenses,
      liabilityPayments: monthlyLiabilityPayments,
      incomeTotal: totalIncome,
      netCashFlow: netCashFlow,
      passiveIncomeCoverage: totalMonthlyObligations > 0 ? totalPassiveIncome / totalMonthlyObligations : 0
    };

    Logger.info(`Month ${monthNumber} (${currentDate.toLocaleDateString()}): Asset income: ${monthlyAssetIncome}, Total income: ${totalIncome}, Net cash flow: ${netCashFlow}`);
    projections.push(projection);
  }

  Logger.info(`Projections calculated - months: ${months}, final accumulated savings: ${accumulatedSavings}`);
  return projections;
};
