/**
 * Calculator projection types
 */

export interface CalculatorProjection {
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

export interface ProjectionParameters {
  timeHorizon: number;
  inflationRate: number;
  growthAssumptions: Record<string, number>;
}
