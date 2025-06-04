import React, { useState } from 'react';
import { ArrowLeft, Calendar, TrendingUp, BarChart3, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import formatService from '../service/formatService';
import { Asset, AssetType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

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
  monthNumber?: number;
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
  filteredAssets: Asset[];
  assets: Asset[];
  onBarClick: (data: any) => void;
  onAssetTypeChange: (type: AssetType | 'all') => void;
}

const AssetCalendarView: React.FC<AssetCalendarViewProps> = ({
  selectedMonthData,
  chartData,
  selectedAssetType,
  assetTypeOptions,
  filteredAssets,
  assets,
  onBarClick,
  onAssetTypeChange
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isMonthDetailsExpanded, setIsMonthDetailsExpanded] = useState(true);

  const toggleFilter = () => setIsFilterExpanded(!isFilterExpanded);
  const toggleMonthDetails = () => setIsMonthDetailsExpanded(!isMonthDetailsExpanded);

  const getBarColorByMonth = (month: string) => {
    // Find the corresponding chart data entry
    const chartEntry = chartData.find(entry => entry.month === month);
    return chartEntry?.isSelected ? '#3B82F6' : '#E5E7EB';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Header */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg font-semibold">{t('assets.calendar')}</h1>
            </div>
          </div>
        </div>
        
        {/* Asset Type Filter Card */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-hidden">
          <div className="p-4 flex items-center justify-between cursor-pointer" onClick={toggleFilter}>
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <h2 className="text-lg font-semibold">{t('assets.assetFilter')}</h2>
            </div>
            <button 
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isFilterExpanded ? "Collapse" : "Expand"}
            >
              {isFilterExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isFilterExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('assets.filterByAssetType')}
              </p>
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <select
                  value={selectedAssetType}
                  onChange={(e) => onAssetTypeChange(e.target.value as AssetType | 'all')}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 w-full sm:w-auto sm:min-w-[200px]"
                >
                  {assetTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {selectedAssetType !== 'all' && (
                  <div className="text-sm text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 w-full sm:w-auto text-center sm:text-left">
                    <strong>{t('assets.activeFiltering')}:</strong> {t('assets.showingOnly')} {assetTypeOptions.find(opt => opt.value === selectedAssetType)?.label}
                    <br />{filteredAssets.length} {t('common.across', { count: assets.length })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
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
                          fill={getBarColorByMonth(entry.month)}
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
                {/* Month Overview with Toggle */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={toggleMonthDetails}>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h2 className="text-lg font-semibold">{t('assets.monthDetails')}</h2>
                    </div>
                    <button 
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={isMonthDetailsExpanded ? "Collapse" : "Expand"}
                    >
                      {isMonthDetailsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isMonthDetailsExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold">{selectedMonthData.name} {new Date().getFullYear()}</h2>
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
                          <p className="text-2xl font-bold text-green-600">{selectedMonthData.assets.length}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('assets.averagePerAsset')}</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {selectedMonthData.assets.length > 0 
                              ? formatService.formatCurrency(selectedMonthData.totalIncome / selectedMonthData.assets.length)
                              : formatService.formatCurrency(0)
                            }
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t('assets.highestPayment')}</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedMonthData.assets.length > 0 
                              ? formatService.formatCurrency(selectedMonthData.assets[0].income)
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
                        
                        {selectedMonthData.assets.length === 0 ? (
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
                            {selectedMonthData.assets.map((item, index) => (
                              <div
                                key={item.asset.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{item.asset.name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {item.asset.type} • {formatService.formatCurrency(item.asset.value)}
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCalendarView;
