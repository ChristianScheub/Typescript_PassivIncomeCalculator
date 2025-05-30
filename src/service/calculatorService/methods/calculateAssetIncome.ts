import { Asset } from '../../../types';
import Logger from '../../Logger/logger';
import { calculateDividendSchedule } from './calculatePayment';

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
