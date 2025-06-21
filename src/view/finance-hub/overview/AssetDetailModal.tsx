import React from 'react';
import { Asset, AssetDefinition } from '../../../types/domains/assets/entities';
import { AssetDetailView } from '../../portfolio-hub/assets/AssetDetailView';
import { PortfolioPosition } from '../../../types/domains/portfolio/position';
import { formatService } from '../../../service';
import { DividendFrequency } from '../../../types/shared/base/enums';

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
  if (!asset || !assetDefinition || !isOpen) return null;

  const currentValue = (asset.purchaseQuantity || 0) * (assetDefinition.currentPrice || 0);
  const totalInvestment = asset.value || 0;
  const totalReturn = currentValue - totalInvestment;
  const totalReturnPercentage = totalInvestment > 0 
    ? (totalReturn / totalInvestment) * 100 
    : 0;

  // Initialize income values
  let monthlyIncome = 0;
  let annualIncome = 0;

  // If dividend info is available, calculate income
  if (assetDefinition.dividendInfo) {
    const frequency = assetDefinition.dividendInfo.frequency;
    const amount = assetDefinition.dividendInfo.amount || 0;
    const quantity = asset.purchaseQuantity || 0;
    
    // Calculate annual income based on frequency
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
      // Add other cases as needed
      default:
        annualMultiplier = 0;
    }
    
    annualIncome = amount * quantity * annualMultiplier;
    monthlyIncome = annualIncome / 12;
  }

  // Determine purchase dates
  const purchaseDate = asset.purchaseDate;

  // Convert Asset and AssetDefinition to PortfolioPosition format
  // that's expected by the AssetDetailView
  const portfolioPosition: PortfolioPosition = {
    id: asset.id,
    name: assetDefinition.name || assetDefinition.fullName,
    type: asset.type,
    ticker: assetDefinition.ticker || '',
    totalQuantity: asset.purchaseQuantity || 0,
    totalInvestment: totalInvestment,
    currentValue: currentValue,
    averagePurchasePrice: asset.purchasePrice || 0,
    monthlyIncome: monthlyIncome,
    annualIncome: annualIncome,
    totalReturn: totalReturn,
    totalReturnPercentage: totalReturnPercentage,
    transactions: [asset], // Include the current asset as a transaction
    assetDefinition, // Include the full asset definition
    sector: assetDefinition.sector || '',
    country: assetDefinition.country || '',
    categoryAssignments: [], // Can be empty or populated if available
    // Add required properties for PortfolioPosition
    transactionCount: 1,
    firstPurchaseDate: purchaseDate,
    lastPurchaseDate: purchaseDate,
    // Add formatted values
    formatted: {
      currentValue: formatService.formatCurrency(currentValue),
      totalInvestment: formatService.formatCurrency(totalInvestment),
      totalReturn: formatService.formatCurrency(totalReturn),
      totalReturnPercentage: formatService.formatPercentage(totalReturnPercentage),
      monthlyIncome: formatService.formatCurrency(monthlyIncome),
      annualIncome: formatService.formatCurrency(annualIncome),
      averagePurchasePrice: formatService.formatCurrency(asset.purchasePrice || 0),
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
