import { CustomAnalyticsConfig } from "@/types/domains/analytics/charts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonGroup, IconButton } from '@ui/shared';
import { ChartType, DataSource, GroupBy } from '@/types/shared/analytics';
import { X } from 'lucide-react';

/**
 * Props for the chart configuration panel
 */
interface ConfigPanelProps {
  isOpen: boolean;
  editingChart: CustomAnalyticsConfig | null;
  onClose: () => void;
  onSave: (config: TempChartConfig) => void;
}

/**
 * Temporary chart configuration used during creation/editing
 */
export interface TempChartConfig {
  id?: string;
  title: string;
  chartType: ChartType;
  dataSource: DataSource;
  groupBy: GroupBy;
  selectedCategoryId?: string;
  selectedCategoryOptionId?: string;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
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
          <IconButton
            onClick={handleClose}
            icon={<X className="h-6 w-6" />}
            variant="ghost"
            size="icon"
            aria-label="Close"
          />
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

        <ButtonGroup className="mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!tempConfig.title.trim()}
            className="flex-1"
          >
            {t('common.save')}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};