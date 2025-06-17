import React from 'react';
import { useTranslation } from 'react-i18next';
import { ViewHeader } from '../../../ui/layout/ViewHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/common/Card';
import { 
  PieChart, 
  TrendingUp, 
  CreditCard, 
  TrendingDown,
  ArrowRight 
} from 'lucide-react';

type DistributionCategory = 'overview' | 'assets' | 'income' | 'expenses' | 'liabilities';

interface DistributionsAnalyticsViewProps {
  onCategoryChange: (category: DistributionCategory) => void;
  onBack: () => void;
}

const DistributionsAnalyticsView: React.FC<DistributionsAnalyticsViewProps> = ({ 
  onCategoryChange, 
  onBack 
}) => {
  const { t } = useTranslation();

  const distributionCategories = [
    {
      id: 'assets' as const,
      title: t('analytics.hub.categories.distributions.assets'),
      description: t('analytics.hub.categories.distributions.assetsDesc'),
      icon: PieChart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'income' as const,
      title: t('analytics.hub.categories.distributions.income'),
      description: t('analytics.hub.categories.distributions.incomeDesc'),
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      id: 'expenses' as const,
      title: t('analytics.hub.categories.distributions.expenses'),
      description: t('analytics.hub.categories.distributions.expensesDesc'),
      icon: CreditCard,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'liabilities' as const,
      title: t('analytics.hub.categories.distributions.liabilities'),
      description: t('analytics.hub.categories.distributions.liabilitiesDesc'),
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ViewHeader
          title={t('analytics.hub.categories.distributions.title')}
          subtitle={t('analytics.hub.categories.distributions.description')}
          onBack={onBack}
        />

        {/* Distribution Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {distributionCategories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 
                  ${category.bgColor} border-2 ${category.borderColor}`}
                onClick={() => onCategoryChange(category.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm`}>
                        <IconComponent className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {category.title}
                        </h3>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('analytics.distributions.aboutTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('analytics.distributions.aboutDescription')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('analytics.distributions.features')}
              </h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• {t('analytics.distributions.feature1')}</li>
                <li>• {t('analytics.distributions.feature2')}</li>
                <li>• {t('analytics.distributions.feature3')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('analytics.distributions.insights')}
              </h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• {t('analytics.distributions.insight1')}</li>
                <li>• {t('analytics.distributions.insight2')}</li>
                <li>• {t('analytics.distributions.insight3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionsAnalyticsView;
