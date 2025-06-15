import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { StoreState } from '../store';
import { AssetType } from '../types';
import AssetCalendarView from '../view/assets/AssetCalendarView';
import Logger from '../service/Logger/logger';
import { PortfolioPosition } from '../service/portfolioService/portfolioCalculations';
import { calculateDividendForMonth } from '../service/calculatorService/methods/calculatePayment';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { selectPortfolioCache, selectPortfolioCacheValid, calculatePortfolioData } from '../store/slices/assetsSlice';
// Import Action types für TypeScript-Korrektur
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

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
  monthNumber: number;
}

interface AssetCalendarContainerProps {
  onBack?: () => void;
}

const AssetCalendarContainer: React.FC<AssetCalendarContainerProps> = ({ onBack }) => {
  const assets = useSelector((state: StoreState) => state.assets.items);
  const assetDefinitions = useSelector((state: StoreState) => state.assetDefinitions.items);
  const assetCategories = useSelector((state: StoreState) => state.assetCategories.categories);
  const categoryOptions = useSelector((state: StoreState) => state.assetCategories.categoryOptions);
  const categoryAssignments = useSelector((state: StoreState) => state.assetCategories.categoryAssignments);
  
  // Use Redux cache instead of recalculating
  const dispatch = useAppDispatch();
  const portfolioCache = useAppSelector(selectPortfolioCache);
  const portfolioCacheValid = useAppSelector(selectPortfolioCacheValid);
  
  const { t } = useTranslation();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'all'>('all');

  // Ensure portfolio cache is available
  useEffect(() => {
    if (!portfolioCacheValid && assets.length > 0 && assetDefinitions.length > 0) {
      Logger.info('Portfolio cache invalid, recalculating for asset calendar');
      // Korrektur des TypeScript-Fehlers durch explizite Typzuweisung des Dispatch
      (dispatch as ThunkDispatch<StoreState, unknown, AnyAction>)(calculatePortfolioData({ 
        assetDefinitions, 
        categoryData: { categories: assetCategories, categoryOptions, categoryAssignments } 
      }));
    }
  }, [assets.length, assetDefinitions.length, portfolioCacheValid, dispatch, assetCategories, categoryOptions, categoryAssignments]);

  // Get portfolio data from cache or provide empty fallback
  const portfolioData = useMemo(() => {
    if (portfolioCache) {
      Logger.info(`Using cached portfolio data for asset calendar: ${portfolioCache.positions.length} positions`);
      return portfolioCache;
    } else {
      Logger.info('No portfolio cache available, using empty data');
      return {
        positions: [],
        totals: {
          totalValue: 0,
          totalInvestment: 0,
          totalReturn: 0,
          totalReturnPercentage: 0,
          monthlyIncome: 0,
          annualIncome: 0,
          positionCount: 0,
          transactionCount: 0
        },
        metadata: {
          lastCalculated: new Date().toISOString(),
          assetCount: assets.length,
          definitionCount: assetDefinitions.length,
          positionCount: 0
        }
      };
    }
  }, [portfolioCache, assets.length, assetDefinitions.length]);

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

  // Filter portfolio positions by asset type
  const filteredPositions = useMemo(() => {
    return selectedAssetType === 'all' 
      ? portfolioData.positions 
      : portfolioData.positions.filter(position => position.type === selectedAssetType);
  }, [portfolioData.positions, selectedAssetType]);

  // Helper functions for income calculation by asset type
  const calculateStockIncome = useCallback((position: PortfolioPosition, month: number): number => {
    const assetDefinition = position.assetDefinition;
    if (!assetDefinition) return 0;
    
    const totalQuantity = position.totalQuantity;
    
    if (!assetDefinition.dividendInfo?.frequency || 
        assetDefinition.dividendInfo.frequency === 'none' ||
        totalQuantity <= 0) {
      return 0;
    }
    
    try {
      const dividendForMonth = calculateDividendForMonth(assetDefinition.dividendInfo, totalQuantity, month);
      Logger.cache(`Dividend for ${position.name} month ${month}: ${dividendForMonth}`);
      return isFinite(dividendForMonth) ? dividendForMonth : 0;
    } catch (error) {
      Logger.cache(`Error calculating dividend for ${position.name}: ${error}`);
      return 0;
    }
  }, []);
  
  const calculateInterestIncome = useCallback((position: PortfolioPosition): number => {
    const assetDefinition = position.assetDefinition;
    if (!assetDefinition?.bondInfo?.interestRate) return 0;
    
    const interestRate = assetDefinition.bondInfo.interestRate;
    const currentValue = position.currentValue;
    const annualInterest = (interestRate * currentValue) / 100;
    const monthlyInterest = annualInterest / 12;
    
    return isFinite(monthlyInterest) ? monthlyInterest : 0;
  }, []);
  
  const calculateRentalIncome = useCallback((position: PortfolioPosition): number => {
    const baseRent = position.assetDefinition?.rentalInfo?.baseRent;
    if (baseRent === undefined) return 0;
    
    return isFinite(baseRent) ? baseRent : 0;
  }, []);

  // Main position income calculator
  const calculatePositionIncomeForMonth = useCallback((position: PortfolioPosition, month: number): number => {
    if (!position.assetDefinition) {
      return 0;
    }

    Logger.cache(`=== Calculating income for position ${position.name} (${position.type}) month ${month} ===`);
    
    // Calculate income based on asset type
    switch (position.type) {
      case 'stock':
        return calculateStockIncome(position, month);
      case 'bond':
      case 'cash':
        return calculateInterestIncome(position);
      case 'real_estate':
        return calculateRentalIncome(position);
      default:
        return 0;
    }
  }, [calculateStockIncome, calculateInterestIncome, calculateRentalIncome]);

  // Log positions details for debugging
  useEffect(() => {
    // Skip if no positions to log
    if (filteredPositions.length === 0) return;
    
    Logger.info(`Logging details for ${filteredPositions.length} portfolio positions`);
    
    filteredPositions.forEach(position => {
      Logger.info(`Position: ${position.name} (${position.type}) - Value: ${position.currentValue}`);
      
      // Check dividend info from AssetDefinition
      const dividendInfo = position.assetDefinition?.dividendInfo;
      if (position.type === 'stock' && dividendInfo) {
        Logger.info(`  Dividend Info: frequency=${dividendInfo.frequency}, amount=${dividendInfo.amount}`);
      }
      
      // Check interest rate from AssetDefinition
      const interestRate = position.assetDefinition?.bondInfo?.interestRate;
      if (position.type === 'bond' && interestRate) {
        Logger.info(`  Interest Rate: ${interestRate}%`);
      }
      
      // Check rental info from AssetDefinition
      const rentalInfo = position.assetDefinition?.rentalInfo;
      if (position.type === 'real_estate' && rentalInfo) {
        const amount = rentalInfo.baseRent;
        Logger.info(`  Rental Income: ${amount}`);
      }
    });
  }, [filteredPositions]);
  
  // Memoize months data calculation with portfolio positions
  const monthsData = useMemo(() => {
    Logger.info(`Calculating months data for ${filteredPositions.length} portfolio positions`);
    
    const data: MonthData[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthPositions: Array<{ position: PortfolioPosition; income: number }> = [];
      let totalIncome = 0;

      filteredPositions.forEach((position) => {
        const income = calculatePositionIncomeForMonth(position, month);
        Logger.cache(`Position ${position.name} income for month ${month}: ${income}`);
        
        if (income > 0) {
          monthPositions.push({ position, income });
          totalIncome += income;
        }
      });

      Logger.info(`Month ${month} (${monthNames[month - 1]}): ${monthPositions.length} positions with income, total: ${totalIncome}`);

      // Sort by income descending - using toSorted to avoid mutating the original array
      const sortedMonthPositions = monthPositions.toSorted((a, b) => b.income - a.income);

      data.push({
        month,
        name: monthNames[month - 1],
        totalIncome,
        positions: sortedMonthPositions
      });
    }

    Logger.info(`Months data calculated for ${data.length} months`);
    
    // Log summary of months with income
    const monthsWithIncome = data.filter(m => m.totalIncome > 0);
    Logger.info(`Months with income: ${monthsWithIncome.length} out of ${data.length}`);
    monthsWithIncome.forEach(m => {
      Logger.info(`  ${m.name}: ${m.totalIncome} from ${m.positions.length} positions`);
    });
    
    return data;
  }, [filteredPositions, monthNames, calculatePositionIncomeForMonth]);

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
    // Early exit if no valid click data
    if (!data?.activePayload?.[0]?.payload?.month) {
      return;
    }
    
    const clickedMonthName = data.activePayload[0].payload.month;
    const shortMonthsObj = t('dates.shortMonths', { returnObjects: true }) as Record<string, string>;
    const shortMonths = Object.values(shortMonthsObj);
    const monthIndex = shortMonths.findIndex(shortName => shortName === clickedMonthName);
    
    // Only update if we found a valid month
    if (monthIndex !== -1) {
      const newSelectedMonth = monthIndex + 1;
      Logger.info(`Month clicked: ${clickedMonthName} (month: ${newSelectedMonth})`);
      setSelectedMonth(newSelectedMonth);
    }
  }, [t]);

  // Handle asset type filter change with memoized callback
  const handleAssetTypeChange = useCallback((newType: AssetType | 'all') => {
    Logger.info(`Asset type filter changed to: ${newType}`);
    setSelectedAssetType(newType);
  }, []);

  // Log when component mounts or key data changes
  useEffect(() => {
    Logger.info(`AssetCalendarContainer: ${assets.length} total assets, ${filteredPositions.length} filtered positions`);
  }, [assets.length, filteredPositions.length]);

  return (
    <AssetCalendarView
      selectedMonthData={selectedMonthData}
      chartData={chartData}
      selectedAssetType={selectedAssetType}
      assetTypeOptions={assetTypeOptions}
      filteredAssets={filteredPositions} // Filtered positions
      positions={portfolioData.positions} // All positions
      onBarClick={handleBarClick}
      onAssetTypeChange={handleAssetTypeChange}
      onBack={onBack}
    />
  );
};

export default AssetCalendarContainer;
