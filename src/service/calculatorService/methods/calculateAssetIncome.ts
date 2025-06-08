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

// Helper: Calculate stock dividend income
const getStockDividendIncome = (asset: Asset): number => {
  if (asset.type === "stock") {
    // Use assetDefinition.dividendInfo (legacy fields have been removed from Asset interface)
    const dividendInfo = asset.assetDefinition?.dividendInfo;
    
    if (dividendInfo?.frequency) {
      // Use currentQuantity or purchaseQuantity 
      const quantity = asset.currentQuantity || asset.purchaseQuantity || 0;
      
      if (quantity <= 0) {
        Logger.infoService(`Stock ${asset.name} has no valid quantity (${quantity}), skipping dividend calculation`);
        return 0;
      }
      
      const dividendResult = calculateDividendSchedule(dividendInfo, quantity);
      Logger.infoService(
        `Individual dividend calculation result for ${asset.name}: quantity=${quantity}, dividendSource=definition, result=${JSON.stringify(dividendResult)}`
      );
      return isFinite(dividendResult.monthlyAmount) ? dividendResult.monthlyAmount : 0;
    }
  }
  return 0;
};

// Helper: Calculate bond/cash interest income
const getInterestIncome = (asset: Asset): number => {
  if ((asset.type === "bond" || asset.type === "cash")) {
    // Use assetDefinition.bondInfo (legacy fields have been removed from Asset interface)
    const interestRate = asset.assetDefinition?.bondInfo?.interestRate;
    
    if (interestRate !== undefined && asset.value) {
      const annualInterest = interestRate * asset.value / 100;
      const monthlyInterest = annualInterest / 12;
      Logger.infoService(
        `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} interest calculation for ${asset.name}: ${interestRate}% of ${asset.value} = ${annualInterest} annually, ${monthlyInterest} monthly, source=definition`
      );
      return isFinite(monthlyInterest) ? monthlyInterest : 0;
    }
  }
  return 0;
};

// Helper: Calculate real estate rental income
const getRentalIncome = (asset: Asset): number => {
  if (asset.type === "real_estate") {
    // Use assetDefinition.rentalInfo (legacy fields have been removed from Asset interface)
    const definitionRentalInfo = asset.assetDefinition?.rentalInfo;
    
    let monthlyRental: number | undefined;
    let source = 'none';
    
    if (definitionRentalInfo?.baseRent !== undefined) {
      monthlyRental = definitionRentalInfo.baseRent;
      source = 'definition';
    }
    
    if (monthlyRental !== undefined) {
      Logger.infoService(
        `Individual rental calculation result for ${asset.name}: ${monthlyRental}, source=${source}`
      );
      return isFinite(monthlyRental) ? monthlyRental : 0;
    } else {
      Logger.infoService(`Real estate asset ${asset.name} has no rental income defined or amount is invalid`);
    }
  }
  return 0;
};

export const calculateAssetMonthlyIncome = (asset: Asset): number => {
  // Debug logging für Asset-Details
  Logger.infoService(
    `=== Calculating income for asset: ${asset.name} ===`
  );
  Logger.infoService(
    `Asset type: ${asset.type}, Current quantity: ${asset.currentQuantity}, Purchase quantity: ${asset.purchaseQuantity}`
  );
  
  // Check for dividend info from AssetDefinition only
  const definitionDividendInfo = asset.assetDefinition?.dividendInfo;
  
  if (definitionDividendInfo) {
    Logger.infoService(
      `Definition dividend info found - Frequency: ${definitionDividendInfo.frequency}, Amount: ${definitionDividendInfo.amount}`
    );
  } else {
    Logger.infoService(`No dividend info found for asset ${asset.name}`);
  }

  // Zuerst prüfen, ob gecachte Daten vorhanden sind
  const cachedData = getCachedDividendData(asset);
  if (cachedData) {
    Logger.cache(`Cache hit for asset ${asset.name}, returning cached monthly income: ${cachedData.monthlyAmount}`);
    return cachedData.monthlyAmount || 0;
  }

  Logger.cache(`Cache miss for asset ${asset.name}, calculating monthly income`);
  Logger.infoService(
    `Calculating income for individual asset: ${asset.name} - Type: ${asset.type}`
  );

  // Use helpers for each asset type
  const income =
    getStockDividendIncome(asset) +
    getInterestIncome(asset) +
    getRentalIncome(asset);

  Logger.infoService(`Final individual income for asset ${asset.name}: ${income}`);
  return income;
};

// Helper: Calculate stock dividend for a specific month
const getStockDividendForMonth = (asset: Asset, monthNumber: number): number => {
  if (asset.type === "stock") {
    // Use assetDefinition.dividendInfo (legacy fields have been removed from Asset interface)
    const dividendInfo = asset.assetDefinition?.dividendInfo;
    
    if (dividendInfo) {
      // Use currentQuantity or purchaseQuantity
      const quantity = asset.currentQuantity || asset.purchaseQuantity || 0;
      
      if (quantity <= 0) {
        Logger.infoService(`Stock ${asset.name} has no valid quantity (${quantity}) for month ${monthNumber}, skipping dividend calculation`);
        return 0;
      }
      
      const dividendForMonth = calculateDividendForMonth(
        dividendInfo,
        quantity,
        monthNumber
      );
      Logger.infoService(
        `Dividend for ${asset.name} in month ${monthNumber}: quantity=${quantity}, dividend=${dividendForMonth}, source=definition`
      );
      return isFinite(dividendForMonth) ? dividendForMonth : 0;
    }
  }
  return 0;
};

// Helper: Calculate interest for a specific month
const getInterestForMonth = (asset: Asset, monthNumber: number): number => {
  if ((asset.type === "bond" || asset.type === "cash")) {
    // Use assetDefinition.bondInfo (legacy fields have been removed from Asset interface)
    const interestRate = asset.assetDefinition?.bondInfo?.interestRate;
    
    if (interestRate !== undefined && asset.value) {
      const annualInterest = interestRate * asset.value / 100;
      const monthlyInterest = annualInterest / 12;
      Logger.infoService(
        `${asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} interest for ${asset.name} in month ${monthNumber}: ${monthlyInterest}, source=definition`
      );
      return isFinite(monthlyInterest) ? monthlyInterest : 0;
    }
  }
  return 0;
};

// Helper: Calculate rental for a specific month
const getRentalForMonth = (asset: Asset, monthNumber: number): number => {
  if (asset.type === "real_estate") {
    // Use assetDefinition.rentalInfo (legacy fields have been removed from Asset interface)
    const definitionRentalInfo = asset.assetDefinition?.rentalInfo;
    
    let monthlyRental: number | undefined;
    let source = 'none';
    
    if (definitionRentalInfo?.baseRent !== undefined) {
      monthlyRental = definitionRentalInfo.baseRent;
      source = 'definition';
    }
    
    if (monthlyRental !== undefined) {
      Logger.infoService(
        `Rental income for ${asset.name} in month ${monthNumber}: ${monthlyRental}, source=${source}`
      );
      return isFinite(monthlyRental) ? monthlyRental : 0;
    }
  }
  return 0;
};

export const calculateAssetIncomeForMonth = (
  asset: Asset,
  monthNumber: number
): number => {
  // Zuerst prüfen, ob gecachte Daten vorhanden sind
  const cachedData = getCachedDividendData(asset);
  if (cachedData?.monthlyBreakdown) {
    const cachedMonthlyIncome = cachedData.monthlyBreakdown[monthNumber] || 0;
    Logger.cache(`Cache hit for asset ${asset.name} month ${monthNumber}, returning cached income: ${cachedMonthlyIncome}`);
    return cachedMonthlyIncome;
  }

  Logger.cache(`Cache miss for asset ${asset.name} month ${monthNumber}, calculating income`);
  Logger.infoService(
    `Calculating income for asset ${asset.name} in month ${monthNumber}`
  );

  // Use helpers for each asset type
  const income =
    getStockDividendForMonth(asset, monthNumber) +
    getInterestForMonth(asset, monthNumber) +
    getRentalForMonth(asset, monthNumber);

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

// Helper: Stock dividend calculation
function getStockDividendBreakdown(asset: Asset) {
  if (asset.type !== "stock") return null;
  
  // Use assetDefinition.dividendInfo (legacy fields have been removed from Asset interface)
  const dividendInfo = asset.assetDefinition?.dividendInfo;
  
  if (!dividendInfo) return null;
  
  // Use currentQuantity or purchaseQuantity
  const quantity = asset.currentQuantity || asset.purchaseQuantity || 0;
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

// Helper: Bond/cash interest calculation
function getInterestBreakdown(asset: Asset) {
  if ((asset.type !== "bond" && asset.type !== "cash")) return null;
  
  // Use assetDefinition.bondInfo (legacy fields have been removed from Asset interface)
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

// Helper: Real estate rental calculation
function getRealEstateBreakdown(asset: Asset) {
  if (asset.type !== "real_estate") return null;
  
  // Use assetDefinition.rentalInfo (legacy fields have been removed from Asset interface)
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
function calculateAssetIncomeBreakdown(asset: Asset) {
  return (
    getStockDividendBreakdown(asset) ||
    getInterestBreakdown(asset) ||
    getRealEstateBreakdown(asset) ||
    { monthlyAmount: 0, annualAmount: 0, monthlyBreakdown: {} }
  );
}

// Hilfsfunktion um Cache zu aktualisieren (sollte aus Redux Actions aufgerufen werden)
export const updateAssetCacheData = (
  asset: Asset,
  calculationResult: {
    monthlyAmount: number;
    annualAmount: number;
    monthlyBreakdown: Record<number, number>;
  }
) => {
  // Cache data for assets with income potential (using assetDefinition data only)
  const hasDividendInfo = asset.assetDefinition?.dividendInfo;
  const hasInterestInfo = asset.assetDefinition?.bondInfo?.interestRate !== undefined;
  const hasRentalInfo = asset.assetDefinition?.rentalInfo;
  
  if ((asset.type === "stock" && hasDividendInfo) || 
      ((asset.type === "bond" || asset.type === "cash") && hasInterestInfo) || 
      (asset.type === "real_estate" && hasRentalInfo)) {
    
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
