import { Asset } from "../../../../types/domains/assets/";
import Logger from "../../../Logger/logger";
import {
  calculateDividendForMonth,
} from "../income/calculatePayment";
import { getCachedDividendData } from "../../../../utils/dividendCacheUtils";
import { getCurrentQuantity } from "../../../../utils/transactionCalculations";
import { calculateAssetMonthlyIncome } from "./calculateAssetIncomeCore";

// Helper: Calculate stock dividend for a specific month
const getStockDividendForMonth = (asset: Asset, monthNumber: number): number => {
  if (asset.type === "stock") {
    const dividendInfo = asset.assetDefinition?.dividendInfo;
    
    if (dividendInfo) {
      // Use getCurrentQuantity helper function
      const quantity = getCurrentQuantity(asset);
      
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

// Calculate asset income for a specific month
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

// Calculate total monthly income for multiple assets
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

// Calculate total asset income for a specific month
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
