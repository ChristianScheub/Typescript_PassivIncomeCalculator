import { Asset, AssetDefinition } from '../../../types';
import { getCurrentQuantity } from '../../../utils/transactionCalculations';

export function calculateProjectedIncome(
  assets: Asset[], 
  _assetDefinitions: AssetDefinition[], // Parameter is kept for interface compatibility but not used
  definitionId: string, 
  newDividendInfo: any
): number {
  const positionTransactions = assets.filter(asset => asset.assetDefinitionId === definitionId);
  const totalQuantity = positionTransactions.reduce((sum, t) => {
    return sum + getCurrentQuantity(t);
  }, 0);

  if (totalQuantity <= 0 || !newDividendInfo?.frequency || newDividendInfo.frequency === 'none') {
    return 0;
  }

  // Import calculation function dynamically to avoid circular dependency
  const { calculateDividendSchedule } = require('../../calculatorService/methods/calculatePayment');
  const result = calculateDividendSchedule(newDividendInfo, totalQuantity);
  
  return isFinite(result.monthlyAmount) ? result.monthlyAmount : 0;
}
