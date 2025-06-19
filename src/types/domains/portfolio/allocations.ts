/**
 * Portfolio domain - Allocations and Distribution
 */

import { AssetType, IncomeType } from '../../shared/base/enums';

export interface AssetAllocation {
  type: AssetType;
  value: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface IncomeAllocation {
  type: IncomeType;
  value: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface SectorAllocation {
  sector: string;
  sectorName?: string; // Legacy compatibility
  value: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface GeographicAllocation {
  region: string;
  country?: string;
  value: number;
  percentage: number;
  count: number;
  color?: string;
}

export interface AllocationBreakdown {
  assetAllocation: AssetAllocation[];
  incomeAllocation: IncomeAllocation[];
  sectorAllocation: SectorAllocation[];
  geographicAllocation: GeographicAllocation[];
}

export interface AllocationTarget {
  type: AssetType | IncomeType;
  targetPercentage: number;
  currentPercentage: number;
  deviation: number;
  rebalanceNeeded: boolean;
}

export interface RebalanceRecommendation {
  target: AllocationTarget;
  recommendedAction: 'buy' | 'sell' | 'hold';
  amount: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

// Generic breakdown interface for portfolio analytics
export interface CategoryBreakdown {
  name: string;
  value: number;
  percentage: number;
  count?: number;
  color?: string;
}
