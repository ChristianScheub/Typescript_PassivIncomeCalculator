import React, { useState, useMemo, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import Logger from '../../service/Logger/logger';
import PerformanceAnalyticsView from '../../view/analytics-hub/performance/PerformanceAnalyticsView';
import { getCurrentQuantity, getCurrentValue } from '../../utils/transactionCalculations';

interface PerformanceAnalyticsContainerProps {
  selectedTab?: 'portfolio' | 'returns' | 'historical';
  onBack?: () => void;
}

const PerformanceAnalyticsContainer: React.FC<PerformanceAnalyticsContainerProps> = ({ 
  selectedTab: initialTab = 'portfolio', 
  onBack 
}) => {
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'returns' | 'historical'>(initialTab);
  
  const { items: assets, portfolioCache } = useAppSelector(state => state.transactions);

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
    return assets.map((asset: any) => {
      const currentValue = getCurrentValue(asset);
      const quantity = getCurrentQuantity(asset);
      const purchaseValue = (quantity * (asset.purchasePrice || 0)) + (asset.transactionCosts || 0);
      const gain = currentValue - purchaseValue;
      const gainPercent = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        currentValue,
        purchaseValue,
        invested: purchaseValue,
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
