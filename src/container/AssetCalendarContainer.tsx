import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { calculateAssetIncomeForMonth } from '../service/calculatorService/methods/calculateAssetIncome';
import { Asset, AssetType } from '../types';
import AssetCalendarView from '../view/AssetCalendarView';
import calculatorService from '../service/calculatorService';
import Logger from '../service/Logger/logger';
import { getCurrentQuantity } from '../utils/transactionCalculations';

interface MonthData {
  month: number;
  name: string;
  totalIncome: number;
  assets: Array<{
    asset: Asset;
    income: number;
  }>;
}

interface ChartData {
  month: string;
  income: number;
  isSelected: boolean;
  monthNumber: number;
}

interface AssetCalendarContainerProps {
  onBack?: () => void;
}

const AssetCalendarContainer: React.FC<AssetCalendarContainerProps> = ({ onBack }) => {
  const assets = useSelector((state: RootState) => state.assets.items);
  const { t } = useTranslation();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'all'>('all');

  // Memoize month names to prevent recreation on every render
  const monthNames = useMemo(() => [
    t('dates.months.january'), 
    t('dates.months.february'), 
    t('dates.months.march'), 
    t('dates.months.april'), 
    t('dates.months.may'), 
    t('dates.months.june'),
    t('dates.months.july'), 
    t('dates.months.august'), 
    t('dates.months.september'), 
    t('dates.months.october'), 
    t('dates.months.november'), 
    t('dates.months.december')
  ], [t]);

  // Memoize asset type options to prevent recreation
  const assetTypeOptions = useMemo(() => [
    { value: 'all' as const, label: t('assets.types.all') },
    { value: 'stock' as const, label: t('assets.types.stock') + 'en' },
    { value: 'bond' as const, label: t('assets.types.bond') + 'n' },
    { value: 'real_estate' as const, label: t('assets.types.real_estate') + 'n' },
    { value: 'crypto' as const, label: t('assets.types.crypto') + 'n' },
    { value: 'cash' as const, label: t('assets.types.cash') },
    { value: 'other' as const, label: t('assets.types.other') },
  ], [t]);

  // Memoize filtered assets to prevent unnecessary recalculations
  const filteredAssets = useMemo(() => {
    return selectedAssetType === 'all' 
      ? assets 
      : assets.filter(asset => asset.type === selectedAssetType);
  }, [assets, selectedAssetType]);

  // Helper function to get income from cache result
  const getIncomeFromCacheResult = useCallback((cacheResult: any, asset: Asset, month: number): number => {
    if (cacheResult.cacheHit && cacheResult.monthlyBreakdown) {
      const monthlyIncome = cacheResult.monthlyBreakdown[month] || 0;
      Logger.cache(`Cache hit for asset ${asset.name} month ${month}: ${monthlyIncome}`);
      return monthlyIncome;
    }
    
    if (!cacheResult.cacheHit && cacheResult.cacheDataToUpdate) {
      const monthlyIncome = cacheResult.cacheDataToUpdate.monthlyBreakdown?.[month] || 0;
      Logger.cache(`Using cacheDataToUpdate for ${asset.name} month ${month}: ${monthlyIncome}`);
      return monthlyIncome;
    }
    
    Logger.cache(`No usable cache data for ${asset.name}, falling back to direct calculation`);
    return 0;
  }, []);

  // Helper function to try cached calculation
  const tryGetCachedIncome = useCallback((asset: Asset, month: number): number => {
    if (!calculatorService.calculateAssetMonthlyIncomeWithCache) return 0;
    
    Logger.cache(`Trying cached calculation for ${asset.name}`);
    try {
      const cacheResult = calculatorService.calculateAssetMonthlyIncomeWithCache(asset);
      Logger.cache(`Cache result for ${asset.name}: cacheHit=${cacheResult.cacheHit}, monthlyAmount=${cacheResult.monthlyAmount}`);
      return getIncomeFromCacheResult(cacheResult, asset, month);
    } catch (error) {
      Logger.cache(`Error in cached calculation for ${asset.name}: ${error}`);
      return 0;
    }
  }, [getIncomeFromCacheResult]);

  // Helper function to try direct calculation
  const tryGetDirectIncome = useCallback((asset: Asset, month: number): number => {
    Logger.cache(`Falling back to direct calculation for ${asset.name} month ${month}`);
    try {
      const income = calculateAssetIncomeForMonth(asset, month);
      Logger.cache(`Direct calculation result for ${asset.name} month ${month}: ${income}`);
      return income;
    } catch (error) {
      Logger.cache(`Error in direct calculation for ${asset.name}: ${error}`);
      return 0;
    }
  }, []);

  // Helper function to try basic monthly calculation as fallback
  const tryGetBasicMonthlyIncome = useCallback((asset: Asset, calculatedIncome: number): number => {
    try {
      const basicMonthly = calculatorService.calculateAssetMonthlyIncome(asset);
      Logger.cache(`Basic monthly calculation for ${asset.name}: ${basicMonthly}`);
      
      const dividendInfo = asset.assetDefinition?.dividendInfo;
      const isMonthlyDividendStock = asset.type === 'stock' && dividendInfo?.frequency === 'monthly';
      if (isMonthlyDividendStock && calculatedIncome === 0 && basicMonthly > 0) {
        Logger.cache(`Using basic monthly calculation as fallback for ${asset.name}: ${basicMonthly}`);
        return basicMonthly;
      }
    } catch (error) {
      Logger.cache(`Error in basic calculation for ${asset.name}: ${error}`);
    }
    return calculatedIncome;
  }, []);

  // Memoize the calculation of asset income for a specific month using cache
  const calculateAssetIncomeForMonthCached = useCallback((asset: Asset, month: number): number => {
    Logger.cache(`=== Starting calculation for ${asset.name} (${asset.type}) month ${month} ===`);
    
    // Log asset details first
    Logger.cache(`Asset details - Type: ${asset.type}, Value: ${asset.value}`);
    if (asset.type === 'stock') {
      const quantity = getCurrentQuantity(asset);
      const dividendInfo = asset.assetDefinition?.dividendInfo;
      Logger.cache(`Stock details - Quantity: ${quantity}, DividendInfo: ${JSON.stringify(dividendInfo)}`);
    }
    
    // Try cached calculation first
    let calculatedIncome = tryGetCachedIncome(asset, month);
    
    // If no cached income, try direct calculation
    if (calculatedIncome === 0) {
      calculatedIncome = tryGetDirectIncome(asset, month);
    }
    
    // Try basic monthly calculation as fallback for monthly dividends
    calculatedIncome = tryGetBasicMonthlyIncome(asset, calculatedIncome);
    
    Logger.cache(`=== Final income for ${asset.name} month ${month}: ${calculatedIncome} ===`);
    return calculatedIncome;
  }, [tryGetCachedIncome, tryGetDirectIncome, tryGetBasicMonthlyIncome]);

  // Memoize months data calculation with proper dependencies
  const monthsData = useMemo(() => {
    Logger.info(`Calculating months data for ${filteredAssets.length} filtered assets`);
    
    // Log asset details for debugging
    filteredAssets.forEach(asset => {
      Logger.info(`Asset: ${asset.name} (${asset.type}) - Value: ${asset.value}`);
      
      // Check dividend info from AssetDefinition or legacy Asset fields
      const dividendInfo = asset.assetDefinition?.dividendInfo;
      if (asset.type === 'stock' && dividendInfo) {
        Logger.info(`  Dividend Info: frequency=${dividendInfo.frequency}, amount=${dividendInfo.amount} (source: definition)`);
      }
      
      // Check interest rate from AssetDefinition or legacy Asset fields
      const interestRate = asset.assetDefinition?.bondInfo?.interestRate;
      if (asset.type === 'bond' && interestRate) {
        Logger.info(`  Interest Rate: ${interestRate}% (source: definition)`);
      }
      
      // Check rental info from AssetDefinition or legacy Asset fields
      const rentalInfo = asset.assetDefinition?.rentalInfo;
      if (asset.type === 'real_estate' && rentalInfo) {
        const amount = rentalInfo.baseRent;
        Logger.info(`  Rental Income: ${amount} (source: definition)`);
      }
    });
    
    const data: MonthData[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthAssets: Array<{ asset: Asset; income: number }> = [];
      let totalIncome = 0;

      filteredAssets.forEach((asset: Asset) => {
        const income = calculateAssetIncomeForMonthCached(asset, month);
        Logger.cache(`Asset ${asset.name} income for month ${month}: ${income}`);
        
        if (income > 0) {
          monthAssets.push({ asset, income });
          totalIncome += income;
        }
      });

      Logger.info(`Month ${month} (${monthNames[month - 1]}): ${monthAssets.length} assets with income, total: ${totalIncome}`);

      // Sort by income descending - using toSorted to avoid mutating the original array
      const sortedMonthAssets = monthAssets.toSorted((a, b) => b.income - a.income);

      data.push({
        month,
        name: monthNames[month - 1],
        totalIncome,
        assets: sortedMonthAssets
      });
    }

    Logger.info(`Months data calculated for ${data.length} months`);
    
    // Log summary of months with income
    const monthsWithIncome = data.filter(m => m.totalIncome > 0);
    Logger.info(`Months with income: ${monthsWithIncome.length} out of ${data.length}`);
    monthsWithIncome.forEach(m => {
      Logger.info(`  ${m.name}: ${m.totalIncome} from ${m.assets.length} assets`);
    });
    
    return data;
  }, [filteredAssets, monthNames, calculateAssetIncomeForMonthCached]);

  // Memoize selected month data
  const selectedMonthData = useMemo(() => {
    return monthsData.find(m => m.month === selectedMonth);
  }, [monthsData, selectedMonth]);

  // Memoize chart data with proper dependencies
  const chartData = useMemo((): ChartData[] => {
    const shortMonthsObj = t('dates.shortMonths', { returnObjects: true }) as Record<string, string>;
    const shortMonthsKeys = Object.keys(shortMonthsObj);
    
    return monthsData.map((monthData, index) => {
      const monthKey = shortMonthsKeys[index]; // Use index directly since monthsData is ordered 1-12
      return {
        month: shortMonthsObj[monthKey], // Translated short month name
        income: monthData.totalIncome,
        isSelected: monthData.month === selectedMonth, // This should work correctly now
        monthNumber: monthData.month // Add month number for debugging
      };
    });
  }, [monthsData, selectedMonth, t]);

  // Handle bar click for month selection with memoized callback
  const handleBarClick = useCallback((data: any) => {
    const clickedMonthName = data?.activePayload?.[0]?.payload?.month;
    if (clickedMonthName) {
      const shortMonthsObj = t('dates.shortMonths', { returnObjects: true }) as Record<string, string>;
      const shortMonths = Object.values(shortMonthsObj);
      const monthIndex = shortMonths.findIndex(shortName => shortName === clickedMonthName);
      if (monthIndex !== -1) {
        const newSelectedMonth = monthIndex + 1;
        Logger.info(`Month clicked: ${clickedMonthName} (index: ${monthIndex + 1})`);
        setSelectedMonth(newSelectedMonth);
      }
    }
  }, [t]);

  // Handle asset type filter change with memoized callback
  const handleAssetTypeChange = useCallback((newType: AssetType | 'all') => {
    Logger.info(`Asset type filter changed to: ${newType}`);
    setSelectedAssetType(newType);
  }, []);

  // Log when component mounts or key data changes
  useEffect(() => {
    Logger.info(`AssetCalendarContainer: ${assets.length} total assets, ${filteredAssets.length} filtered assets`);
  }, [assets.length, filteredAssets.length]);

  return (
    <AssetCalendarView
      selectedMonthData={selectedMonthData}
      chartData={chartData}
      selectedAssetType={selectedAssetType}
      assetTypeOptions={assetTypeOptions}
      filteredAssets={filteredAssets}
      assets={assets}
      onBarClick={handleBarClick}
      onAssetTypeChange={handleAssetTypeChange}
      onBack={onBack}
    />
  );
};

export default AssetCalendarContainer;
