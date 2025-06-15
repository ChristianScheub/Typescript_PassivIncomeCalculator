import { Asset } from "../../../../types";
import Logger from "../../../Logger/logger";
import { calculateDividendSchedule } from "../income/calculatePayment";
import { getCachedDividendData } from "../../../../utils/dividendCacheUtils";
import { getCurrentQuantity } from "../../../../utils/transactionCalculations";

// Helper: Calculate stock dividend income
const getStockDividendIncome = (asset: Asset): number => {
  if (asset.type === "stock") {
    // Use assetDefinition.dividendInfo (legacy fields have been removed from Asset interface)
    const dividendInfo = asset.assetDefinition?.dividendInfo;

    if (dividendInfo?.frequency) {
      // Use getCurrentQuantity helper function
      const quantity = getCurrentQuantity(asset);

      if (quantity <= 0) {
        Logger.infoService(
          `Stock ${asset.name} has no valid quantity (${quantity}), skipping dividend calculation`
        );
        return 0;
      }

      const dividendResult = calculateDividendSchedule(dividendInfo, quantity);
      Logger.infoService(
        `Individual dividend calculation result for ${
          asset.name
        }: quantity=${quantity}, dividendSource=definition, result=${JSON.stringify(
          dividendResult
        )}`
      );
      return isFinite(dividendResult.monthlyAmount)
        ? dividendResult.monthlyAmount
        : 0;
    }
  }
  return 0;
};

// Helper: Calculate bond/cash interest income
const getInterestIncome = (asset: Asset): number => {
  if (asset.type === "bond" || asset.type === "cash") {
    // Use assetDefinition.bondInfo (legacy fields have been removed from Asset interface)
    const interestRate = asset.assetDefinition?.bondInfo?.interestRate;

    if (interestRate !== undefined && asset.value) {
      const annualInterest = (interestRate * asset.value) / 100;
      const monthlyInterest = annualInterest / 12;
      Logger.infoService(
        `${
          asset.type.charAt(0).toUpperCase() + asset.type.slice(1)
        } interest calculation for ${asset.name}: ${interestRate}% of ${
          asset.value
        } = ${annualInterest} annually, ${monthlyInterest} monthly, source=definition`
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
    let source = "none";

    if (definitionRentalInfo?.baseRent !== undefined) {
      monthlyRental = definitionRentalInfo.baseRent;
      source = "definition";
    }

    if (monthlyRental !== undefined) {
      Logger.infoService(
        `Individual rental calculation result for ${asset.name}: ${monthlyRental}, source=${source}`
      );
      return isFinite(monthlyRental) ? monthlyRental : 0;
    } else {
      Logger.infoService(
        `Real estate asset ${asset.name} has no rental income defined or amount is invalid`
      );
    }
  }
  return 0;
};

// Calculate monthly income for an individual asset
export const calculateAssetMonthlyIncome = (asset: Asset): number => {
  // Debug logging für Asset-Details
  Logger.infoService(`=== Calculating income for asset: ${asset.name} ===`);
  Logger.infoService(
    `Asset type: ${asset.type}, Current quantity: ${getCurrentQuantity(
      asset
    )}, Purchase quantity: ${asset.purchaseQuantity}`
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
    Logger.cache(
      `Cache hit for asset ${asset.name}, returning cached monthly income: ${cachedData.monthlyAmount}`
    );
    return cachedData.monthlyAmount || 0;
  }

  Logger.cache(
    `Cache miss for asset ${asset.name}, calculating monthly income`
  );
  Logger.infoService(
    `Calculating income for individual asset: ${asset.name} - Type: ${asset.type}`
  );

  // Use helpers for each asset type
  const income =
    getStockDividendIncome(asset) +
    getInterestIncome(asset) +
    getRentalIncome(asset);

  Logger.infoService(
    `Final individual income for asset ${asset.name}: ${income}`
  );
  return income;
};

// Export the helper functions to be used in other modules
export { getStockDividendIncome, getInterestIncome, getRentalIncome };
