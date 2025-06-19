import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import Logger from '../../service/Logger/logger';
import AssetCalendarView from '../../view/portfolio-hub/assets/AssetCalendarView';
import { AssetType } from '../../types/shared';
import { PortfolioPosition } from '../../types/domains/portfolio/position';

interface AssetCalendarContainerProps {
  selectedTab?: 'calendar' | 'history' | 'timeline';
  onBack?: () => void;
}

interface MonthData {
  month: number;
  name: string;
  totalIncome: number;
  positions: Array<{
    position: PortfolioPosition;
    income: number;
  }>;
}

interface ChartData {
  month: string;
  income: number;
  isSelected: boolean;
  monthNumber?: number;
}

const AssetCalendarContainer: React.FC<AssetCalendarContainerProps> = ({ 
  selectedTab = 'calendar',
  onBack 
}) => {
  const { portfolioCache } = useAppSelector(state => state.transactions);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'all'>('all');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Log access
  useEffect(() => {
    Logger.info(`Asset Calendar accessed - tab: ${selectedTab}`);
  }, [selectedTab]);

  // Get positions from portfolio cache
  const positions: PortfolioPosition[] = useMemo(() => {
    return portfolioCache?.positions || [];
  }, [portfolioCache]);

  // Asset type options
  const assetTypeOptions = useMemo(() => [
    { value: 'all' as const, label: 'All Assets' },
    { value: 'stock' as AssetType, label: 'Stocks' },
    { value: 'bond' as AssetType, label: 'Bonds' },
    { value: 'etf' as AssetType, label: 'ETFs' },
    { value: 'crypto' as AssetType, label: 'Crypto' },
    { value: 'real-estate' as AssetType, label: 'Real Estate' },
    { value: 'other' as AssetType, label: 'Other' }
  ], []);

  // Filter positions by asset type
  const filteredAssets = useMemo(() => {
    if (selectedAssetType === 'all') return positions;
    return positions.filter(position => position.type === selectedAssetType);
  }, [positions, selectedAssetType]);

  // Generate chart data for 12 months
  const chartData: ChartData[] = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      const monthNumber = index + 1;
      const monthPositions = filteredAssets.filter(pos => pos.monthlyIncome > 0);
      const totalIncome = monthPositions.reduce((sum, pos) => sum + pos.monthlyIncome, 0);
      
      return {
        month,
        income: totalIncome,
        isSelected: monthNumber === selectedMonth,
        monthNumber
      };
    });
  }, [filteredAssets, selectedMonth]);

  // Get selected month data
  const selectedMonthData: MonthData | undefined = useMemo(() => {
    if (!selectedMonth) return undefined;
    
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthPositions = filteredAssets
      .filter(pos => pos.monthlyIncome > 0)
      .map(position => ({
        position,
        income: position.monthlyIncome
      }))
      .sort((a, b) => b.income - a.income);

    const totalIncome = monthPositions.reduce((sum, item) => sum + item.income, 0);

    return {
      month: selectedMonth,
      name: monthNames[selectedMonth],
      totalIncome,
      positions: monthPositions
    };
  }, [selectedMonth, filteredAssets]);

  const handleBarClick = (data: any) => {
    if (data.monthNumber) {
      setSelectedMonth(data.monthNumber);
    }
  };

  const handleAssetTypeChange = (type: AssetType | 'all') => {
    setSelectedAssetType(type);
  };

  return (
    <AssetCalendarView
      selectedMonthData={selectedMonthData}
      chartData={chartData}
      selectedAssetType={selectedAssetType}
      assetTypeOptions={assetTypeOptions}
      filteredAssets={filteredAssets}
      positions={positions}
      onBarClick={handleBarClick}
      onAssetTypeChange={handleAssetTypeChange}
      onBack={onBack}
    />
  );
};

export default AssetCalendarContainer;
