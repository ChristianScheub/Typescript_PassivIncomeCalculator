import Logger from "@/service/shared/logging/Logger/logger";

// Helper function: Prüfe, ob alle Werte in financialSummary auf 0 sind
export const isFinancialSummaryAllZero = (summary: any): boolean => {
  if (!summary) return false;
  const keys = [
    'monthlyAssetIncome',
    'monthlyCashFlow',
    'monthlyExpenses',
    'monthlyIncome',
    'monthlyLiabilityPayments',
    'netWorth',
    'passiveIncome',
    'totalAssets',
    'totalLiabilities',
    'totalMonthlyExpenses',
    'totalMonthlyIncome',
    'totalPassiveIncome'
  ];
  const values = keys.map(key => (key in summary ? summary[key] : 0));
  Logger.info('isFinancialSummaryAllZero: ' + JSON.stringify(Object.fromEntries(keys.map((k, i) => [k, values[i]]))));
  return values.every(v => typeof v === 'number' && v === 0);
};