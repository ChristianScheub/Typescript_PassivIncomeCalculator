import { AssetDefinition, Transaction as Asset, DividendInfo } from '../../../types/domains/assets';
import { getCurrentQuantity } from '../../../utils/transactionCalculations';
import { calculatorService } from '../../calculatorService';

export function calculateProjectedIncome(
  assets: Asset[], 
  _assetDefinitions: AssetDefinition[], // Parameter is kept for interface compatibility but not used
  definitionId: string, 
  newDividendInfo: Partial<DividendInfo>
): number {
  const positionTransactions = assets.filter(asset => asset.assetDefinitionId === definitionId);
  const totalQuantity = positionTransactions.reduce((sum, t) => {
    return sum + getCurrentQuantity(t);
  }, 0);

  if (totalQuantity <= 0 || !newDividendInfo?.frequency || newDividendInfo.frequency === 'none') {
    return 0;
  }

  // Use calculatorService instead of direct import to avoid circular dependency
  const result = calculatorService.calculateDividendSchedule(newDividendInfo as any, totalQuantity);
  
  return isFinite(result.monthlyAmount) ? result.monthlyAmount : 0;
}
