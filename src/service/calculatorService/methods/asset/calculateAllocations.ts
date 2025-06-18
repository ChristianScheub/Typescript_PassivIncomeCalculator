import { Asset, Income, AssetAllocation, IncomeAllocation, IncomeType, AssetType } from '../../../../types';
// ❌ REMOVED: import { PortfolioPosition } from '../../../portfolioService/portfolioCalculations';
import Logger from '../../../Logger/logger';
import { calculateMonthlyIncome } from '../income/calculateIncome';
import { calculateAssetMonthlyIncome } from './calculateAssetIncome';

export const calculateIncomeAllocation = (income: Income[], assets: Asset[]): IncomeAllocation[] => {
  const incomeByType = new Map<IncomeType, number>();
  let total = 0;

  // Zuerst reguläres Einkommen nach Typ summieren
  income.forEach(item => {
    if (!item.paymentSchedule) return;
    
    const monthlyAmount = calculateMonthlyIncome(item);
    if (monthlyAmount <= 0) return;
    
    const currentAmount = incomeByType.get(item.type) || 0;
    incomeByType.set(item.type, currentAmount + monthlyAmount);
    total += monthlyAmount;
  });

  // Asset-Einkommen hinzufügen, wenn es nicht bereits als Income erfasst wurde
  assets.forEach(asset => {
    const monthlyAmount = calculateAssetMonthlyIncome(asset);
    if (monthlyAmount <= 0) return;

    // Prüfen ob dieses Asset-Einkommen bereits als reguläres Einkommen erfasst wurde
    const hasIncomeEntry = income.some(inc => inc.sourceId === asset.id);
    if (hasIncomeEntry) return;

    let incomeType: IncomeType;
    switch(asset.type) {
      case 'stock':
        incomeType = 'dividend';
        break;
      case 'bond':
        incomeType = 'interest';
        break;
      case 'real_estate':
        incomeType = 'rental';
        break;
      case 'crypto':
        incomeType = 'interest'; // Crypto kann Staking-Rewards haben
        break;
      case 'cash':
        incomeType = 'interest'; // Zinsen auf Bargeld/Sparkonten
        break;
      default:
        incomeType = 'other';
    }

    const currentAmount = incomeByType.get(incomeType) || 0;
    incomeByType.set(incomeType, currentAmount + monthlyAmount);
    total += monthlyAmount;
  });

  // In Array mit Prozentangaben umwandeln
  const result = Array.from(incomeByType.entries()).map(([type, amount]) => ({
    type,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0
  }));

  Logger.info(`Income allocation calculated - types: ${result.length}, total: ${total}`);
  return result.sort((a, b) => b.amount - a.amount);
};

export const calculateAssetAllocation = (assets: Asset[]): AssetAllocation[] => {
  const allocationMap = new Map<AssetType, number>();
  const total = assets.reduce((sum, asset) => sum + asset.value, 0);

  assets.forEach(asset => {
    const currentAmount = allocationMap.get(asset.type) || 0;
    allocationMap.set(asset.type, currentAmount + asset.value);
  });

  const result = Array.from(allocationMap.entries())
    .map(([type, value]) => ({
      name: type,
      type,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  Logger.info(`Asset allocation calculated - types: ${result.length}, total: ${total}`);
  return result;
};

// ❌ REMOVED: Redundant wrapper function - use direct cache access instead
// export const calculatePortfolioAssetAllocation = (positions: PortfolioPosition[]): AssetAllocation[] => {
//   // This was just: return positions.map(...) - can be done directly in components!
// }
