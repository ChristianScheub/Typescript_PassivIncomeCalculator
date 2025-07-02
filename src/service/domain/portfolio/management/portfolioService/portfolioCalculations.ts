import { AssetDefinition, Transaction as Asset } from '@/types/domains/assets';
import { AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '@/types/domains/assets/categories';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import Logger from "@/service/shared/logging/Logger/logger";
import { calculatorService } from '../../../../index';
import { getCurrentQuantity, getCurrentValue } from '@/utils/transactionCalculations';
import { formatCurrency } from '../../../../infrastructure/formatService/methods/formatCurrency';
import { formatPercentage } from '@/service/infrastructure/formatService/methods/formatPercentage';

export const calculatePortfolioPositions = (
  assets: Asset[],
  assetDefinitions: AssetDefinition[] = [],
  categories: AssetCategory[] = [],
  categoryOptions: AssetCategoryOption[] = [],
  categoryAssignments: AssetCategoryAssignment[] = []
): PortfolioPosition[] => {
  Logger.infoService('Calculating portfolio positions from assets');
  Logger.infoService(`Input: ${assets.length} assets, ${assetDefinitions.length} assetDefinitions`);
  
  // Group assets by AssetDefinitionId or fallback to name
  const grouped = new Map<string, Asset[]>();
  
  assets.forEach(asset => {
    const key = asset.assetDefinitionId || `fallback_${asset.name}_${asset.type}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(asset);
  });

  return Array.from(grouped.entries()).map(([key, transactions]) => {
    // Find the corresponding AssetDefinition
    const assetDefinition = transactions[0].assetDefinitionId 
      ? assetDefinitions.find(def => def.id === transactions[0].assetDefinitionId)
      : undefined;

    // Calculate aggregated quantities and values
    const totalQuantity = transactions.reduce((sum, t) => {
      return sum + getCurrentQuantity(t);
    }, 0);

    // First calculate total investment from buy transactions only
    const totalBuyInvestment = transactions.reduce((sum, t) => {
      if (t.transactionType === 'buy') {
        const quantity = t.purchaseQuantity || 0;
        const price = t.purchasePrice || 0;
        return sum + (price * quantity) + (t.transactionCosts || 0);
      }
      return sum;
    }, 0);

    // Calculate average purchase price from buy transactions
    const totalBuyQuantity = transactions.reduce((sum, t) => {
      if (t.transactionType === 'buy') {
        return sum + (t.purchaseQuantity || 0);
      }
      return sum;
    }, 0);

    const avgPurchasePrice = totalBuyQuantity > 0 ? totalBuyInvestment / totalBuyQuantity : 0;

    // Calculate investment based on remaining quantity (use absolute value for negative positions)
    const remainingQuantityAbs = Math.abs(totalQuantity);
    const totalInvestment = (remainingQuantityAbs * avgPurchasePrice) + transactions.reduce((sum, t) => sum + (t.transactionCosts || 0), 0);

    // Get current price
    const currentPrice = assetDefinition?.currentPrice || 0;
    
    Logger.infoService(`Position ${assetDefinition?.name || transactions[0].name}: qty=${totalQuantity}, currentPrice=${currentPrice}, avgPrice=${avgPurchasePrice}, assetDefCurrentPrice=${assetDefinition?.currentPrice}, hasAssetDef=${!!assetDefinition}, assetDefId=${transactions[0].assetDefinitionId}`);

    const currentValue = currentPrice * totalQuantity; // Allow negative values for short positions
    
    Logger.infoService(`  -> currentValue calculated: ${currentValue} (${totalQuantity} * ${currentPrice})`);

    const averagePurchasePrice = totalBuyQuantity > 0 ? totalBuyInvestment / totalBuyQuantity : 0;
    const totalReturn = currentValue - totalInvestment;
    const totalReturnPercentage = totalInvestment !== 0 ? (totalReturn / Math.abs(totalInvestment)) * 100 : 0;

    // Calculate monthly income based on AssetDefinition and total quantity
    const monthlyIncome = calculatePositionMonthlyIncome(assetDefinition, transactions[0], totalQuantity);
    const annualIncome = monthlyIncome * 12;

    // Transaction metadata
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    );
    const firstTransaction = sortedTransactions[0];
    const lastTransaction = sortedTransactions[sortedTransactions.length - 1];

    // Calculate category assignments for this position
    const positionCategoryAssignments = assetDefinition?.id 
      ? categoryAssignments
          .filter(assignment => assignment.assetDefinitionId === assetDefinition.id)
          .map(assignment => {
            const category = categories.find(cat => cat.id === assignment.categoryId);
            const option = categoryOptions.find(opt => opt.id === assignment.categoryOptionId);
            return category && option ? { category, option } : null;
          })
          .filter((item): item is { category: AssetCategory; option: AssetCategoryOption } => item !== null)
      : [];

    // Pre-format all values for UI to avoid repeated formatting calls
    const formattedValues = {
      currentValue: formatCurrency(currentValue),
      totalInvestment: formatCurrency(Math.abs(totalInvestment)),
      totalReturn: formatCurrency(totalReturn),
      totalReturnPercentage: formatPercentage(totalReturnPercentage),
      monthlyIncome: formatCurrency(monthlyIncome),
      annualIncome: formatCurrency(annualIncome),
      averagePurchasePrice: formatCurrency(averagePurchasePrice),
      currentPrice: formatCurrency(currentPrice),
    };
    
    const position: PortfolioPosition = {
      id: key,
      assetDefinitionId: assetDefinition?.id,
      name: assetDefinition?.fullName || firstTransaction.name,
      ticker: assetDefinition?.ticker,
      type: assetDefinition?.type || firstTransaction.type,
      sectors: assetDefinition?.sectors?.map(sectorAllocation => sectorAllocation.sector),
      country: assetDefinition?.country,
      
      totalQuantity,
      averagePurchasePrice,
      totalInvestment,
      currentValue,
      currentPrice,
      
      totalReturn,
      totalReturnPercentage,
      
      monthlyIncome,
      annualIncome,
      
      // Pre-formatted values
      formatted: formattedValues,
      
      categoryAssignments: positionCategoryAssignments,
      
      transactions,
      transactionCount: transactions.length,
      firstPurchaseDate: firstTransaction.purchaseDate,
      lastPurchaseDate: lastTransaction.purchaseDate,
    };

    Logger.infoService(
      `Position ${position.name}: quantity=${totalQuantity}, monthlyIncome=${monthlyIncome}, transactions=${transactions.length}`
    );

    return position;
  });
};

const calculatePositionMonthlyIncome = (
  assetDefinition: AssetDefinition | undefined,
  sampleTransaction: Asset,
  totalQuantity: number
): number => {
  const dividendInfo = assetDefinition?.dividendInfo;
  const assetType = assetDefinition?.type || sampleTransaction.type;
  const interestRate = assetDefinition?.bondInfo?.interestRate;
  const rentalInfo = assetDefinition?.rentalInfo;

  Logger.infoService(
    `Calculating income for position: type=${assetType}, quantity=${totalQuantity}, hasDefinition=${!!assetDefinition}`
  );

  // Stock dividends
  if (assetType === 'stock' && (!dividendInfo || dividendInfo.frequency === 'none')) {
    Logger.infoService(`Stock position has dividends disabled, skipping dividend calculation`);
    return 0;
  }

  if (assetType === 'stock' && dividendInfo?.frequency && dividendInfo.frequency !== 'none') {
    if (totalQuantity <= 0) {
      Logger.infoService(`Stock position has no valid quantity (${totalQuantity}), skipping dividend calculation`);
      return 0;
    }
    
    const dividendResult = calculatorService.calculateDividendSchedule(dividendInfo, totalQuantity);
    Logger.infoService(
      `Stock dividend calculation: amount=${dividendInfo.amount}, frequency=${dividendInfo.frequency}, quantity=${totalQuantity}, result=${dividendResult.monthlyAmount}`
    );
    return isFinite(dividendResult.monthlyAmount) ? dividendResult.monthlyAmount : 0;
  }

  // Bond/Cash interest
  if ((assetType === 'bond' || assetType === 'cash') && interestRate !== undefined) {
    const currentValue = getCurrentValue(sampleTransaction);
    const annualInterest = (interestRate * currentValue) / 100;
    const monthlyInterest = annualInterest / 12;
    Logger.infoService(
      `${assetType} interest calculation: rate=${interestRate}%, value=${currentValue}, monthly=${monthlyInterest}`
    );
    return isFinite(monthlyInterest) ? monthlyInterest : 0;
  }

  // Real estate rental income
  if (assetType === 'real_estate') {
    const baseRent = rentalInfo?.baseRent || 0;
    Logger.infoService(
      `Real estate rental calculation: baseRent=${baseRent}, fromDefinition=${!!rentalInfo}`
    );
    return isFinite(baseRent) ? baseRent : 0;
  }

  Logger.infoService(`No income calculation available for asset type: ${assetType}`);
  return 0;
};

// Helper function to calculate total portfolio metrics
export const calculatePortfolioTotals = (positions: PortfolioPosition[]) => {
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalInvestment = positions.reduce((sum, pos) => sum + pos.totalInvestment, 0);
  const totalReturn = totalValue - totalInvestment;
  const totalReturnPercentage = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;
  const monthlyIncome = positions.reduce((sum, pos) => sum + pos.monthlyIncome, 0);
  const annualIncome = monthlyIncome * 12;

  return {
    totalValue,
    totalInvestment,
    totalReturn,
    totalReturnPercentage,
    monthlyIncome,
    annualIncome,
    positionCount: positions.length,
    transactionCount: positions.reduce((sum, pos) => sum + pos.transactionCount, 0)
  };
};
