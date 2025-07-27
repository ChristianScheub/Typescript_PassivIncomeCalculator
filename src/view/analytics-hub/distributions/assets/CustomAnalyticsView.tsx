import React from 'react';
import { IconButton, FloatingBtn, ButtonAlignment } from '@ui/shared';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { GenericPieChart } from '@/ui/portfolioHub';
import { CustomAnalyticsConfig } from '@/types/domains/analytics/charts';
import { ConfigPanel, TempChartConfig } from '../../../../ui/analyticsHub/assets/CustomAnalyticsConfigPanel';
import { TFunction } from 'i18next';

// ChartDataItem und alle Typen werden im Container definiert und als Props übergeben

import { PieChartData } from '@/types/shared/charts';
interface ChartDataItem extends PieChartData {
  percentage: number;
}

interface CustomAnalyticsViewProps {
  charts: CustomAnalyticsConfig[];
  isConfigPanelOpen: boolean;
  editingChart: CustomAnalyticsConfig | null;
  onAddChart: () => void;
  onEditChart: (chart: CustomAnalyticsConfig) => void;
  onDeleteChart: (chartId: string) => void;
  onConfigSave: (config: TempChartConfig) => void;
  onConfigClose: () => void;
  getChartData: (chart: CustomAnalyticsConfig) => ChartDataItem[];
  t: TFunction;
}


const CustomAnalyticsView: React.FC<CustomAnalyticsViewProps> = ({
  charts,
  isConfigPanelOpen,
  editingChart,
  onAddChart,
  onEditChart,
  onDeleteChart,
  onConfigSave,
  onConfigClose,
  getChartData,
  t
}) => {
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
                    <IconButton
                      onClick={() => onEditChart(chart)}
                      icon={<Edit3 className="h-4 w-4" />}
                      variant="ghost"
                      size="iconSm"
                      aria-label={t('common.edit')}
                    />
                    <IconButton
                      onClick={() => onDeleteChart(chart.id)}
                      icon={<Trash2 className="h-4 w-4" />}
                      variant="ghostDestructive"
                      size="iconSm"
                      aria-label={t('common.delete')}
                    />
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
          onClose={onConfigClose}
          onSave={onConfigSave}
        />

        {/* Floating Add Chart Button (always visible) */}
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Plus}
          onClick={onAddChart}
        />
      </div>
    </div>
  );
};

export default CustomAnalyticsView;