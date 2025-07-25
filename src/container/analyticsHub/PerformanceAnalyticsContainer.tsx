import React, { useState, useMemo, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { Transaction as Asset } from '@/types/domains/assets/';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import Logger from '@/service/shared/logging/Logger/logger';
import PerformanceAnalyticsView from '@/view/analytics-hub/performance/PerformanceAnalyticsView';
import { getCurrentQuantity, getCurrentValue } from '../../utils/transactionCalculations';
import recentActivityService from '@/service/domain/analytics/reporting/recentActivityService';
import { AnalyticsSubCategory } from '@/types/domains/analytics/reporting';

type PerformanceTab = 'portfolio' | 'returns' | 'historical';

// Mapping from performance tabs to analytics subcategories
const performanceTabToAnalyticsMapping: Record<PerformanceTab, AnalyticsSubCategory> = {
  portfolio: 'portfolioPerformance',
  returns: 'returns',
  historical: 'historical'
};

interface PerformanceAnalyticsContainerProps {
  selectedTab?: PerformanceTab;
  onBack?: () => void;
}

const PerformanceAnalyticsContainer: React.FC<PerformanceAnalyticsContainerProps> = ({ 
  selectedTab: initialTab = 'portfolio', 
  onBack 
}) => {
  const [selectedTab, setSelectedTab] = useState<PerformanceTab>(initialTab);
  
  const { items: assets, cache: portfolioCache } = useAppSelector(state => state.transactions);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Update selected tab when initialTab prop changes
  useEffect(() => {
    setSelectedTab(initialTab);
  }, [initialTab]);

  // Calculate performance metrics from portfolio cache
  const performanceData = useMemo(() => {
    if (!portfolioCache?.positions || portfolioCache.positions.length === 0) {
      return {
        currentValue: portfolioCache?.totals?.totalValue || 0,
        totalReturn: portfolioCache?.totals?.totalReturn || 0,
        totalReturnPercent: portfolioCache?.totals?.totalReturnPercentage || 0,
        peakValue: portfolioCache?.totals?.totalValue || 0,
        lowestValue: portfolioCache?.totals?.totalValue || 0,
        volatility: 0,
        hasHistoricalData: false,
        dailyReturn: 0,
        monthlyReturn: 0,
        annualizedReturn: 0,
        sharpeRatio: 0
      };
    }

    const totals = portfolioCache.totals;
    const currentValue = totals.totalValue;
    const totalReturn = totals.totalReturn;
    const totalReturnPercent = totals.totalReturnPercentage;
    
    // Calculate simple performance metrics from positions
    const positionValues = portfolioCache.positions.map((position: PortfolioPosition) => position.currentValue);
    const peakValue = Math.max(...positionValues, currentValue);
    const lowestValue = Math.min(...positionValues.filter((v: number) => v > 0), currentValue);
    
    // Calculate basic volatility from position returns
    const positionReturns = portfolioCache.positions
      .map((position: PortfolioPosition) => position.totalReturnPercentage)
      .filter((ret: number) => isFinite(ret));
    
    let volatility = 0;
    if (positionReturns.length > 0) {
      const avgReturn = positionReturns.reduce((sum: number, ret: number) => sum + ret, 0) / positionReturns.length;
      const variance = positionReturns.reduce((sum: number, ret: number) => sum + Math.pow(ret - avgReturn, 2), 0) / positionReturns.length;
      volatility = Math.sqrt(variance);
    }

    // Calculate additional performance metrics
    const dailyReturn = totalReturnPercent / 365; // Simple approximation
    const monthlyReturn = totalReturnPercent / 12; // Simple approximation
    const annualizedReturn = totalReturnPercent; // Already annualized in most cases
    
    // Calculate Sharpe Ratio (simplified - assuming risk-free rate of 2%)
    const riskFreeRate = 2.0;
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;

    return {
      currentValue,
      totalReturn,
      totalReturnPercent,
      peakValue,
      lowestValue,
      volatility: isNaN(volatility) ? 0 : volatility,
      hasHistoricalData: portfolioCache.positions.length > 0,
      dailyReturn: isNaN(dailyReturn) ? 0 : dailyReturn,
      monthlyReturn: isNaN(monthlyReturn) ? 0 : monthlyReturn,
      annualizedReturn: isNaN(annualizedReturn) ? 0 : annualizedReturn,
      sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio
    };
  }, [portfolioCache]);

  // Asset performance data using proper utility functions
  const assetPerformance = useMemo(() => {
    interface AssetPerformanceItem {
      id: string;
      name: string;
      symbol?: string;
      currentValue: number;
      purchaseValue: number;
      invested: number;
      gain: number;
      gainPercent: number;
    }

    return assets.map((asset: Asset): AssetPerformanceItem => {
      const currentValue = getCurrentValue(asset);
      const quantity = getCurrentQuantity(asset);
      const purchaseValue = (quantity * (asset.purchasePrice || 0)) + (asset.transactionCosts || 0);
      const gain = currentValue - purchaseValue;
      const gainPercent = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.assetDefinition?.ticker,
        currentValue,
        purchaseValue,
        invested: purchaseValue,
        gain,
        gainPercent
      };
    }).sort((a: AssetPerformanceItem, b: AssetPerformanceItem) => b.gainPercent - a.gainPercent);
  }, [assets]);

  // Handle tab change with activity tracking
  const handleTabChange = (newTab: PerformanceTab) => {
    Logger.info(`Performance Analytics: Changing tab to ${newTab}`);
    
    // Get the analytics subcategory mapping
    const oldAnalyticsSubCategory = performanceTabToAnalyticsMapping[selectedTab];
    const newAnalyticsSubCategory = performanceTabToAnalyticsMapping[newTab];
    
    // Update the recent activity to reflect the new tab
    recentActivityService.replaceAnalyticsActivity(
      'performance', oldAnalyticsSubCategory,
      'performance', newAnalyticsSubCategory
    );
    
    setSelectedTab(newTab);
  };

  return (
    <PerformanceAnalyticsView
      selectedTab={selectedTab}
      performanceData={performanceData}
      assetPerformance={assetPerformance}
      onTabChange={handleTabChange}
      onBack={onBack}
    />
  );
};

export default PerformanceAnalyticsContainer;
