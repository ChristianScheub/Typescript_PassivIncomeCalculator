import { Transaction as Asset } from "@/types/domains/assets/entities";
import Logger from "@/service/shared/logging/Logger/logger";
import { calculateAssetMonthlyIncomeWithCache } from "@/service/shared/calculations/assetIncomeCalculations";
import { calculateTotalAssetIncomeForMonthFromCache } from "@/service/shared/cache/assetIncomeCacheUtils";

// New function to calculate total asset income for a specific month with cache
export const calculateTotalAssetIncomeForMonthWithCache = (
  assets: Asset[],
  monthNumber: number
): number => {
  // First try pure cache approach for best performance
  const cachedTotal = calculateTotalAssetIncomeForMonthFromCache(assets, monthNumber);
  if (cachedTotal !== null) {
    return cachedTotal;
  }
  
  // Directly calculate using individual asset calculations with cache
  let totalIncome = 0;
  
  for (const asset of assets) {
    const result = calculateAssetMonthlyIncomeWithCache(asset);
    totalIncome += (result.monthlyBreakdown[monthNumber] || 0);
  }
  
  Logger.cache(`Calculated total income for month ${monthNumber} with mixed cache: ${totalIncome}`);
  return totalIncome;
};
