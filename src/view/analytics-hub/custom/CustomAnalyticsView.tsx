import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../ui/common/Card';
import { Button } from '../../../ui/common/Button';
import { ArrowLeft, Plus, Trash2, BarChart3 } from 'lucide-react';

type ChartType = 'line' | 'pie' | 'bar';

interface DataSource {
  id: string;
  name: string;
  fields: string[];
}

interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  dataSource: string;
  groupBy: string;
  created: Date;
}

interface Template {
  id: string;
  title: string;
  description: string;
  type: ChartType;
  dataSource: string;
  groupBy: string;
}

interface CustomAnalyticsViewProps {
  selectedTab: 'builder' | 'saved' | 'templates';
  dataSources: DataSource[];
  savedCharts: ChartConfig[];
  templates: Template[];
  onTabChange: (tab: 'builder' | 'saved' | 'templates') => void;
  onSaveChart: (config: Omit<ChartConfig, 'id' | 'created'>) => void;
  onDeleteChart: (chartId: string) => void;
  onLoadTemplate: (template: Template) => void;
  onBack?: () => void;
}

const CustomAnalyticsView: React.FC<CustomAnalyticsViewProps> = ({
  selectedTab,
  dataSources,
  savedCharts,
  templates,
  onTabChange,
  onSaveChart,
  onDeleteChart,
  onLoadTemplate,
  onBack
}) => {
  const { t } = useTranslation();

  // Chart builder state
  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('');

  const tabs = [
    { id: 'builder' as const, label: t('analytics.custom.builder') || 'Chart Builder' },
    { id: 'saved' as const, label: t('analytics.custom.saved') || 'Saved Charts' },
    { id: 'templates' as const, label: t('analytics.custom.templates') || 'Templates' }
  ];

  const chartTypes = [
    { value: 'pie', label: t('analytics.custom.pieChart') || 'Pie Chart' },
    { value: 'bar', label: t('analytics.custom.barChart') || 'Bar Chart' },
    { value: 'line', label: t('analytics.custom.lineChart') || 'Line Chart' }
  ];

  const selectedSource = dataSources.find(source => source.id === selectedDataSource);

  const handleSave = () => {
    if (!chartTitle || !selectedDataSource || !selectedGroupBy) {
      return;
    }

    onSaveChart({
      title: chartTitle,
      type: chartType,
      dataSource: selectedDataSource,
      groupBy: selectedGroupBy
    });

    // Reset form
    setChartTitle('');
    setSelectedDataSource('');
    setSelectedGroupBy('');
    onTabChange('saved');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('analytics.custom.title') || 'Custom Analytics'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('analytics.custom.description') || 'Create custom charts and analysis'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {selectedTab === 'builder' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {t('analytics.custom.buildChart') || 'Build New Chart'}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('analytics.custom.chartTitle') || 'Chart Title'}
                </label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder={t('analytics.custom.enterTitle') || 'Enter chart title'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('analytics.custom.chartType') || 'Chart Type'}
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as ChartType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {chartTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('analytics.custom.dataSource') || 'Data Source'}
                </label>
                <select
                  value={selectedDataSource}
                  onChange={(e) => setSelectedDataSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('analytics.custom.selectDataSource') || 'Select data source'}</option>
                  {dataSources.map(source => (
                    <option key={source.id} value={source.id}>{source.name}</option>
                  ))}
                </select>
              </div>

              {selectedSource && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('analytics.custom.groupBy') || 'Group By'}
                  </label>
                  <select
                    value={selectedGroupBy}
                    onChange={(e) => setSelectedGroupBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t('analytics.custom.selectGroupBy') || 'Select grouping field'}</option>
                    {selectedSource.fields.map(field => (
                      <option key={field} value={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={!chartTitle || !selectedDataSource || !selectedGroupBy}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('analytics.custom.createChart') || 'Create Chart'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {selectedTab === 'saved' && (
          <div className="space-y-4">
            {savedCharts.length > 0 ? (
              savedCharts.map((chart) => (
                <Card key={chart.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {chart.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} chart • {chart.dataSource} • {chart.groupBy}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteChart(chart.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t('analytics.custom.noChartsYet') || 'No charts saved yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('analytics.custom.getStarted') || 'Create your first custom chart to analyze your data'}
                  </p>
                  <Button onClick={() => onTabChange('builder')}>
                    {t('analytics.custom.addFirstChart') || 'Create First Chart'}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {selectedTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {template.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                  <Button
                    onClick={() => onLoadTemplate(template)}
                    size="sm"
                    className="w-full"
                  >
                    {t('analytics.custom.useTemplate') || 'Use Template'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomAnalyticsView;
