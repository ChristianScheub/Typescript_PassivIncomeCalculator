import { Asset } from '../../../types';
import Logger from '../../Logger/logger';
import { calculateDividendSchedule, calculateDividendForMonth } from './calculatePayment';

export const calculateAssetMonthlyIncome = (asset: Asset): number => {
  let income = 0;
  
  Logger.info(`Calculating income for individual asset: ${asset.name} - Type: ${asset.type}`);
  
  if (asset.type === 'stock' && asset.dividendInfo && asset.quantity) {
    const dividendResult = calculateDividendSchedule(asset.dividendInfo, asset.quantity);
    Logger.info(`Individual dividend calculation result for ${asset.name}: ${JSON.stringify(dividendResult)}`);
    income += dividendResult.monthlyAmount;
  }
  
  if (asset.type === 'real_estate' && asset.rentalIncome) {
    const monthlyRental = asset.rentalIncome.amount; // Rental income is already monthly
    Logger.info(`Individual rental calculation result for ${asset.name}: ${monthlyRental}`);
    Logger.info(`Asset details for ${asset.name}: ${JSON.stringify(asset)}`);
    income += monthlyRental;
  } else if (asset.type === 'real_estate') {
    Logger.info(`Real estate asset ${asset.name} has no rental income defined`);
  }
  
  Logger.info(`Final individual income for asset ${asset.name}: ${income}`);
  return income;
}

// Neue Funktion: Berechnet das Asset-Einkommen für einen spezifischen Monat
export const calculateAssetIncomeForMonth = (asset: Asset, monthNumber: number): number => {
  let income = 0;
  
  Logger.info(`Calculating income for asset ${asset.name} in month ${monthNumber}`);
  
  if (asset.type === 'stock' && asset.dividendInfo && asset.quantity) {
    const dividendForMonth = calculateDividendForMonth(asset.dividendInfo, asset.quantity, monthNumber);
    Logger.info(`Dividend for ${asset.name} in month ${monthNumber}: ${dividendForMonth}`);
    income += dividendForMonth;
  }
  
  if (asset.type === 'real_estate' && asset.rentalIncome) {
    const monthlyRental = asset.rentalIncome.amount; // Rental income occurs every month
    Logger.info(`Rental income for ${asset.name} in month ${monthNumber}: ${monthlyRental}`);
    income += monthlyRental;
  }
  
  // Andere Asset-Typen können hier hinzugefügt werden (z.B. Bond-Zinsen)
  
  Logger.info(`Total income for asset ${asset.name} in month ${monthNumber}: ${income}`);
  return income;
}

export const calculateTotalMonthlyAssetIncome = (assets: Asset[]): number => {
  let totalIncome = 0;
  
  Logger.info(`Calculating total asset income for ${assets.length} assets`);
  
  for (const asset of assets) {
    const assetIncome = calculateAssetMonthlyIncome(asset);
    totalIncome += assetIncome;
    Logger.info(`Added ${assetIncome} from asset ${asset.name}, total now: ${totalIncome}`);
  }
  
  Logger.info(`Final total asset income: ${totalIncome}`);
  return totalIncome;
}

// Neue Funktion: Berechnet das gesamte Asset-Einkommen für einen spezifischen Monat
export const calculateTotalAssetIncomeForMonth = (assets: Asset[], monthNumber: number): number => {
  let totalIncome = 0;
  
  Logger.info(`Calculating total asset income for ${assets.length} assets in month ${monthNumber}`);
  
  for (const asset of assets) {
    const assetIncome = calculateAssetIncomeForMonth(asset, monthNumber);
    totalIncome += assetIncome;
    Logger.info(`Added ${assetIncome} from asset ${asset.name} in month ${monthNumber}, total now: ${totalIncome}`);
  }
  
  Logger.info(`Final total asset income for month ${monthNumber}: ${totalIncome}`);
  return totalIncome;
}
