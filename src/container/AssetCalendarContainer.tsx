import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { calculateAssetIncomeForMonth } from '../service/calculatorService/methods/calculateAssetIncome';
import { Asset, AssetType } from '../types';
import AssetCalendarView from '../view/AssetCalendarView';

interface MonthData {
  month: number;
  name: string;
  totalIncome: number;
  assets: Array<{
    asset: Asset;
    income: number;
  }>;
}

const AssetCalendarContainer: React.FC = () => {
  const assets = useSelector((state: RootState) => state.assets.items);
  const { t } = useTranslation();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month (1-12)
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'all'>('all');

  // Get localized month names from translations
  const monthNames = [
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
  ];

  // Asset type options for filter with translations
  const assetTypeOptions = [
    { value: 'all' as const, label: t('assets.types.all') },
    { value: 'stock' as const, label: t('assets.types.stock') + 'en' }, // Pluralform
    { value: 'bond' as const, label: t('assets.types.bond') + 'n' }, // Pluralform
    { value: 'real_estate' as const, label: t('assets.types.real_estate') + 'n' }, // Pluralform
    { value: 'crypto' as const, label: t('assets.types.crypto') + 'n' }, // Pluralform für Kryptowährungen
    { value: 'cash' as const, label: t('assets.types.cash') },
    { value: 'other' as const, label: t('assets.types.other') },
  ];

  // Filter assets based on selected type
  const filteredAssets = selectedAssetType === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === selectedAssetType);

  useEffect(() => {
    // Calculate data for all months using filtered assets
    const data: MonthData[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthAssets: Array<{ asset: Asset; income: number }> = [];
      let totalIncome = 0;

      filteredAssets.forEach((asset: Asset) => {
        const income = calculateAssetIncomeForMonth(asset, month);
        if (income > 0) {
          monthAssets.push({ asset, income });
          totalIncome += income;
        }
      });

      // Sort by income descending using toSorted for immutability and clarity
      const sortedMonthAssets = monthAssets.toSorted((a: { asset: Asset; income: number }, b: { asset: Asset; income: number }) => b.income - a.income);

      data.push({
        month,
        name: monthNames[month - 1],
        totalIncome,
        assets: sortedMonthAssets
      });
    }

    setMonthsData(data);
  }, [filteredAssets, monthNames, t]);

  const selectedMonthData = monthsData.find(m => m.month === selectedMonth);

  // Prepare chart data with translated short month names
  const chartData = monthsData.map(monthData => {
    const monthKey = Object.keys(t('dates.months', { returnObjects: true }))[monthData.month - 1];
    return {
      month: t(`dates.shortMonths.${monthKey}`), // Translated short month name
      income: monthData.totalIncome,
      isSelected: monthData.month === selectedMonth
    };
  });

  // Handle bar click for month selection with translated month names
  const handleBarClick = (data: any) => {
    const clickedMonthName = data?.activePayload?.[0]?.payload?.month;
    if (clickedMonthName) {
      // Get all short month names from translations
      const shortMonthsObj = t('dates.shortMonths', { returnObjects: true }) as Record<string, string>;
      const shortMonths = Object.values(shortMonthsObj);
      // Find the clicked month index
      const monthIndex = shortMonths.findIndex(shortName => shortName === clickedMonthName);
      if (monthIndex !== -1) {
        setSelectedMonth(monthIndex + 1);
      }
    }
  };

  // Handle asset type filter change
  const handleAssetTypeChange = (newType: AssetType | 'all') => {
    setSelectedAssetType(newType);
  };

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
    />
  );
};

export default AssetCalendarContainer;
