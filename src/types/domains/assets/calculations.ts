/**
 * Asset domain calculations
 */

export interface CachedDividends {
  [key: string]: {
    annualDividend: number;
    lastCalculated: string;
    confidence: number;
  };
}

export interface AssetCalculation {
  assetId: string;
  currentValue: number;
  totalCost: number;
  unrealizedGain: number;
  unrealizedGainPercentage: number;
  realizedGain?: number;
  totalReturn?: number;
  annualizedReturn?: number;
  dividendYield?: number;
  lastCalculated: string;
}

export interface PortfolioCalculation {
  totalValue: number;
  totalCost: number;
  totalUnrealizedGain: number;
  totalRealizedGain: number;
  totalReturn: number;
  totalReturnPercentage: number;
  assetCalculations: AssetCalculation[];
  lastCalculated: string;
}
