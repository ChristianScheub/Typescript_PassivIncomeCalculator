import { 
  Income, 
  Expense, 
  Liability
} from '../../../../types/domains/financial/';
import { Transaction as Asset } from '../../../../types/domains/assets/';
import Logger from '../../../Logger/logger';

// Lokaler Type für diese spezielle Projektions-Funktion
interface CalculatorProjection {
  month: string;
  activeIncome: number;
  passiveIncome: number;
  assetIncome: number;
  expenseTotal: number;
  liabilityPayments: number;
  incomeTotal: number;
  netCashFlow: number;
  passiveIncomeCoverage: number;
}
import { calculateTotalMonthlyExpenses } from '../expense/calculateExpenses';
import { calculateTotalMonthlyLiabilityPayments } from '../liability/calculateLiabilities';
import { calculatePassiveIncome,calculateTotalMonthlyIncome } from '../income/calculateIncome';
import { calculateTotalAssetIncomeForMonth } from '../asset/calculateAssetIncome';

export const calculateProjections = (
  income: Income[],
  expenses: Expense[],
  liabilities: Liability[],
  assets: Asset[] = [],
  months = 12
): CalculatorProjection[] => {
  const projections: CalculatorProjection[] = [];
  
  // Calculate monthly income
  const monthlyIncome = calculateTotalMonthlyIncome(income);
  
  // Calculate monthly expenses
  const monthlyExpenses = calculateTotalMonthlyExpenses(expenses);
  
  // Calculate monthly liability payments
  const monthlyLiabilityPayments = calculateTotalMonthlyLiabilityPayments(liabilities);
  
  // Calculate passive income from income sources only
  const passiveIncome = calculatePassiveIncome(income);
  
  Logger.infoService(`Starting projection calculations - monthlyIncome: ${monthlyIncome}, monthlyExpenses: ${monthlyExpenses}, monthlyLiabilityPayments: ${monthlyLiabilityPayments}, passiveIncome: ${passiveIncome}`);

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

    Logger.infoService(`Month ${monthNumber} (${currentDate.toLocaleDateString()}): Asset income: ${monthlyAssetIncome}, Total income: ${totalIncome}, Net cash flow: ${netCashFlow}`);
    projections.push(projection);
  }

  Logger.infoService(`Projections calculated - months: ${months}, final accumulated savings: ${accumulatedSavings}`);
  return projections;
};

// Optimierte Version die gecachte Werte aus dem Redux Store verwendet
export const calculateProjectionsWithCache = (
  baseValues: {
    totalMonthlyIncome: number;
    totalMonthlyExpenses: number;
    totalLiabilityPayments: number;
    passiveIncome: number;
  },
  monthlyAssetIncomeCache: Record<number, number>,
  months = 12
): CalculatorProjection[] => {
  const projections: CalculatorProjection[] = [];
  
  Logger.infoService(`Starting cached projection calculations - using cached base values and monthly asset income`);

  // Verwende bereits berechnete Basis-Werte
  const { totalMonthlyIncome, totalMonthlyExpenses, totalLiabilityPayments, passiveIncome } = baseValues;

  // Generate projections for each month
  let accumulatedSavings = 0;
  
  for (let i = 0; i < months; i++) {
    // Berechne das aktuelle Datum für den Monat
    const currentDate = new Date(new Date().getFullYear(), new Date().getMonth() + i, 1);
    const monthNumber = currentDate.getMonth() + 1; // 1-12
    
    // Verwende gecachtes Asset-Einkommen für diesen Monat
    const monthlyAssetIncome = monthlyAssetIncomeCache[monthNumber] || 0;
    
    const totalIncome = totalMonthlyIncome + passiveIncome + monthlyAssetIncome;
    const netCashFlow = totalIncome - totalMonthlyExpenses - totalLiabilityPayments;
    accumulatedSavings += netCashFlow;
    
    const totalMonthlyObligations = totalMonthlyExpenses + totalLiabilityPayments;
    const totalPassiveIncome = passiveIncome + monthlyAssetIncome;
    
    const projection = {
      month: currentDate.toISOString(),
      activeIncome: totalMonthlyIncome,
      passiveIncome: passiveIncome,
      assetIncome: monthlyAssetIncome,
      expenseTotal: totalMonthlyExpenses,
      liabilityPayments: totalLiabilityPayments,
      incomeTotal: totalIncome,
      netCashFlow: netCashFlow,
      passiveIncomeCoverage: totalMonthlyObligations > 0 ? totalPassiveIncome / totalMonthlyObligations : 0
    };

    Logger.cache(`Cached Month ${monthNumber} (${currentDate.toLocaleDateString()}): Asset income: ${monthlyAssetIncome} (cached), Total income: ${totalIncome}, Net cash flow: ${netCashFlow}`);
    projections.push(projection);
  }

  Logger.cache(`Cached projections calculated - months: ${months}, final accumulated savings: ${accumulatedSavings}`);
  return projections;
};
