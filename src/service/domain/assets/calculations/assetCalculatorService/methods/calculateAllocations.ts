// Neue Domain-Driven Types
import { 
  Transaction as Asset
} from '../../../../../../types/domains/assets';
import { 
  AssetAllocation,
  IncomeAllocation
} from '../../../../../../types/domains/portfolio';
import { 
  Income
} from '../../../../../../types/domains/financial';
import { AssetType, IncomeType } from '@/types/shared';
import Logger from '../../../../../shared/logging/Logger/logger';
import { calculateMonthlyIncome } from '../../../../financial/income/incomeCalculatorService/methods/calculateIncome';
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

  // Count für jeden IncomeType berechnen
  const countByType = new Map<IncomeType, number>();
  income.forEach(incomeItem => {
    const currentCount = countByType.get(incomeItem.type) || 0;
    countByType.set(incomeItem.type, currentCount + 1);
  });

  // In Array mit Prozentangaben umwandeln
  const result = Array.from(incomeByType.entries()).map(([type, amount]) => ({
    type,
    value: amount, // 'amount' zu 'value' umbenennen für Konsistenz
    percentage: total > 0 ? (amount / total) * 100 : 0,
    count: countByType.get(type) || 0
  }));

  Logger.info(`Income allocation calculated - types: ${result.length}, total: ${total}`);
  return result.sort((a, b) => b.value - a.value);
};

export const calculateAssetAllocation = (assets: Asset[]): AssetAllocation[] => {
  const allocationMap = new Map<AssetType, number>();
  const countMap = new Map<AssetType, number>();
  let total = 0;

  assets.forEach(asset => {
    const currentAmount = allocationMap.get(asset.type) || 0;
    const currentCount = countMap.get(asset.type) || 0;
    
    allocationMap.set(asset.type, currentAmount + asset.value);
    countMap.set(asset.type, currentCount + 1);
    total += asset.value;
  });

  const result = Array.from(allocationMap.entries())
    .map(([type, value]) => ({
      type,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      count: countMap.get(type) || 0
    }))
    .sort((a, b) => b.value - a.value);

  Logger.info(`Asset allocation calculated - types: ${result.length}, total: ${total}`);
  return result;
};
