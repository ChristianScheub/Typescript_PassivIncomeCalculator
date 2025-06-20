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

/**
 * Analytics Calculation Domain Types
 * All business types related to financial analytics and calculations
 */

/**
 * Allocation Data - represents allocation percentages and values
 */
export interface AllocationData {
  name: string;
  value: number;
  percentage: number;
}

/**
 * Category Breakdown Data - detailed breakdown by category
 */
export interface CategoryBreakdownData {
  categoryName: string;
  categoryId: string;
  totalValue: number;
  totalPercentage: number;
  options: AllocationData[];
}

/**
 * Portfolio Analytics Data - comprehensive portfolio analysis
 */
export interface PortfolioAnalyticsData {
  assetAllocation: AllocationData[];
  sectorAllocation: AllocationData[];
  countryAllocation: AllocationData[];
  categoryAllocation: AllocationData[];
  categoryBreakdown: CategoryBreakdownData[];
}

/**
 * Income Analytics Data - income-related analytics
 */
export interface IncomeAnalyticsData {
  assetTypeIncome: AllocationData[];
  sectorIncome: AllocationData[];
  countryIncome: AllocationData[];
  categoryIncome: AllocationData[];
  categoryIncomeBreakdown: CategoryBreakdownData[];
}
