import { Asset } from "@/types/domains/assets/entities";
import Logger from "@/service/shared/logging/Logger/logger";
import { getCachedDividendData } from "@/utils/dividendCacheUtils";
import {
  calculateDividendSchedule,
  calculateDividendForMonth,
} from "../../domain/financial/income/incomeCalculatorService/methods/calculatePayment";
import { getCurrentQuantity } from "@/utils/transactionCalculations";

// Helper: Stock dividend calculation with breakdown
export function getStockDividendBreakdown(asset: Asset) {
  if (asset.type !== "stock") return null;
  
  const dividendInfo = asset.assetDefinition?.dividendInfo;
  
  if (!dividendInfo) return null;
  
  // Use getCurrentQuantity helper function
  const quantity = getCurrentQuantity(asset);
  if (quantity <= 0) return null;
  
  const dividendResult = calculateDividendSchedule(dividendInfo, quantity);
  const monthlyAmount = isFinite(dividendResult.monthlyAmount) ? dividendResult.monthlyAmount : 0;
  const annualAmount = isFinite(dividendResult.annualAmount) ? dividendResult.annualAmount : 0;
  const monthlyBreakdown: Record<number, number> = {};
  for (let month = 1; month <= 12; month++) {
    const monthlyDividend = calculateDividendForMonth(dividendInfo, quantity, month);
    monthlyBreakdown[month] = isFinite(monthlyDividend) ? monthlyDividend : 0;
  }
  return { monthlyAmount, annualAmount, monthlyBreakdown };
}

// Helper: Bond/cash interest calculation with breakdown
export function getInterestBreakdown(asset: Asset) {
  if ((asset.type !== "bond" && asset.type !== "cash")) return null;
  
  const interestRate = asset.assetDefinition?.bondInfo?.interestRate;
  
  if (interestRate === undefined || !asset.value) return null;
  
  const annualInterest = interestRate * asset.value / 100;
  const monthlyAmount = annualInterest / 12;
  const annualAmount = annualInterest;
  const monthlyBreakdown: Record<number, number> = {};
  for (let month = 1; month <= 12; month++) {
    monthlyBreakdown[month] = monthlyAmount;
  }
  return { monthlyAmount, annualAmount, monthlyBreakdown };
}

// Helper: Real estate rental calculation with breakdown
export function getRealEstateBreakdown(asset: Asset) {
  if (asset.type !== "real_estate") return null;
  
  const definitionRentalInfo = asset.assetDefinition?.rentalInfo;
  
  let monthlyAmount: number | undefined;
  
  if (definitionRentalInfo?.baseRent !== undefined) {
    monthlyAmount = definitionRentalInfo.baseRent;
  }
  
  if (monthlyAmount === undefined) return null;
  
  const finalMonthlyAmount = isFinite(monthlyAmount) ? monthlyAmount : 0;
  const annualAmount = finalMonthlyAmount * 12;
  const monthlyBreakdown: Record<number, number> = {};
  for (let month = 1; month <= 12; month++) {
    monthlyBreakdown[month] = finalMonthlyAmount;
  }
  return { monthlyAmount: finalMonthlyAmount, annualAmount, monthlyBreakdown };
}

// Refactored breakdown logic
export function calculateAssetIncomeBreakdown(asset: Asset) {
  return (
    getStockDividendBreakdown(asset) ||
    getInterestBreakdown(asset) ||
    getRealEstateBreakdown(asset) ||
    { monthlyAmount: 0, annualAmount: 0, monthlyBreakdown: {} }
  );
}

// Calculate asset monthly income with cache - shared implementation
export const calculateAssetMonthlyIncomeWithCache = (
  asset: Asset
): {
  monthlyAmount: number;
  annualAmount: number;
  monthlyBreakdown: Record<number, number>;
  cacheHit: boolean;
  cacheDataToUpdate?: {
    monthlyAmount: number;
    annualAmount: number;
    monthlyBreakdown: Record<number, number>;
  };
} => {
  // Check if we have valid cached data
  const cachedData = getCachedDividendData(asset);
  if (cachedData) {
    Logger.cache(
      `Cache hit for asset ${asset.name}, returning cached dividend data`
    );
    return {
      monthlyAmount: cachedData.monthlyAmount || 0,
      annualAmount: cachedData.annualAmount || 0,
      monthlyBreakdown: cachedData.monthlyBreakdown || {},
      cacheHit: true,
    };
  }
  
  Logger.infoService(
    `Cache miss for asset ${asset.name}, no cached dividend data available`
  );

  // Use a helper to calculate all values and reduce complexity
  const { monthlyAmount, annualAmount, monthlyBreakdown } = calculateAssetIncomeBreakdown(asset);

  return {
    monthlyAmount,
    annualAmount,
    monthlyBreakdown,
    cacheHit: false,
    cacheDataToUpdate: {
      monthlyAmount,
      annualAmount,
      monthlyBreakdown,
    },
  };
};
