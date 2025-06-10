import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { AssetType } from '../types';
import AssetCalendarView from '../view/assets/AssetCalendarView';
import Logger from '../service/Logger/logger';
import { PortfolioService } from '../service/portfolioService';
import { PortfolioPosition } from '../service/portfolioService/portfolioCalculations';
import { calculateDividendForMonth } from '../service/calculatorService/methods/calculatePayment';

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
  const assets = useSelector((state: RootState) => state.assets.items);
  const assetDefinitions = useSelector((state: RootState) => state.assetDefinitions.items);
  const assetCategories = useSelector((state: RootState) => state.assetCategories.categories);
  const categoryOptions = useSelector((state: RootState) => state.assetCategories.categoryOptions);
  const categoryAssignments = useSelector((state: RootState) => state.assetCategories.categoryAssignments);
  const { t } = useTranslation();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'all'>('all');

  // Get portfolio service instance
  const portfolioService = PortfolioService.getInstance();

  // Calculate portfolio positions (grouped by AssetDefinition)
  const portfolioData = useMemo(() => {
    Logger.info(`Calculating portfolio for asset calendar with ${assets.length} assets and ${assetDefinitions.length} definitions`);
    return portfolioService.calculatePortfolio(
      assets, 
      assetDefinitions, 
      assetCategories, 
      categoryOptions, 
      categoryAssignments
    );
  }, [assets, assetDefinitions, assetCategories, categoryOptions, categoryAssignments, portfolioService]);

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

  // Helper function to calculate position income for a specific month
  const calculatePositionIncomeForMonth = useCallback((position: PortfolioPosition, month: number): number => {
    if (!position.assetDefinition) {
      Logger.cache(`Position ${position.name} has no asset definition, skipping`);
      return 0;
    }

    const assetDefinition = position.assetDefinition;
    const totalQuantity = position.totalQuantity;

    Logger.cache(`=== Calculating income for position ${position.name} (${position.type}) month ${month} ===`);
    Logger.cache(`Position details - Type: ${position.type}, Quantity: ${totalQuantity}`);

    // Stock dividends
    if (position.type === 'stock' && assetDefinition.dividendInfo?.frequency && assetDefinition.dividendInfo.frequency !== 'none') {
      if (totalQuantity <= 0) {
        Logger.cache(`Stock position ${position.name} has no valid quantity (${totalQuantity}), skipping dividend calculation`);
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
    }

    // Bond/Cash interest
    if ((position.type === 'bond' || position.type === 'cash') && assetDefinition.bondInfo?.interestRate !== undefined) {
      const interestRate = assetDefinition.bondInfo.interestRate;
      const currentValue = position.currentValue;
      const annualInterest = (interestRate * currentValue) / 100;
      const monthlyInterest = annualInterest / 12;
      Logger.cache(`Interest for ${position.name} month ${month}: ${monthlyInterest}`);
      return isFinite(monthlyInterest) ? monthlyInterest : 0;
    }

    // Real estate rental
    if (position.type === 'real_estate' && assetDefinition.rentalInfo?.baseRent !== undefined) {
      const monthlyRent = assetDefinition.rentalInfo.baseRent;
      Logger.cache(`Rental for ${position.name} month ${month}: ${monthlyRent}`);
      return isFinite(monthlyRent) ? monthlyRent : 0;
    }

    Logger.cache(`No income calculation available for position ${position.name} type ${position.type}`);
    return 0;
  }, []);

  // Memoize months data calculation with portfolio positions
  const monthsData = useMemo(() => {
    Logger.info(`Calculating months data for ${filteredPositions.length} portfolio positions`);
    
    // Log position details for debugging
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
