import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import Logger from '../../service/Logger/logger';
import PerformanceAnalyticsView from '../../view/analytics/performance/PerformanceAnalyticsView';
import { getCurrentQuantity, getCurrentValue } from '../../utils/transactionCalculations';

interface PerformanceAnalyticsContainerProps {
  onBack?: () => void;
}

const PerformanceAnalyticsContainer: React.FC<PerformanceAnalyticsContainerProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'returns' | 'historical'>('portfolio');
  
  const { items: assets, portfolioCache } = useAppSelector(state => state.assets);

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
        hasHistoricalData: false
      };
    }

    const totals = portfolioCache.totals;
    const currentValue = totals.totalValue;
    const totalReturn = totals.totalReturn;
    const totalReturnPercent = totals.totalReturnPercentage;
    
    // Calculate simple performance metrics from positions
    const positionValues = portfolioCache.positions.map((position: any) => position.currentValue);
    const peakValue = Math.max(...positionValues, currentValue);
    const lowestValue = Math.min(...positionValues.filter((v: number) => v > 0), currentValue);
    
    // Calculate basic volatility from position returns
    const positionReturns = portfolioCache.positions
      .map((position: any) => position.totalReturnPercentage)
      .filter((ret: number) => isFinite(ret));
    
    let volatility = 0;
    if (positionReturns.length > 0) {
      const avgReturn = positionReturns.reduce((sum: number, ret: number) => sum + ret, 0) / positionReturns.length;
      const variance = positionReturns.reduce((sum: number, ret: number) => sum + Math.pow(ret - avgReturn, 2), 0) / positionReturns.length;
      volatility = Math.sqrt(variance);
    }

    return {
      currentValue,
      totalReturn,
      totalReturnPercent,
      peakValue,
      lowestValue,
      volatility: isNaN(volatility) ? 0 : volatility,
      hasHistoricalData: portfolioCache.positions.length > 0
    };
  }, [portfolioCache]);

  // Asset performance data using proper utility functions
  const assetPerformance = useMemo(() => {
    return assets.map((asset: any) => {
      const currentValue = getCurrentValue(asset);
      const quantity = getCurrentQuantity(asset);
      const purchaseValue = (quantity * (asset.purchasePrice || 0)) + (asset.transactionCosts || 0);
      const gain = currentValue - purchaseValue;
      const gainPercent = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

      return {
        ...asset,
        currentValue,
        purchaseValue,
        gain,
        gainPercent
      };
    }).sort((a: any, b: any) => b.gainPercent - a.gainPercent);
  }, [assets]);

  const handleTabChange = (tab: 'portfolio' | 'returns' | 'historical') => {
    Logger.info(`Performance Analytics: Switching to ${tab} tab`);
    setSelectedTab(tab);
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
