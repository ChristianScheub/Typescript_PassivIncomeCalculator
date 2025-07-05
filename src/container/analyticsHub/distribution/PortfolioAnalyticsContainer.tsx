import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import { calculatorService } from '@/service/';
import { AssetType } from '@/types/shared/base/enums';
import { selectPortfolioCache } from '@/store/slices/transactionsSlice';
import PortfolioAnalyticsView from '@/view/analytics-hub/distributions/assets/PortfolioAnalyticsView';

type AnalyticsTab = 'asset_distribution' | 'income_distribution' | 'custom';

interface PortfolioAnalyticsContainerProps {
  onBack: () => void;
}

const PortfolioAnalyticsContainer: React.FC<PortfolioAnalyticsContainerProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<AnalyticsTab>('asset_distribution');
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'all'>('all');
  
  // Get portfolio data from Redux cache (should be available after initialization)
  const portfolioCache = useAppSelector(selectPortfolioCache);
  // NEU: AssetDefinitions aus Store laden
  const assetDefinitions = useAppSelector((state) => state.assetDefinitions.items);

  // Note: Portfolio cache should be available after app initialization
  // If not available, the app initialization will handle recalculation
  // No need for manual triggering here as it's handled centrally
  
  // Calculate analytics data from portfolio positions with asset type filtering
  const { portfolioAnalytics, incomeAnalytics, filteredPositions } = useMemo(() => {
    if (!portfolioCache?.positions.length) {
      return {
        portfolioAnalytics: {
          assetAllocation: [],
          sectorAllocation: [],
          countryAllocation: [],
          categoryAllocation: [],
          categoryBreakdown: []
        },
        incomeAnalytics: {
          assetTypeIncome: [],
          sectorIncome: [],
          countryIncome: [],
          categoryIncome: [],
          categoryIncomeBreakdown: []
        },
        filteredPositions: []
      };
    }
    
    // Filter positions by asset type if a specific type is selected
    const filtered = selectedAssetType === 'all' 
      ? portfolioCache.positions 
      : portfolioCache.positions.filter(position => position.type === selectedAssetType);
    // Fix: AssetDefinitions an calculatePortfolioAnalytics/incomeAnalytics übergeben
    return {
      portfolioAnalytics: calculatorService.calculatePortfolioAnalytics(filtered, assetDefinitions || []),
      incomeAnalytics: calculatorService.calculateIncomeAnalytics(filtered, assetDefinitions || []),
      filteredPositions: filtered
    };
  }, [portfolioCache?.positions, selectedAssetType, assetDefinitions]);

  const handleTabChange = (tab: AnalyticsTab) => {
    setSelectedTab(tab);
  };

  const handleAssetTypeFilterChange = (assetType: AssetType | 'all') => {
    setSelectedAssetType(assetType);
  };

  return (
    <PortfolioAnalyticsView
      selectedTab={selectedTab}
      selectedAssetType={selectedAssetType}
      assetAllocation={(portfolioAnalytics.assetAllocation || []).map((item: { name: string; value: number; percentage: number }) => ({ ...item, type: item.name }))}
      sectorAllocation={portfolioAnalytics.sectorAllocation || []}
      countryAllocation={portfolioAnalytics.countryAllocation || []}
      assetTypeIncome={incomeAnalytics.assetTypeIncome || []}
      sectorIncome={incomeAnalytics.sectorIncome || []}
      countryIncome={incomeAnalytics.countryIncome || []}
      portfolioPositions={filteredPositions || []}
      onTabChange={handleTabChange}
      onAssetTypeFilterChange={handleAssetTypeFilterChange}
      onBack={onBack}
    />
  );
};

export default PortfolioAnalyticsContainer;
