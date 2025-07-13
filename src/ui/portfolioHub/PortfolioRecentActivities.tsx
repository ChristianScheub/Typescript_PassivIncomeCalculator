import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wallet, 
  CreditCard, 
  ReceiptText, 
  Landmark, 
  Activity, 
  BarChart3, 
  Plus, 
  TrendingUp,
  Target, 
  Star 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/Card';
import { recentActivityService } from '@/service';
import type { PortfolioCategory, PortfolioSubCategory, PortfolioActivity } from '@/types/domains/analytics/reporting';

interface PortfolioRecentActivitiesProps {
  portfolioData: {
    assetsCount: number;
    incomeSourcesCount: number;
  };
  onCategoryChange: (category: PortfolioCategory, subCategory?: PortfolioSubCategory) => void;
  maxActivities?: number;
}

export const PortfolioRecentActivities: React.FC<PortfolioRecentActivitiesProps> = ({
  portfolioData,
  onCategoryChange,
  maxActivities = 3
}) => {
  const { t } = useTranslation();

  const recentPortfolioActivities = useMemo(() => {
    // Icon mapping for activities
    const iconMap = {
      Wallet, CreditCard, ReceiptText, Landmark, Activity, BarChart3, Plus, TrendingUp,
      Target, Star
    };

    const history = recentActivityService.getActivitiesByType('portfolio', maxActivities);
    
    if (history.length === 0) {
      // Fallback to default portfolio activities if no history
      return [
        {
          id: 'asset-management-fallback',
          title: t('portfolio.hub.recent.assetManagement'),
          subtitle: `${portfolioData.assetsCount} ${t('portfolio.hub.insights.assetsCount')}`,
          icon: Wallet,
          color: 'text-blue-500',
          onClick: () => onCategoryChange('assets', 'portfolio')
        },
        {
          id: 'income-management-fallback',
          title: t('portfolio.hub.recent.incomeManagement'),
          subtitle: `${portfolioData.incomeSourcesCount} ${t('portfolio.hub.insights.incomeSourcesCount')}`,
          icon: CreditCard,
          color: 'text-green-500',
          onClick: () => onCategoryChange('income', 'sources')
        },
        {
          id: 'expense-tracking-fallback',
          title: t('portfolio.hub.recent.expenseTracking'),
          subtitle: t('portfolio.hub.recent.viewedRecently'),
          icon: ReceiptText,
          color: 'text-orange-500',
          onClick: () => onCategoryChange('expenses', 'categories')
        }
      ];
    }

    // Map actual history to components
    return history
      .filter((entry): entry is PortfolioActivity => entry.type === 'portfolio') // Type guard for portfolio activities
      .map((entry: PortfolioActivity, index: number) => {
        const IconComponent = iconMap[entry.icon as keyof typeof iconMap] || Wallet;
        const colors = ['text-blue-500', 'text-green-500', 'text-orange-500'];
        
        return {
          id: entry.id, // Use the entry's unique ID
          title: t(entry.titleKey), // Use translation key
          subtitle: entry.subtitleKey ? t(entry.subtitleKey) : t('portfolio.hub.recent.viewedRecently'),
          icon: IconComponent,
          color: colors[index % colors.length],
          onClick: () => onCategoryChange(entry.category, entry.subCategory)
        };
      });
  }, [portfolioData, onCategoryChange, t, maxActivities]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          {t('portfolio.hub.recentActivities')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentPortfolioActivities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={activity.onClick}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm`}>
                    <IconComponent className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.subtitle}
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
