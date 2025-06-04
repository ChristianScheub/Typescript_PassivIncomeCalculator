import { Asset } from "../../../types";
import Logger from "../../Logger/logger";
import {
  calculateDividendSchedule,
  calculateDividendForMonth,
} from "./calculatePayment";
import {
  getCachedDividendData,
  createCachedDividends,
} from "../../../utils/dividendCacheUtils";

export const calculateAssetMonthlyIncome = (asset: Asset): number => {
  // Zuerst prüfen, ob gecachte Daten vorhanden sind
  const cachedData = getCachedDividendData(asset);
  if (cachedData) {
    Logger.cache(`Cache hit for asset ${asset.name}, returning cached monthly income: ${cachedData.monthlyAmount}`);
    return cachedData.monthlyAmount || 0;
  }

  Logger.cache(`Cache miss for asset ${asset.name}, calculating monthly income`);
  let income = 0;

  Logger.infoService(
    `Calculating income for individual asset: ${asset.name} - Type: ${asset.type}`
  );

  // Handle stock dividend income
  if (asset.type === "stock" && asset.dividendInfo?.frequency && asset.quantity) {
    const dividendResult = calculateDividendSchedule(
      asset.dividendInfo,
      asset.quantity
    );
    Logger.infoService(
      `Individual dividend calculation result for ${asset.name}: ${JSON.stringify(dividendResult)}`
    );

    // Ensure monthly amount is a valid number
    income += isFinite(dividendResult.monthlyAmount) ? dividendResult.monthlyAmount : 0;
  }

  // Handle bond and cash interest income
  if ((asset.type === "bond" || asset.type === "cash") && asset.interestRate !== undefined && asset.value) {
    // Convert annual interest rate to monthly income
    // interestRate is input as percentage value (e.g., 5.0 for 5%)
    const annualInterest = asset.interestRate * asset.value / 100;
    const monthlyInterest = annualInterest / 12;
    
    Logger.infoService(
      `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} interest calculation for ${asset.name}: ${asset.interestRate}% of ${asset.value} = ${annualInterest} annually, ${monthlyInterest} monthly`
    );

    // Ensure monthly interest is a valid number
    income += isFinite(monthlyInterest) ? monthlyInterest : 0;
  }

  // Handle real estate rental income
  if (asset.type === "real_estate" && asset.rentalIncome?.amount !== undefined) {
    const monthlyRental = asset.rentalIncome.amount;
    Logger.infoService(
      `Individual rental calculation result for ${asset.name}: ${monthlyRental}`
    );

    // Ensure rental amount is a valid number
    income += isFinite(monthlyRental) ? monthlyRental : 0;
  } else if (asset.type === "real_estate") {
    Logger.infoService(`Real estate asset ${asset.name} has no rental income defined or amount is invalid`);
  }

  Logger.infoService(`Final individual income for asset ${asset.name}: ${income}`);
  return income;
};

// Neue Funktion: Berechnet das Asset-Einkommen für einen spezifischen Monat
export const calculateAssetIncomeForMonth = (
  asset: Asset,
  monthNumber: number
): number => {
  // Zuerst prüfen, ob gecachte Daten vorhanden sind
  const cachedData = getCachedDividendData(asset);
  if (cachedData && cachedData.monthlyBreakdown) {
    const cachedMonthlyIncome = cachedData.monthlyBreakdown[monthNumber] || 0;
    Logger.cache(`Cache hit for asset ${asset.name} month ${monthNumber}, returning cached income: ${cachedMonthlyIncome}`);
    return cachedMonthlyIncome;
  }

  Logger.cache(`Cache miss for asset ${asset.name} month ${monthNumber}, calculating income`);
  let income = 0;

  Logger.infoService(
    `Calculating income for asset ${asset.name} in month ${monthNumber}`
  );

  // Handle stock dividend income for specific month
  if (asset.type === "stock" && asset.dividendInfo && asset.quantity) {
    const dividendForMonth = calculateDividendForMonth(
      asset.dividendInfo,
      asset.quantity,
      monthNumber
    );
    Logger.infoService(
      `Dividend for ${asset.name} in month ${monthNumber}: ${dividendForMonth}`
    );
    income += isFinite(dividendForMonth) ? dividendForMonth : 0;
  }

  // Handle bond and cash interest income for specific month
  if ((asset.type === "bond" || asset.type === "cash") && asset.interestRate !== undefined && asset.value) {
    // Convert annual interest rate to monthly income
    // interestRate is input as percentage value (e.g., 5.0 for 5%)
    const annualInterest = asset.interestRate * asset.value / 100;
    const monthlyInterest = annualInterest / 12;
    
    Logger.infoService(
      `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} interest for ${asset.name} in month ${monthNumber}: ${monthlyInterest}`
    );
    
    income += isFinite(monthlyInterest) ? monthlyInterest : 0;
  }

  // Handle real estate rental income for specific month
  if (asset.type === "real_estate" && asset.rentalIncome?.amount !== undefined) {
    const monthlyRental = asset.rentalIncome.amount;
    Logger.infoService(
      `Rental income for ${asset.name} in month ${monthNumber}: ${monthlyRental}`
    );
    income += isFinite(monthlyRental) ? monthlyRental : 0;
  }

  Logger.infoService(
    `Total income for asset ${asset.name} in month ${monthNumber}: ${income}`
  );
  return income;
};

export const calculateTotalMonthlyAssetIncome = (assets: Asset[]): number => {
  let totalIncome = 0;

  if (!Array.isArray(assets)) {
    Logger.error('Invalid assets array provided to calculateTotalMonthlyAssetIncome');
    return 0;
  }

  Logger.infoService(`Calculating total asset income for ${assets.length} assets`);

  for (const asset of assets) {
    const assetIncome = calculateAssetMonthlyIncome(asset);
    totalIncome += isFinite(assetIncome) ? assetIncome : 0;
    
    Logger.infoService(
      `Added ${assetIncome} from asset ${asset.name}, total now: ${totalIncome}`
    );
  }

  Logger.infoService(`Final total asset income: ${totalIncome}`);
  return isFinite(totalIncome) ? totalIncome : 0;
};

// Neue Funktion: Berechnet das gesamte Asset-Einkommen für einen spezifischen Monat
export const calculateTotalAssetIncomeForMonth = (
  assets: Asset[],
  monthNumber: number
): number => {
  if (!Array.isArray(assets)) {
    Logger.error('Invalid assets array provided to calculateTotalAssetIncomeForMonth');
    return 0;
  }

  if (!isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    Logger.error(`Invalid month number provided: ${monthNumber}`);
    return 0;
  }

  let totalIncome = 0;

  Logger.infoService(
    `Calculating total asset income for ${assets.length} assets in month ${monthNumber}`
  );

  for (const asset of assets) {
    const assetIncome = calculateAssetIncomeForMonth(asset, monthNumber);
    totalIncome += isFinite(assetIncome) ? assetIncome : 0;
    
    Logger.infoService(
      `Added ${assetIncome} from asset ${asset.name} in month ${monthNumber}, total now: ${totalIncome}`
    );
  }

  Logger.infoService(
    `Final total asset income for month ${monthNumber}: ${totalIncome}`
  );
  return isFinite(totalIncome) ? totalIncome : 0;
};

// Neue Funktion mit Caching-Unterstützung
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

  // Perform calculation as fallback
  let monthlyAmount = 0;
  let annualAmount = 0;
  let monthlyBreakdown: Record<number, number> = {};

  // Calculate dividend income for stocks
  if (asset.type === "stock" && asset.dividendInfo && asset.quantity) {
    const dividendResult = calculateDividendSchedule(
      asset.dividendInfo,
      asset.quantity
    );
    monthlyAmount = isFinite(dividendResult.monthlyAmount) ? dividendResult.monthlyAmount : 0;
    annualAmount = isFinite(dividendResult.annualAmount) ? dividendResult.annualAmount : 0;
    
    // Build monthlyBreakdown for each month 1-12
    for (let month = 1; month <= 12; month++) {
      const monthlyDividend = calculateDividendForMonth(
        asset.dividendInfo,
        asset.quantity,
        month
      );
      monthlyBreakdown[month] = isFinite(monthlyDividend) ? monthlyDividend : 0;
    }
  }
  
  // Calculate bond and cash interest income
  else if ((asset.type === "bond" || asset.type === "cash") && asset.interestRate !== undefined && asset.value) {
    // Convert annual interest rate to monthly income
    // interestRate is input as percentage value (e.g., 5.0 for 5%)
    const annualInterest = asset.interestRate * asset.value / 100;
    monthlyAmount = annualInterest / 12;
    annualAmount = annualInterest;
    
    // For interest income, it's the same every month
    for (let month = 1; month <= 12; month++) {
      monthlyBreakdown[month] = monthlyAmount;
    }
  }
  
  // Calculate rental income for real estate
  else if (asset.type === "real_estate" && asset.rentalIncome?.amount !== undefined) {
    const rentalAmount = asset.rentalIncome.amount;
    monthlyAmount = isFinite(rentalAmount) ? rentalAmount : 0;
    annualAmount = monthlyAmount * 12;
    
    // For rental income, it's the same every month
    for (let month = 1; month <= 12; month++) {
      monthlyBreakdown[month] = monthlyAmount;
    }
  }

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

// Hilfsfunktion um Cache zu aktualisieren (sollte aus Redux Actions aufgerufen werden)
export const updateAssetCacheData = (
  asset: Asset,
  calculationResult: {
    monthlyAmount: number;
    annualAmount: number;
    monthlyBreakdown: Record<number, number>;
  }
) => {
  // Cache data for stocks with dividends, bonds with interest, and real estate with rental income
  if ((asset.type === "stock" && asset.dividendInfo) || 
      (asset.type === "bond" && asset.interestRate !== undefined) || 
      (asset.type === "real_estate" && asset.rentalIncome)) {
    
    return createCachedDividends(
      calculationResult.monthlyAmount,
      calculationResult.annualAmount,
      calculationResult.monthlyBreakdown,
      asset
    );
  }
  return null;
};

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
    if (cachedData) {
      totalIncome += cachedData.monthlyAmount || 0;
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
    if (cachedData && cachedData.monthlyBreakdown) {
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
