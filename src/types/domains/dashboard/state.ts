/**
 * Dashboard state types
 */

export type DashboardStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AssetAllocation {
  name: string;
  type: string;
  value: number;
  percentage: number;
}

export interface DashboardState {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
  passiveIncomeRatio: number;
  assetAllocation: AssetAllocation[];
  totalAssetGain: number;
  totalAssetGainPercentage: number;
  status: DashboardStatus;
  error: string | null;
}

export interface DashboardMetrics {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
}
