import { Asset, AssetDefinition } from '../../types';
import Logger from '../Logger/logger';
import { calculateDividendSchedule } from '../calculatorService/methods/calculatePayment';

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
  
  // Transaction details
  transactions: Asset[];
  transactionCount: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

export const calculatePortfolioPositions = (
  assets: Asset[],
  assetDefinitions: AssetDefinition[] = []
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
      return sum + (t.currentQuantity || t.purchaseQuantity || 1);
    }, 0);

    const totalInvestment = transactions.reduce((sum, t) => {
      const quantity = t.currentQuantity || t.purchaseQuantity || 1;
      const price = t.purchasePrice || 0;
      return sum + (price * quantity) + (t.transactionCosts || 0);
    }, 0);

    const currentValue = transactions.reduce((sum, t) => {
      return sum + (t.currentValue || t.value || 0);
    }, 0);

    const averagePurchasePrice = totalQuantity > 0 ? totalInvestment / totalQuantity : 0;
    const totalReturn = currentValue - totalInvestment;
    const totalReturnPercentage = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

    // Calculate monthly income based on AssetDefinition and total quantity
    const monthlyIncome = calculatePositionMonthlyIncome(assetDefinition, transactions[0], totalQuantity);
    const annualIncome = monthlyIncome * 12;

    // Transaction metadata
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()
    );
    const firstTransaction = sortedTransactions[0];
    const lastTransaction = sortedTransactions[sortedTransactions.length - 1];

    // Get current price from the most recent transaction
    const latestPriceTransaction = transactions.reduce((latest, current) => 
      new Date(current.lastPriceUpdate || current.updatedAt || current.purchaseDate) > 
      new Date(latest.lastPriceUpdate || latest.updatedAt || latest.purchaseDate) ? current : latest
    );

    const position: PortfolioPosition = {
      id: key,
      assetDefinition,
      name: assetDefinition?.fullName || firstTransaction.name,
      ticker: assetDefinition?.ticker || firstTransaction.ticker,
      type: assetDefinition?.type || firstTransaction.type,
      sector: assetDefinition?.sector || firstTransaction.sector,
      country: assetDefinition?.country || firstTransaction.country,
      currency: assetDefinition?.currency || 'EUR',
      
      totalQuantity,
      averagePurchasePrice,
      totalInvestment,
      currentValue,
      currentPrice: latestPriceTransaction.currentPrice,
      
      totalReturn,
      totalReturnPercentage,
      
      monthlyIncome,
      annualIncome,
      
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
  // Use AssetDefinition dividend info if available, otherwise fall back to transaction dividend info
  const dividendInfo = assetDefinition?.dividendInfo || sampleTransaction.dividendInfo;
  const assetType = assetDefinition?.type || sampleTransaction.type;
  const interestRate = assetDefinition?.bondInfo?.interestRate || sampleTransaction.interestRate;
  const rentalInfo = assetDefinition?.rentalInfo;
  const rentalIncome = sampleTransaction.rentalIncome;

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
    const currentValue = sampleTransaction.currentValue || sampleTransaction.value || 0;
    const annualInterest = (interestRate * currentValue) / 100;
    const monthlyInterest = annualInterest / 12;
    Logger.infoService(
      `${assetType} interest calculation: rate=${interestRate}%, value=${currentValue}, monthly=${monthlyInterest}`
    );
    return isFinite(monthlyInterest) ? monthlyInterest : 0;
  }

  // Real estate rental income
  if (assetType === 'real_estate') {
    // Prefer AssetDefinition rental info
    const baseRent = rentalInfo?.baseRent || rentalIncome?.amount || 0;
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
