import { Transaction as Asset } from "@/types/domains/assets/entities";
import Logger from "@/service/shared/logging/Logger/logger";
import { 
  getCachedDividendData
} from "../../../utils/dividendCacheUtils";

// Optimized function: Check if all assets have cached data
export const areAssetsCached = (assets: Asset[]): boolean => {
  return assets.every(asset => {
    const cachedData = getCachedDividendData(asset);
    return cachedData !== null;
  });
};

// Optimized function: Get total monthly income only from cached data
export const calculateTotalMonthlyAssetIncomeFromCache = (assets: Asset[]): number | null => {
  let totalIncome = 0;
  let allCached = true;

  Logger.cache(`Checking cache status for ${assets.length} assets`);

  for (const asset of assets) {
    const cachedData = getCachedDividendData(asset);
    if (cachedData?.monthlyAmount) {
      totalIncome += cachedData.monthlyAmount;
      Logger.cache(`Asset ${asset.name}: using cached income ${cachedData.monthlyAmount}`);
    } else {
      allCached = false;
      Logger.cache(`Asset ${asset.name}: no cached data available`);
      break; // Exit early if any asset is not cached
    }
  }

  if (allCached) {
    Logger.cache(`All assets cached, total monthly income: ${totalIncome}`);
    return totalIncome;
  } else {
    Logger.cache(`Not all assets cached, fallback to individual calculations needed`);
    return null;
  }
};

// Optimized function: Get total income for specific month only from cached data
export const calculateTotalAssetIncomeForMonthFromCache = (
  assets: Asset[], 
  monthNumber: number
): number | null => {
  let totalIncome = 0;
  let allCached = true;

  Logger.cache(`Checking cache status for ${assets.length} assets for month ${monthNumber}`);

  for (const asset of assets) {
    const cachedData = getCachedDividendData(asset);
    if (cachedData?.monthlyBreakdown) {
      const monthlyIncome = cachedData.monthlyBreakdown[monthNumber] || 0;
      totalIncome += monthlyIncome;
      Logger.cache(`Asset ${asset.name} month ${monthNumber}: using cached income ${monthlyIncome}`);
    } else {
      allCached = false;
      Logger.cache(`Asset ${asset.name} month ${monthNumber}: no cached data available`);
      break; // Exit early if any asset is not cached
    }
  }

  if (allCached) {
    Logger.cache(`All assets cached for month ${monthNumber}, total income: ${totalIncome}`);
    return totalIncome;
  } else {
    Logger.cache(`Not all assets cached for month ${monthNumber}, fallback needed`);
    return null;
  }
};
