import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@ui/shared';
import { 
  BarChart3,
  TrendingUp,
  Target,
  PieChart,
  Activity,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { AnalyticsCategory, AnalyticsSubCategory } from '@/container/analyticsHub/AnalyticsHubContainer';

interface AnalyticsCategoryCard {
  id: AnalyticsCategory;
  titleKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  subCategories: Array<{
    id: AnalyticsSubCategory;
    titleKey: string;
    descriptionKey: string;
  }>;
}

interface AnalyticsCategoriesSectionProps {
  selectedCategory: AnalyticsCategory;
  onCategoryChange: (category: AnalyticsCategory, subCategory?: AnalyticsSubCategory) => void;
}

const AnalyticsCategoriesSection: React.FC<AnalyticsCategoriesSectionProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  const { t } = useTranslation();

  const analyticsCategories: AnalyticsCategoryCard[] = [
    {
      id: 'milestones',
      titleKey: 'analytics.hub.categories.milestones.title',
      descriptionKey: 'analytics.hub.categories.milestones.description',
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      subCategories: [
        {
          id: 'fire',
          titleKey: 'analytics.hub.categories.milestones.fire',
          descriptionKey: 'analytics.hub.categories.milestones.fireDesc'
        },
        {
          id: 'debt',
          titleKey: 'analytics.hub.categories.milestones.debt',
          descriptionKey: 'analytics.hub.categories.milestones.debtDesc'
        },
        {
          id: 'savings',
          titleKey: 'analytics.hub.categories.milestones.savings',
          descriptionKey: 'analytics.hub.categories.milestones.savingsDesc'
        }
      ]
    },
    {
      id: 'distributions',
      titleKey: 'analytics.hub.categories.distributions.title',
      descriptionKey: 'analytics.hub.categories.distributions.description',
      icon: PieChart,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      subCategories: [
        {
          id: 'assets',
          titleKey: 'analytics.hub.categories.distributions.assets',
          descriptionKey: 'analytics.hub.categories.distributions.assetsDesc'
        },
        {
          id: 'income',
          titleKey: 'analytics.hub.categories.distributions.income',
          descriptionKey: 'analytics.hub.categories.distributions.incomeDesc'
        },
        {
          id: 'expenses',
          titleKey: 'analytics.hub.categories.distributions.expenses',
          descriptionKey: 'analytics.hub.categories.distributions.expensesDesc'
        },
        {
          id: 'geographic',
          titleKey: 'analytics.hub.categories.distributions.geographic',
          descriptionKey: 'analytics.hub.categories.distributions.geographicDesc'
        }
      ]
    },
        {
      id: 'forecasting',
      titleKey: 'analytics.hub.categories.forecasting.title',
      descriptionKey: 'analytics.hub.categories.forecasting.description',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      subCategories: [
        {
          id: 'cashflow',
          titleKey: 'analytics.hub.categories.forecasting.cashflow',
          descriptionKey: 'analytics.hub.categories.forecasting.cashflowDesc'
        },
        {
          id: 'portfolio',
          titleKey: 'analytics.hub.categories.forecasting.portfolio',
          descriptionKey: 'analytics.hub.categories.forecasting.portfolioDesc'
        },
        {
          id: 'scenarios',
          titleKey: 'analytics.hub.categories.forecasting.scenarios',
          descriptionKey: 'analytics.hub.categories.forecasting.scenariosDesc'
        }
      ]
    },
    {
      id: 'performance',
      titleKey: 'analytics.hub.categories.performance.title',
      descriptionKey: 'analytics.hub.categories.performance.description',
      icon: Activity,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      subCategories: [
        {
          id: 'portfolioPerformance',
          titleKey: 'analytics.hub.categories.performance.portfolio',
          descriptionKey: 'analytics.hub.categories.performance.portfolioDesc'
        },
        {
          id: 'returns',
          titleKey: 'analytics.hub.categories.performance.returns',
          descriptionKey: 'analytics.hub.categories.performance.returnsDesc'
        },
        {
          id: 'historical',
          titleKey: 'analytics.hub.categories.performance.historical',
          descriptionKey: 'analytics.hub.categories.performance.historicalDesc'
        }
      ]
    },
    {
      id: 'custom',
      titleKey: 'analytics.hub.categories.assetCalendar.title',
      descriptionKey: 'analytics.hub.categories.assetCalendar.description',
      icon: Calendar,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
      subCategories: [
        {
          id: 'calendar',
          titleKey: 'analytics.hub.categories.assetCalendar.calendar',
          descriptionKey: 'analytics.hub.categories.assetCalendar.calendarDesc'
        },
        {
          id: 'history',
          titleKey: 'analytics.hub.categories.assetCalendar.history',
          descriptionKey: 'analytics.hub.categories.assetCalendar.historyDesc'
        },
        {
          id: 'timeline',
          titleKey: 'analytics.hub.categories.assetCalendar.timeline',
          descriptionKey: 'analytics.hub.categories.assetCalendar.timelineDesc'
        }
      ]
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        {t('analytics.hub.analyticsCategories')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {analyticsCategories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${category.bgColor} ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
              onClick={() => {
                  // For distributions, don't set a default subcategory - show overview instead
                  if (category.id === 'distributions') {
                    onCategoryChange(category.id);
                  } else {
                    const defaultSubCategory = category.subCategories[0]?.id;
                    onCategoryChange(category.id, defaultSubCategory);
                  }
              }}
            >
              <CardContent className="p-6">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm`}>
                      <IconComponent className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {t(category.titleKey)}
                      </h3>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Category Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t(category.descriptionKey)}
                </p>

                {/* Sub-categories Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t('analytics.hub.availableAnalytics')}
                  </p>
                  <div className="space-y-1">
                    {category.subCategories.slice(0, 3).map((subCategory) => (
                      <div 
                        key={subCategory.id}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
                      >
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {t(subCategory.titleKey)}
                      </div>
                    ))}
                    {category.subCategories.length > 3 && (
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        +{category.subCategories.length - 3} {t('analytics.hub.moreOptions')}
                      </div>
                    )}
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

export default AnalyticsCategoriesSection;
