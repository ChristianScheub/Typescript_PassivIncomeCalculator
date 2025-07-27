import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/hooks/redux';
import { compositeCalculatorService as calculatorService } from '@/service';
import {
  addChart,
  updateChart,
  removeChart,
  openConfigPanel,
  closeConfigPanel
} from '@/store/slices/ui';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import {
  AllocationData,
  PortfolioAnalyticsData as ServicePortfolioAnalyticsData,
  IncomeAnalyticsData as ServiceIncomeAnalyticsData
} from '@/types/domains/analytics/calculations';
import { PieChartData } from '@/types/shared/charts';
import { CustomAnalyticsConfig } from '@/types/domains/analytics/charts';
import { TempChartConfig } from '@/view/analytics-hub/distributions/assets/CustomAnalyticsConfigPanel';
import CustomAnalyticsView from '@/view/analytics-hub/distributions/assets/CustomAnalyticsView';

interface ChartDataItem extends PieChartData {
  percentage: number;
}

interface CustomAnalyticsContainerProps {
  filteredPositions?: PortfolioPosition[];
}

const CustomAnalyticsContainer: React.FC<CustomAnalyticsContainerProps> = ({ filteredPositions }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { charts, isConfigPanelOpen, editingChartId } = useAppSelector((state: { customAnalytics: { charts: CustomAnalyticsConfig[]; isConfigPanelOpen: boolean; editingChartId: string | null; }; }) => state.customAnalytics);
  const cache = useAppSelector(state => state.transactions.cache);

  const portfolioAnalytics = useMemo((): ServicePortfolioAnalyticsData => {
    const positions = filteredPositions && filteredPositions.length > 0 
      ? filteredPositions 
      : cache?.positions || [];
    if (!positions.length) {
      return {
        assetAllocation: [],
        sectorAllocation: [],
        countryAllocation: [],
        categoryAllocation: [],
        categoryBreakdown: []
      };
    }
    return calculatorService.calculatePortfolioAnalytics(positions);
  }, [filteredPositions, cache?.positions]);

  const incomeAnalytics = useMemo((): ServiceIncomeAnalyticsData => {
    const positions = filteredPositions && filteredPositions.length > 0 
      ? filteredPositions 
      : cache?.positions || [];
    if (!positions.length) {
      return {
        assetTypeIncome: [],
        sectorIncome: [],
        countryIncome: [],
        categoryIncome: [],
        categoryIncomeBreakdown: []
      };
    }
    return calculatorService.calculateIncomeAnalytics(positions);
  }, [filteredPositions, cache?.positions]);

  const editingChart = editingChartId ? charts.find((chart) => chart.id === editingChartId) || null : null;

  const handleAddChart = () => {
    dispatch(openConfigPanel(null));
  };

  const handleEditChart = (chart: CustomAnalyticsConfig) => {
    dispatch(openConfigPanel(chart.id));
  };

  const handleDeleteChart = (chartId: string) => {
    dispatch(removeChart(chartId));
  };

  const handleConfigSave = (config: TempChartConfig) => {
    if (config.id) {
      dispatch(updateChart({
        id: config.id,
        updates: {
          title: config.title,
          chartType: config.chartType,
          dataSource: config.dataSource,
          groupBy: config.groupBy,
          selectedCategoryId: config.selectedCategoryId,
          selectedCategoryOptionId: config.selectedCategoryOptionId
        }
      }));
    } else {
      dispatch(addChart({
        title: config.title,
        chartType: config.chartType,
        dataSource: config.dataSource,
        groupBy: config.groupBy,
        selectedCategoryId: config.selectedCategoryId,
        selectedCategoryOptionId: config.selectedCategoryOptionId
      }));
    }
  };

  const handleConfigClose = () => {
    dispatch(closeConfigPanel());
  };

  const getPositionsData = (): PortfolioPosition[] => {
    return filteredPositions && filteredPositions.length > 0 
      ? filteredPositions 
      : cache?.positions || [];
  };

  const mapAssetTypeData = (items: AllocationData[]): ChartDataItem[] => {
    return items.map(item => ({
      name: t(`assets.types.${item.name}`),
      value: item.value,
      percentage: item.percentage || ((item.value / items.reduce((sum, i) => sum + i.value, 0)) * 100)
    }));
  };

  const mapGenericData = (items: AllocationData[]): ChartDataItem[] => {
    return items.map(item => ({
      name: item.name,
      value: item.value,
      percentage: item.percentage || ((item.value / items.reduce((sum, i) => sum + i.value, 0)) * 100)
    }));
  };

  const getAssetDefinitionValueData = (): ChartDataItem[] => {
    const positions = getPositionsData();
    if (positions.length === 0) return [];
    const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    return positions.map(position => ({
      name: position.name,
      value: position.currentValue,
      percentage: totalValue > 0 ? (position.currentValue / totalValue) * 100 : 0
    }));
  };

  const getAssetDefinitionIncomeData = (): ChartDataItem[] => {
    const positions = getPositionsData();
    if (positions.length === 0) return [];
    const totalIncome = positions.reduce((sum, pos) => sum + pos.monthlyIncome, 0);
    return positions
      .filter(position => position.monthlyIncome > 0)
      .map(position => ({
        name: position.name,
        value: position.monthlyIncome,
        percentage: totalIncome > 0 ? (position.monthlyIncome / totalIncome) * 100 : 0
      }));
  };

  const getChartData = (chart: CustomAnalyticsConfig): ChartDataItem[] => {
    switch (chart.dataSource) {
      case 'assetValue': {
        switch (chart.groupBy) {
          case 'assetType':
            return mapAssetTypeData(portfolioAnalytics.assetAllocation);
          case 'sector':
            return mapGenericData(portfolioAnalytics.sectorAllocation);
          case 'country':
            return mapGenericData(portfolioAnalytics.countryAllocation);
          case 'category':
            return mapGenericData(portfolioAnalytics.categoryAllocation);
          case 'assetDefinition':
            return getAssetDefinitionValueData();
          default:
            return portfolioAnalytics.assetAllocation.map((item: AllocationData) => ({
              name: t(`assets.types.${item.name}`),
              value: item.value,
              percentage: item.percentage
            }));
        }
      }
      case 'income': {
        switch (chart.groupBy) {
          case 'assetType':
            return mapAssetTypeData(incomeAnalytics.assetTypeIncome);
          case 'sector':
            return mapGenericData(incomeAnalytics.sectorIncome);
          case 'country':
            return mapGenericData(incomeAnalytics.countryIncome);
          case 'category':
            return mapGenericData(incomeAnalytics.categoryIncome);
          case 'assetDefinition':
            return getAssetDefinitionIncomeData();
          default:
            return mapAssetTypeData(incomeAnalytics.assetTypeIncome);
        }
      }
      case 'growth': {
        const positions = getPositionsData();
        if (positions.length > 0) {
          return positions.map(position => ({
            name: position.name,
            value: position.totalReturn,
            percentage: position.totalReturnPercentage
          })).filter((item: ChartDataItem) => item.value !== 0);
        }
        return [];
      }
      default:
        return [];
    }
  };

  return (
    <CustomAnalyticsView
      charts={charts}
      isConfigPanelOpen={isConfigPanelOpen}
      editingChart={editingChart}
      onAddChart={handleAddChart}
      onEditChart={handleEditChart}
      onDeleteChart={handleDeleteChart}
      onConfigSave={handleConfigSave}
      onConfigClose={handleConfigClose}
      getChartData={getChartData}
      t={t}
    />
  );
};

export default CustomAnalyticsContainer;
