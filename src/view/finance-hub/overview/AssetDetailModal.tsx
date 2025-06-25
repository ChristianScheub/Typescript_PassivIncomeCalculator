import React from 'react';
import { Asset, AssetDefinition } from '@/types/domains/assets/entities';
import { AssetDetailView } from '../../portfolio-hub/assets/AssetDetailView';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { formatService } from '../../../service';
import { DividendFrequency } from '@/types/shared/base/enums';
import { useAppSelector } from '../../../hooks/redux';

interface AssetDetailModalProps {
  asset: Asset | null;
  assetDefinition: AssetDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  getAssetTypeLabel: (type: string) => string;
}

/**
 * Modal wrapper for AssetDetailView
 * This component converts the Asset and AssetDefinition into a PortfolioPosition
 * for use with the existing AssetDetailView component.
 */
const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  assetDefinition,
  isOpen,
  onClose,
  getAssetTypeLabel,
}) => {
  const allAssets = useAppSelector(state => state.transactions.items);
  
  if (!asset || !assetDefinition || !isOpen) return null;

  // Find all transactions for the same asset definition ID
  const relatedTransactions = allAssets.filter((a: Asset) => 
    a.assetDefinitionId === asset.assetDefinitionId
  );

  // Calculate aggregated values from all transactions (considering buy/sell)
  const totalQuantity = relatedTransactions.reduce((sum: number, a: Asset) => {
    const quantity = a.transactionType === 'sell' ? -(a.purchaseQuantity || 0) : (a.purchaseQuantity || 0);
    return sum + quantity;
  }, 0);
  
  const totalInvestment = relatedTransactions.reduce((sum: number, a: Asset) => {
    const investment = a.transactionType === 'sell' ? -(a.value || 0) : (a.value || 0);
    return sum + investment;
  }, 0);
  
  const currentValue = totalQuantity * (assetDefinition.currentPrice || 0);
  const totalReturn = currentValue - totalInvestment;
  const totalReturnPercentage = totalInvestment > 0 
    ? (totalReturn / totalInvestment) * 100 
    : 0;
  
  // Calculate average purchase price (only from buy transactions)
  const buyTransactions = relatedTransactions.filter((a: Asset) => a.transactionType === 'buy');
  const totalBuyQuantity = buyTransactions.reduce((sum: number, a: Asset) => sum + (a.purchaseQuantity || 0), 0);
  const totalBuyInvestment = buyTransactions.reduce((sum: number, a: Asset) => sum + (a.value || 0), 0);
  const averagePurchasePrice = totalBuyQuantity > 0 ? totalBuyInvestment / totalBuyQuantity : 0;

  // Initialize income values
  let monthlyIncome = 0;
  let annualIncome = 0;

  // If dividend info is available, calculate income
  if (assetDefinition.dividendInfo) {
    const frequency = assetDefinition.dividendInfo.frequency;
    const amount = assetDefinition.dividendInfo.amount || 0;
    
    // Calculate annual income based on frequency and total quantity
    let annualMultiplier = 0;
    switch (frequency) {
      case 'monthly' as DividendFrequency:
        annualMultiplier = 12;
        break;
      case 'quarterly' as DividendFrequency:
        annualMultiplier = 4;
        break;
      case 'annually' as DividendFrequency:
        annualMultiplier = 1;
        break;
      // Other frequencies default to 0 (already initialized)
    }
    
    annualIncome = amount * totalQuantity * annualMultiplier;
    monthlyIncome = annualIncome / 12;
  }

  // Determine purchase dates from all transactions
  const purchaseDates = relatedTransactions.map((a: Asset) => a.purchaseDate).filter(Boolean);
  const firstPurchaseDate = purchaseDates.length > 0 ? 
    new Date(Math.min(...purchaseDates.map((d: string) => new Date(d).getTime()))).toISOString() : 
    asset.purchaseDate;
  const lastPurchaseDate = purchaseDates.length > 0 ? 
    new Date(Math.max(...purchaseDates.map((d: string) => new Date(d).getTime()))).toISOString() : 
    asset.purchaseDate;

  // Convert Asset and AssetDefinition to PortfolioPosition format
  // that's expected by the AssetDetailView
  const portfolioPosition: PortfolioPosition = {
    id: asset.id,
    name: assetDefinition.name || assetDefinition.fullName,
    type: asset.type,
    ticker: assetDefinition.ticker || '',
    totalQuantity: totalQuantity,
    totalInvestment: totalInvestment,
    currentValue: currentValue,
    averagePurchasePrice: averagePurchasePrice,
    monthlyIncome: monthlyIncome,
    annualIncome: annualIncome,
    totalReturn: totalReturn,
    totalReturnPercentage: totalReturnPercentage,
    transactions: relatedTransactions, // Include ALL related transactions
    sector: assetDefinition.sector || '',
    country: assetDefinition.country || '',
    categoryAssignments: [], // Can be empty or populated if available
    transactionCount: relatedTransactions.length,
    firstPurchaseDate: firstPurchaseDate,
    lastPurchaseDate: lastPurchaseDate,
    formatted: {
      currentValue: formatService.formatCurrency(currentValue),
      totalInvestment: formatService.formatCurrency(totalInvestment),
      totalReturn: formatService.formatCurrency(totalReturn),
      totalReturnPercentage: formatService.formatPercentage(totalReturnPercentage),
      monthlyIncome: formatService.formatCurrency(monthlyIncome),
      annualIncome: formatService.formatCurrency(annualIncome),
      averagePurchasePrice: formatService.formatCurrency(averagePurchasePrice),
      currentPrice: formatService.formatCurrency(assetDefinition.currentPrice || 0)
    }
  };

  return (
    <AssetDetailView
      asset={portfolioPosition}
      isOpen={isOpen}
      onClose={onClose}
      getAssetTypeLabel={getAssetTypeLabel}
    />
  );
};

export default AssetDetailModal;
