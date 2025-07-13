import { 
  Income, 
  Expense, 
  Liability
} from '@/types/domains/financial';
import { Transaction as Asset } from '@/types/domains/assets';
import { CalculatorProjection } from '@/types/domains/analytics/calculations';
import { MonthlyProjection } from '@/types/domains/analytics/projections';
import Logger from "@/service/shared/logging/Logger/logger";
import { calculateTotalMonthlyExpenses } from '../../../../financial/expenses/expenseCalculatorService/methods/calculateExpenses';
import { calculateTotalMonthlyLiabilityPayments } from '../../../../financial/liabilities/liabilityCalculatorService/methods/calculateLiabilities';
import { calculatePassiveIncome, calculateTotalMonthlyIncome } from '../../../../financial/income/incomeCalculatorService/methods/calculateIncome';
import { calculateTotalAssetIncomeForMonth } from '../../../../assets/calculations/assetCalculatorService/methods/calculateAssetIncome';

interface RawProjectionData {
  month?: Date | string;
  netCashFlow?: number;
  incomeTotal?: number;
  expenseTotal?: number;
  liabilityTotal?: number;
  assetIncomeBreakdown?: {
    dividends?: number;
    bonds?: number;
    realEstate?: number;
    crypto?: number;
    commodities?: number;
    other?: number;
  };
  expenseBreakdown?: { [key: string]: number };
  liabilityBreakdown?: { [key: string]: number };
}

function mapCalculatorToMonthlyProjection(
  projections: RawProjectionData[]
): MonthlyProjection[] {
  let cumulativeCashFlow = 0;
  return projections.map((p) => {
    cumulativeCashFlow += p.netCashFlow ?? 0;
    const dateObj = p.month ? new Date(p.month) : new Date();
    return {
      month: dateObj.getMonth() + 1,
      year: dateObj.getFullYear(),
      totalIncome: p.incomeTotal ?? 0,
      totalExpenses: p.expenseTotal ?? 0,
      totalLiabilities: p.liabilityPayments ?? 0,
      netCashFlow: p.netCashFlow ?? 0,
      cumulativeCashFlow,
      assetIncomeBreakdown: {
        dividends: p.assetIncome ?? 0,
        bonds: 0,
        realEstate: 0,
        crypto: 0,
        commodities: 0,
        other: 0,
      },
      expenseBreakdown: {},
      liabilityBreakdown: {},
      date: p.month ?? new Date().toISOString(),
      passiveIncomeCoverage: p.passiveIncomeCoverage ?? 0, // Pass through from calculator
    };
  });
}

export const calculateProjections = (
  income: Income[],
  expenses: Expense[],
  liabilities: Liability[],
  assets: Asset[] = [],
  months = 12
): MonthlyProjection[] => {
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
  return mapCalculatorToMonthlyProjection(projections);
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
): MonthlyProjection[] => {
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
  return mapCalculatorToMonthlyProjection(projections);
};
