import React from 'react';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import formatService from "@service/infrastructure/formatService";
import { RechartsClickData } from '@/types/shared/charts';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { ViewHeader, AssetTypeFilterCard, CollapsibleSection } from '@ui/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { AssetType } from '@/types/shared';

interface MonthData {
  month: number;
  name: string;
  totalIncome: number;
  positions: Array<{
    position: PortfolioPosition;
    income: number;
    isForecast?: boolean;
    forecastShare?: number;
  }>;
  forecastShare?: number;
}

interface ChartData {
  month: string;
  income: number;
  isSelected: boolean;
  monthNumber?: number;
  forecastShare?: number;
}

interface AssetTypeOption {
  value: AssetType | 'all';
  label: string;
}

interface AssetCalendarViewProps {
  selectedMonthData: MonthData | undefined;
  chartData: ChartData[];
  selectedAssetType: AssetType | 'all';
  assetTypeOptions: AssetTypeOption[];
  filteredAssets: PortfolioPosition[]; // Filtered positions
  positions: PortfolioPosition[]; // All positions
  onBarClick: (data: RechartsClickData) => void;
  onAssetTypeChange: (type: AssetType | 'all') => void;
  onBack?: () => void;
  selectedYear: number;
  yearOptions: number[];
  onYearChange: (year: number) => void;
}

const AssetCalendarView: React.FC<AssetCalendarViewProps> = ({
  selectedMonthData,
  chartData,
  selectedAssetType,
  assetTypeOptions,
  filteredAssets,
  positions,
  onBarClick,
  onAssetTypeChange,
  onBack,
  selectedYear,
  yearOptions,
  onYearChange
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getBarColorByMonth = (forecastShare?: number, isSelected?: boolean) => {
    if (forecastShare && forecastShare > 0.01) {
      // Zeige Forecast-Anteil als Verlauf (blau für real, orange für forecast)
      return isSelected
        ? 'url(#forecastBarGradientSelected)'
        : 'url(#forecastBarGradient)';
    }
    return isSelected ? '#3B82F6' : '#E5E7EB';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Header */}
        <ViewHeader
          title={t('assets.calendar')}
          onBack={onBack || (() => navigate(-1))}
          rightContent={
            <select
              className="ml-4 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={selectedYear}
              onChange={e => onYearChange(Number(e.target.value))}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          }
        />
        
        {/* Asset Type Filter Card */}
        <AssetTypeFilterCard
          selectedAssetType={selectedAssetType}
          assetTypeOptions={assetTypeOptions}
          onAssetTypeChange={onAssetTypeChange}
          filteredCount={filteredAssets.length}
          totalCount={positions.length}
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-x-hidden">
          {/* Month Chart - Top/Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">{t('assets.yearOverview')}</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('assets.clickBarToSelectMonth')}
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    onClick={onBarClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <defs>
                      <linearGradient id="forecastBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E42" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
                      </linearGradient>
                      <linearGradient id="forecastBarGradientSelected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E42" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      stroke="#6B7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6B7280"
                      tickFormatter={(value) => formatService.formatCurrency(value)}
                    />
                    <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.month}`}
                          fill={getBarColorByMonth(entry.forecastShare, entry.isSelected)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Selected Month Details - Right Columns */}
          <div className="lg:col-span-2">
            {selectedMonthData && (
              <div className="space-y-6">
                {/* Month Overview with CollapsibleSection */}
                <CollapsibleSection
                  title={t('assets.monthDetails')}
                  icon={<Calendar className="w-5 h-5 text-blue-600" />}
                  defaultExpanded={true}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-semibold">{selectedMonthData.name} {selectedYear}</h2>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          {formatService.formatCurrency(selectedMonthData.totalIncome)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('assets.numberOfAssets')}</p>
                        <p className="text-2xl font-bold text-green-600">{selectedMonthData.positions.length}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('assets.averagePerAsset')}</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {selectedMonthData.positions.length > 0 
                            ? formatService.formatCurrency(selectedMonthData.totalIncome / selectedMonthData.positions.length)
                            : formatService.formatCurrency(0)
                          }
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('assets.highestPayment')}</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedMonthData.positions.length > 0 
                            ? formatService.formatCurrency(selectedMonthData.positions[0].income)
                            : formatService.formatCurrency(0)
                          }
                        </p>
                      </div>
                    </div>

                    {/* Assets List */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          {t('assets.assetsWithPayments')} {selectedMonthData.name}
                        </h3>
                        {selectedAssetType !== 'all' && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t('assets.filteredBy')} {assetTypeOptions.find(opt => opt.value === selectedAssetType)?.label}
                          </span>
                        )}
                      </div>
                      
                      {selectedMonthData.positions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>
                            {selectedAssetType === 'all' 
                              ? t('assets.noAssetsWithPayments')
                              : t('assets.noFilteredAssetsWithPayments', { assetType: assetTypeOptions.find(opt => opt.value === selectedAssetType)?.label })
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {selectedMonthData.positions.map((item, index) => (
                            <div
                              key={item.position.id}
                              className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${item.isForecast ? 'border-l-4 border-orange-400' : ''}`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium">{item.position.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.position.type} • {formatService.formatCurrency(item.position.currentValue)}
                                    {item.isForecast && (
                                      <span className="ml-2 text-orange-500 font-semibold">(Forecast)</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600 dark:text-green-400">
                                  {formatService.formatCurrency(item.income)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {((item.income / selectedMonthData.totalIncome) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCalendarView;
