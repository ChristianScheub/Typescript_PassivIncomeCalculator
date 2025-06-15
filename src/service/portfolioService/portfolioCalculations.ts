import { Asset, AssetDefinition, AssetCategory, AssetCategoryOption } from '../../types';
import Logger from '../Logger/logger';
import { calculateDividendSchedule } from '../calculatorService/methods/calculatePayment';
import { getCurrentQuantity, getCurrentValue } from '../../utils/transactionCalculations';
import { formatCurrency } from '../formatService/methods/formatCurrency';
import { formatPercentage } from '../formatService/methods/formatPercentage';

export interface PortfolioPosition {
  id: string; // AssetDefinitionId or fallback identifier
  assetDefinition?: AssetDefinition;
  name: string;
  ticker?: string;
  type: string;
  sector?: string;
  country?: string;
  currency?: string;
  
  // Aggregated quantities and values
  totalQuantity: number;
  averagePurchasePrice: number;
  totalInvestment: number;
  currentValue: number;
  currentPrice?: number;
  
  // Performance metrics
  totalReturn: number;
  totalReturnPercentage: number;
  
  // Income calculations (based on AssetDefinition and total quantity)
  monthlyIncome: number;
  annualIncome: number;
  
  // PRE-FORMATTED VALUES FOR UI (to avoid repeated formatting calls)
  formatted: {
    currentValue: string;
    totalInvestment: string;
    totalReturn: string;
    totalReturnPercentage: string;
    monthlyIncome: string;
    annualIncome: string;
    averagePurchasePrice: string;
    currentPrice: string;
  };
  
  // Category information
  categoryAssignments?: {
    category: AssetCategory;
    option: AssetCategoryOption;
  }[];
  
  // Transaction details
  transactions: Asset[];
  transactionCount: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export const calculatePortfolioPositions = (
  assets: Asset[],
  assetDefinitions: AssetDefinition[] = [],
  categories: AssetCategory[] = [],
  categoryOptions: AssetCategoryOption[] = [],
  categoryAssignments: any[] = []
): PortfolioPosition[] => {
  Logger.infoService('Calculating portfolio positions from assets');
  
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

    // Now calculate final investment based on remaining quantity and average purchase price
    const totalInvestment = (totalQuantity * avgPurchasePrice) + transactions.reduce((sum, t) => sum + (t.transactionCosts || 0), 0);

    const currentValue = totalQuantity > 0 ? (assetDefinition?.currentPrice || 0) * totalQuantity : 0;

    const averagePurchasePrice = totalQuantity > 0 ? Math.abs(totalInvestment / totalQuantity) : 0;
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
      currentPrice: formatCurrency(assetDefinition?.currentPrice || 0),
    };
    
    const position: PortfolioPosition = {
      id: key,
      assetDefinition,
      name: assetDefinition?.fullName || firstTransaction.name,
      ticker: assetDefinition?.ticker,
      type: assetDefinition?.type || firstTransaction.type,
      sector: assetDefinition?.sector,
      country: assetDefinition?.country,
      currency: assetDefinition?.currency || 'EUR',
      
      totalQuantity,
      averagePurchasePrice,
      totalInvestment,
      currentValue,
      currentPrice: assetDefinition?.currentPrice,
      
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
  // Use AssetDefinition data only (legacy fields have been removed from Transaction interface)
  const dividendInfo = assetDefinition?.dividendInfo;
  const assetType = assetDefinition?.type || sampleTransaction.type;
  const interestRate = assetDefinition?.bondInfo?.interestRate;
  const rentalInfo = assetDefinition?.rentalInfo;

  Logger.infoService(
    `Calculating income for position: type=${assetType}, quantity=${totalQuantity}, hasDefinition=${!!assetDefinition}`
  );

  // Stock dividends
  if (assetType === 'stock' && dividendInfo?.frequency && dividendInfo.frequency !== 'none') {
    if (totalQuantity <= 0) {
      Logger.infoService(`Stock position has no valid quantity (${totalQuantity}), skipping dividend calculation`);
      return 0;
    }
    
    const dividendResult = calculateDividendSchedule(dividendInfo, totalQuantity);
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
    // Use AssetDefinition rental info only (legacy fields have been removed from Transaction interface)
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
