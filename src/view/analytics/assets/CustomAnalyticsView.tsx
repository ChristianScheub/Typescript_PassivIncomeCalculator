import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import calculatorService from '../../../service/calculatorService';
import { 
  addChart, 
  updateChart, 
  removeChart, 
  openConfigPanel, 
  closeConfigPanel 
} from '../../../store/slices/customAnalyticsSlice';
import { ChartType, CustomAnalyticsConfig, DataSource, GroupBy } from '../../../store/slices/customAnalyticsSlice';
import GenericPieChart from '../../../ui/charts/pieCharts/GenericPieChart';
import { Plus, Trash2, Edit3, X } from 'lucide-react';

interface TempChartConfig {
  id?: string;
  title: string;
  chartType: ChartType;
  dataSource: DataSource;
  groupBy: GroupBy;
  selectedCategoryId?: string;
  selectedCategoryOptionId?: string;
}

interface ConfigPanelProps {
  isOpen: boolean;
  editingChart: CustomAnalyticsConfig | null;
  onClose: () => void;
  onSave: (config: TempChartConfig) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  isOpen, 
  editingChart, 
  onClose, 
  onSave 
}) => {
  const { t } = useTranslation();
  const [tempConfig, setTempConfig] = useState<TempChartConfig>({
    title: editingChart?.title || '',
    chartType: editingChart?.chartType || 'pie',
    dataSource: editingChart?.dataSource || 'assetValue',
    groupBy: editingChart?.groupBy || 'assetType',
    selectedCategoryId: editingChart?.selectedCategoryId,
    selectedCategoryOptionId: editingChart?.selectedCategoryOptionId,
    ...(editingChart && { id: editingChart.id })
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (tempConfig.title.trim()) {
      onSave(tempConfig);
      onClose();
    }
  };

  const handleClose = () => {
    setTempConfig({
      title: '',
      chartType: 'pie',
      dataSource: 'assetValue',
      groupBy: 'assetType'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingChart ? t('analytics.customAnalytics.editChart') : t('analytics.customAnalytics.addChart')}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Chart Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('analytics.customAnalytics.chartTitle')}
            </label>
            <input
              type="text"
              value={tempConfig.title}
              onChange={(e) => setTempConfig({ ...tempConfig, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('analytics.customAnalytics.enterTitle')}
            />
          </div>

          {/* Chart Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('analytics.customAnalytics.chartType')}
            </label>
            <select
              value={tempConfig.chartType}
              onChange={(e) => setTempConfig({ ...tempConfig, chartType: e.target.value as ChartType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="pie">{t('analytics.customAnalytics.pieChart')}</option>
              <option value="bar">{t('analytics.customAnalytics.barChart')}</option>
              <option value="line">{t('analytics.customAnalytics.lineChart')}</option>
            </select>
          </div>

          {/* Data Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('analytics.customAnalytics.dataSource')}
            </label>
            <select
              value={tempConfig.dataSource}
              onChange={(e) => setTempConfig({ ...tempConfig, dataSource: e.target.value as DataSource })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="assetValue">{t('analytics.customAnalytics.assetValue')}</option>
              <option value="income">{t('analytics.customAnalytics.income')}</option>
              <option value="growth">{t('analytics.customAnalytics.growth')}</option>
            </select>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('analytics.customAnalytics.groupBy')}
            </label>
            <select
              value={tempConfig.groupBy}
              onChange={(e) => setTempConfig({ ...tempConfig, groupBy: e.target.value as GroupBy })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="assetType">{t('customAnalytics.groupingOptions.assetType')}</option>
              <option value="sector">{t('customAnalytics.groupingOptions.sector')}</option>
              <option value="country">{t('customAnalytics.groupingOptions.country')}</option>
              <option value="category">{t('customAnalytics.groupingOptions.categoryOptions')}</option>
              <option value="assetDefinition">{t('customAnalytics.groupingOptions.assetDefinition')}</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!tempConfig.title.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CustomAnalyticsViewProps {
  filteredPositions?: any[]; // Optional: wenn bereitgestellt, werden diese anstelle der Portfolio-Cache-Positions verwendet
}

const CustomAnalyticsView: React.FC<CustomAnalyticsViewProps> = ({ filteredPositions }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { charts, isConfigPanelOpen, editingChartId } = useSelector((state: RootState) => state.customAnalytics);
  
  // Get data needed for charts
  const assetAllocation = useSelector((state: RootState) => state.dashboard.assetAllocation);
  const portfolioCache = useSelector((state: RootState) => state.assets.portfolioCache);

  // Calculate portfolio analytics data from portfolio positions
  const portfolioAnalytics = useMemo(() => {
    // Use filteredPositions if provided, otherwise fall back to portfolioCache positions
    const positions = filteredPositions && filteredPositions.length > 0 
      ? filteredPositions 
      : portfolioCache?.positions || [];
      
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
  }, [filteredPositions, portfolioCache?.positions]);

  // Calculate income analytics data from portfolio positions (like IncomeDistributionView)
  const incomeAnalytics = useMemo(() => {
    // Use filteredPositions if provided, otherwise fall back to portfolioCache positions
    const positions = filteredPositions && filteredPositions.length > 0 
      ? filteredPositions 
      : portfolioCache?.positions || [];
      
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
  }, [filteredPositions, portfolioCache?.positions]);

  const editingChart = editingChartId ? charts.find(chart => chart.id === editingChartId) || null : null;

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
      // Update existing chart
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
      // Add new chart
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

  const getChartData = (chart: CustomAnalyticsConfig) => {
    switch (chart.dataSource) {
      case 'assetValue':
        // Get asset allocation data based on groupBy option
        switch (chart.groupBy) {
          case 'assetType':
            return portfolioAnalytics.assetAllocation.map(item => ({
              name: t(`assets.types.${item.name}`),
              value: item.value,
              percentage: item.percentage
            }));
          case 'sector':
            return portfolioAnalytics.sectorAllocation.map(item => ({
              name: item.name,
              value: item.value,
              percentage: item.percentage
            }));
          case 'country':
            return portfolioAnalytics.countryAllocation.map(item => ({
              name: item.name,
              value: item.value,
              percentage: item.percentage
            }));
          case 'category':
            return portfolioAnalytics.categoryAllocation.map(item => ({
              name: item.name,
              value: item.value,
              percentage: item.percentage
            }));
          case 'assetDefinition':
            // Group by individual asset definitions (portfolio positions)
            const positions = filteredPositions && filteredPositions.length > 0 
              ? filteredPositions 
              : portfolioCache?.positions || [];
              
            if (positions.length > 0) {
              const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
              return positions.map(position => ({
                name: position.name,
                value: position.currentValue,
                percentage: totalValue > 0 ? (position.currentValue / totalValue) * 100 : 0
              }));
            }
            return [];
          default:
            // Fallback to dashboard asset allocation if portfolio analytics not available
            return assetAllocation.map(item => ({
              name: t(`assets.types.${item.name}`),
              value: item.value,
              percentage: item.percentage
            }));
        }
      
      case 'income':
        // Get asset income allocation data based on groupBy option
        switch (chart.groupBy) {
          case 'assetType':
            return incomeAnalytics.assetTypeIncome.map(item => ({
              name: t(`assets.types.${item.name}`),
              value: item.value,
              percentage: item.percentage
            }));
          case 'sector':
            return incomeAnalytics.sectorIncome.map(item => ({
              name: item.name,
              value: item.value,
              percentage: item.percentage
            }));
          case 'country':
            return incomeAnalytics.countryIncome.map(item => ({
              name: item.name,
              value: item.value,
              percentage: item.percentage
            }));
          case 'category':
            return incomeAnalytics.categoryIncome.map(item => ({
              name: item.name,
              value: item.value,
              percentage: item.percentage
            }));
          case 'assetDefinition':
            // Group by individual asset definitions - show income per position
            const positions = filteredPositions && filteredPositions.length > 0 
              ? filteredPositions 
              : portfolioCache?.positions || [];
              
            if (positions.length > 0) {
              const totalIncome = positions.reduce((sum, pos) => sum + pos.monthlyIncome, 0);
              return positions
                .filter(position => position.monthlyIncome > 0) // Only show positions with income
                .map(position => ({
                  name: position.name,
                  value: position.monthlyIncome,
                  percentage: totalIncome > 0 ? (position.monthlyIncome / totalIncome) * 100 : 0
                }));
            }
            return [];
          default:
            return incomeAnalytics.assetTypeIncome.map(item => ({
              name: t(`assets.types.${item.name}`),
              value: item.value,
              percentage: item.percentage
            }));
        }
      
      case 'growth':
        // Get asset performance data from portfolio
        const positions = filteredPositions && filteredPositions.length > 0 
          ? filteredPositions 
          : portfolioCache?.positions || [];
          
        if (positions.length > 0) {
          return positions.map(position => ({
            name: position.name,
            value: position.totalReturn,
            percentage: position.totalReturnPercentage
          })).filter(item => item.value !== 0);
        }
        return [];
      
      default:
        return [];
    }
  };

  const renderChart = (chart: CustomAnalyticsConfig) => {
    const data = getChartData(chart);
    
    switch (chart.chartType) {
      case 'pie':
        return (
          <GenericPieChart
            data={data}
            title={chart.title}
            showTitle={true}
            nameKey="name"
            valueKey="value"
          />
        );
      case 'bar':
      case 'line':
        return (
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">
              {t('analytics.customAnalytics.chartTypeNotImplemented', { type: chart.chartType })}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('analytics.customAnalytics.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('analytics.customAnalytics.description')}
            </p>
          </div>
          <button
            onClick={handleAddChart}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>{t('analytics.customAnalytics.addChart')}</span>
          </button>
        </div>

        {/* Charts Grid */}
        {charts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('analytics.customAnalytics.noChartsYet')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('analytics.customAnalytics.getStarted')}
            </p>
            <button
              onClick={handleAddChart}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>{t('analytics.customAnalytics.addFirstChart')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {charts.map((chart) => (
              <div
                key={chart.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative group"
              >
                {/* Chart Actions */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditChart(chart)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteChart(chart.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Chart Content */}
                <div className="pt-2">
                  {renderChart(chart)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Configuration Panel */}
        <ConfigPanel
          isOpen={isConfigPanelOpen}
          editingChart={editingChart}
          onClose={handleConfigClose}
          onSave={handleConfigSave}
        />
      </div>
    </div>
  );
};

export default CustomAnalyticsView;