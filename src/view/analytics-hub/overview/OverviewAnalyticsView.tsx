import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../ui/common/Card';
import { Button } from '../../../ui/common/Button';
import { MiniAnalyticsCard } from '../../../ui/dashboard/MiniAnalyticsCard';
import { ArrowLeft, Banknote, TrendingUp, TrendingDown, Home, CreditCard } from 'lucide-react';
import { formatCurrency } from "@service/infrastructure/formatService/methods/formatCurrency";

interface OverviewData {
  totalAssetValue: number;
  monthlyIncome: number;
  totalExpenses: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyCashFlow: number;
  assetsCount: number;
  incomeSourcesCount: number;
  expenseCategoriesCount: number;
  liabilitiesCount: number;
}

interface MonthlyTrendData {
  month: string;
  income: number;
  expenses: number;
  cashFlow: number;
}

type OverviewTab = 'summary' | 'insights' | 'trends';

interface OverviewAnalyticsViewProps {
  selectedTab: OverviewTab;
  overviewData: OverviewData;
  monthlyTrends: MonthlyTrendData[];
  onTabChange: (tab: OverviewTab) => void;
  onBack?: () => void;
}

const OverviewAnalyticsView: React.FC<OverviewAnalyticsViewProps> = ({
  selectedTab,
  overviewData,
  monthlyTrends,
  onTabChange,
  onBack
}) => {
  const { t } = useTranslation();

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
                {t('analytics.overview.title') || 'Financial Overview'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('analytics.overview.subtitle') || 'Complete overview of your financial situation'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4">
          <div className="flex space-x-8">
            {['summary', 'insights', 'trends'].map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab as 'summary' | 'insights' | 'trends')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t(`analytics.overview.tabs.${tab}`) || tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {selectedTab === 'summary' && (
          <>
            {/* Key Metrics */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.overview.keyMetrics') || 'Key Financial Metrics'}
              </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniAnalyticsCard
              title={t('analytics.overview.netWorth') || 'Net Worth'}
              value={formatCurrency(overviewData.netWorth)}
              icon={<TrendingUp className="h-5 w-5" />}
              color={overviewData.netWorth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
            />
            <MiniAnalyticsCard
              title={t('analytics.overview.monthlyCashFlow') || 'Monthly Cash Flow'}
              value={formatCurrency(overviewData.monthlyCashFlow)}
              icon={<Banknote className="h-5 w-5" />}
              color={overviewData.monthlyCashFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
            />
            <MiniAnalyticsCard
              title={t('analytics.overview.totalAssets') || 'Total Assets'}
              value={formatCurrency(overviewData.totalAssetValue)}
              icon={<Home className="h-5 w-5" />}
              color="text-blue-600 dark:text-blue-400"
            />
            <MiniAnalyticsCard
              title={t('analytics.overview.totalLiabilities') || 'Total Liabilities'}
              value={formatCurrency(overviewData.totalLiabilities)}
              icon={<CreditCard className="h-5 w-5" />}
              color="text-orange-600 dark:text-orange-400"
            />
          </div>
        </div>

        {/* Income & Expenses */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.overview.incomeExpenses') || 'Income & Expenses'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniAnalyticsCard
              title={t('analytics.overview.monthlyIncome') || 'Monthly Income'}
              value={formatCurrency(overviewData.monthlyIncome)}
              icon={<TrendingUp className="h-5 w-5" />}
              color="text-green-600 dark:text-green-400"
            />
            <MiniAnalyticsCard
              title={t('analytics.overview.monthlyExpenses') || 'Monthly Expenses'}
              value={formatCurrency(overviewData.totalExpenses)}
              icon={<TrendingDown className="h-5 w-5" />}
              color="text-red-600 dark:text-red-400"
            />
          </div>
        </div>

        {/* Portfolio Counts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.overview.portfolioCounts') || 'Portfolio Overview'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniAnalyticsCard
              title={t('analytics.overview.assetsCount') || 'Assets'}
              value={overviewData.assetsCount.toString()}
              icon={<Home className="h-5 w-5" />}
              color="text-blue-600 dark:text-blue-400"
            />
            <MiniAnalyticsCard
              title={t('analytics.overview.incomeSourcesCount') || 'Income Sources'}
              value={overviewData.incomeSourcesCount.toString()}
              icon={<Banknote className="h-5 w-5" />}
              color="text-green-600 dark:text-green-400"
            />
            <MiniAnalyticsCard
              title={t('analytics.overview.expenseCategories') || 'Expense Categories'}
              value={overviewData.expenseCategoriesCount.toString()}
              icon={<TrendingDown className="h-5 w-5" />}
              color="text-orange-600 dark:text-orange-400"
            />
            <MiniAnalyticsCard
              title={t('analytics.overview.liabilitiesCount') || 'Liabilities'}
              value={overviewData.liabilitiesCount.toString()}
              icon={<CreditCard className="h-5 w-5" />}
              color="text-red-600 dark:text-red-400"
            />
          </div>
        </div>

        {/* Financial Health Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.overview.financialHealth') || 'Financial Health Summary'}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">
                {t('analytics.overview.assetToLiabilityRatio') || 'Asset-to-Liability Ratio'}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {overviewData.totalLiabilities > 0 ? 
                  `${(overviewData.totalAssetValue / overviewData.totalLiabilities).toFixed(2)}:1` : 
                  '∞:1'
                }
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">
                {t('analytics.overview.savingsRate') || 'Savings Rate'}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {overviewData.monthlyIncome > 0 ? 
                  `${((overviewData.monthlyCashFlow / overviewData.monthlyIncome) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">
                {t('analytics.overview.expenseRatio') || 'Expense Ratio'}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {overviewData.monthlyIncome > 0 ? 
                  `${((overviewData.totalExpenses / overviewData.monthlyIncome) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </span>
            </div>
          </div>
        </Card>
        </>
      )}

        {selectedTab === 'insights' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.overview.financialInsights') || 'Financial Insights'}
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {t('analytics.overview.netWorthAnalysis') || 'Net Worth Analysis'}
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    {overviewData.netWorth >= 0 
                      ? t('analytics.overview.positiveNetWorth') || 'Your net worth is positive, indicating good financial health.'
                      : t('analytics.overview.negativeNetWorth') || 'Your net worth is negative. Consider reducing liabilities or increasing assets.'
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    {t('analytics.overview.cashFlowAnalysis') || 'Cash Flow Analysis'}
                  </h4>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    {overviewData.monthlyCashFlow >= 0 
                      ? t('analytics.overview.positiveCashFlow') || 'You have positive monthly cash flow, which is excellent for building wealth.'
                      : t('analytics.overview.negativeCashFlow') || 'Your monthly expenses exceed income. Consider reducing expenses or increasing income.'
                    }
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    {t('analytics.overview.diversificationTip') || 'Portfolio Diversification'}
                  </h4>
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    {t('analytics.overview.diversificationAdvice') || 'Consider diversifying your assets across different categories to reduce risk.'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {selectedTab === 'trends' && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.overview.monthlyTrends') || 'Monthly Trends'}
              </h3>
              <div className="space-y-4">
                {monthlyTrends.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{trend.month}</span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        Income: {formatCurrency(trend.income)}
                      </span>
                      <span className="text-red-600 dark:text-red-400">
                        Expenses: {formatCurrency(trend.expenses)}
                      </span>
                      <span className={`font-medium ${trend.cashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        Cash Flow: {formatCurrency(trend.cashFlow)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewAnalyticsView;
