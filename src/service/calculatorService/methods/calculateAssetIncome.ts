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
  let income = 0;

  Logger.infoService(
    `Calculating income for individual asset: ${asset.name} - Type: ${asset.type}`
  );

  // Handle stock dividend income
  if (asset.type === "stock" && asset.dividendInfo && asset.quantity) {
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

  // Handle real estate rental income
  if (asset.type === "real_estate" && asset.rentalIncome && typeof asset.rentalIncome.amount === 'number') {
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

  // Handle real estate rental income for specific month
  if (asset.type === "real_estate" && asset.rentalIncome && typeof asset.rentalIncome.amount === 'number') {
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
  
  Logger.cache(
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
  
  // Calculate rental income for real estate
  else if (asset.type === "real_estate" && asset.rentalIncome && typeof asset.rentalIncome.amount === 'number') {
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
  if (asset.type === "stock" && asset.dividendInfo) {
    // Nur für Assets mit Dividenden-relevanten Daten
    return createCachedDividends(
      calculationResult.monthlyAmount,
      calculationResult.annualAmount,
      calculationResult.monthlyBreakdown,
      asset
    );
  }
  return null;
};
