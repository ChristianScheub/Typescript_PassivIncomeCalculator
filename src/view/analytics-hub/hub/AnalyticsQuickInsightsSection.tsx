import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, } from '../../../ui/common/Card';
import formatService from '../../../service/formatService';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  CreditCard, 
  Target,
  BarChart3,
  Users,
  Layers
} from 'lucide-react';

interface QuickInsights {
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

interface AnalyticsQuickInsightsSectionProps {
  insights: QuickInsights;
}

const AnalyticsQuickInsightsSection: React.FC<AnalyticsQuickInsightsSectionProps> = ({ insights }) => {
  const { t } = useTranslation();

  const insightCards = [
    {
      title: t('analytics.hub.insights.netWorth'),
      value: formatService.formatCurrency(insights.netWorth),
      icon: Wallet,
      color: insights.netWorth >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: insights.netWorth >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: t('analytics.hub.insights.monthlyCashFlow'),
      value: formatService.formatCurrency(insights.monthlyCashFlow),
      icon: insights.monthlyCashFlow >= 0 ? TrendingUp : TrendingDown,
      color: insights.monthlyCashFlow >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: insights.monthlyCashFlow >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: t('analytics.hub.insights.totalAssets'),
      value: formatService.formatCurrency(insights.totalAssetValue),
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: t('analytics.hub.insights.monthlyIncome'),
      value: formatService.formatCurrency(insights.monthlyIncome),
      icon: CreditCard,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ];

  const countCards = [
    {
      title: t('analytics.hub.insights.assetsCount'),
      value: insights.assetsCount.toString(),
      icon: BarChart3,
      color: 'text-purple-500'
    },
    {
      title: t('analytics.hub.insights.incomeSourcesCount'),
      value: insights.incomeSourcesCount.toString(),
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: t('analytics.hub.insights.expenseCategories'),
      value: insights.expenseCategoriesCount.toString(),
      icon: Layers,
      color: 'text-orange-500'
    },
    {
      title: t('analytics.hub.insights.liabilitiesCount'),
      value: insights.liabilitiesCount.toString(),
      icon: Target,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t('analytics.hub.quickInsights')}
      </h2>
      
      {/* Main Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {insightCards.map((card) => {
          const IconComponent = card.icon;
          // Create a unique key based on the card's title
          const cardKey = card.title.replace(/\s+/g, '-').toLowerCase();
          return (
            <Card key={cardKey} className={`${card.bgColor} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {card.title}
                    </p>
                    <p className={`text-2xl font-bold ${card.color}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Count Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {countCards.map((card) => {
          const IconComponent = card.icon;
          // Create a unique key based on the card's title
          const cardKey = card.title.replace(/\s+/g, '-').toLowerCase();
          return (
            <Card key={cardKey} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <IconComponent className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {card.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsQuickInsightsSection;
