import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../hooks/redux';
import analyticsHistoryService from '../../../service/analyticsHistoryService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/common/Card';
import { 
  TrendingUp,
  Target,
  PieChart,
  ArrowRight,
  Clock,
  Star,
  Zap,
  Activity,
  Settings,
  BarChart3,
  Globe,
  Bookmark,
  Copy,
  CreditCard,
  LineChart,
  GitBranch,
  Calendar
} from 'lucide-react';
import { AnalyticsCategory, AnalyticsSubCategory } from '../../../container/analytics/AnalyticsHubContainer';

interface AnalyticsOverviewSectionProps {
  onCategoryChange: (category: AnalyticsCategory, subCategory?: AnalyticsSubCategory) => void;
}

const AnalyticsOverviewSection: React.FC<AnalyticsOverviewSectionProps> = ({ onCategoryChange }) => {
  const { t } = useTranslation();
  
  // Get real data from Redux store
  const { items: assets, portfolioCache } = useAppSelector(state => state.assets);
  const { items: income } = useAppSelector(state => state.income);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: liabilities } = useAppSelector(state => state.liabilities);

  // Calculate real analytics data
  const analyticsData = useMemo(() => {
    const totalAssetValue = portfolioCache?.totals?.totalValue || 0;
    const monthlyIncome = portfolioCache?.totals?.monthlyIncome || 0;
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + (liability.currentBalance || 0), 0);
    
    // Analyze expense trends - check if expenses increased significantly
    const hasHighExpenses = totalExpenses > monthlyIncome * 0.7; // More than 70% of income
    
    // Check portfolio diversification - if more than 60% in one asset type, suggest diversification
    const assetTypes = new Set(assets.map(asset => asset.type));
    const needsDiversification = assetTypes.size < 3 && assets.length > 5;
    
    // Check if user has financial goals set
    const hasGoals = false; // TODO: Check if milestones/goals are set
    
    return {
      totalAssetValue,
      monthlyIncome,
      totalExpenses,
      totalLiabilities,
      hasHighExpenses,
      needsDiversification,
      hasGoals,
      assetsCount: assets.length,
      incomeSourcesCount: income.length,
      expenseCategoriesCount: new Set(expenses.map(e => e.category)).size,
      liabilitiesCount: liabilities.length
    };
  }, [portfolioCache, assets, income, expenses, liabilities]);

  // Real recent analytics based on user data
  const recentAnalytics = useMemo(() => {
    const history = analyticsHistoryService.getRecentAnalytics(3);
    
    // Map icon names to actual icon components
    const iconMap = {
      PieChart, TrendingUp, Activity, Settings, BarChart3, Globe, Target, 
      Bookmark, Copy, CreditCard, LineChart, GitBranch, Calendar
    };
    
    if (history.length === 0) {
      // Fallback to default analytics if no history
      return [
        {
          title: t('analytics.hub.recent.portfolioDistribution'),
          subtitle: `${analyticsData.assetsCount} ${t('analytics.hub.insights.assetsCount')}`,
          icon: PieChart,
          color: 'text-blue-500',
          onClick: () => onCategoryChange('distributions', 'assets')
        },
        {
          title: t('analytics.hub.recent.incomeAnalysis'),
          subtitle: `${analyticsData.incomeSourcesCount} ${t('analytics.hub.insights.incomeSourcesCount')}`,
          icon: TrendingUp,
          color: 'text-green-500',
          onClick: () => onCategoryChange('distributions', 'income')
        },
        {
          title: t('analytics.performance.title'),
          subtitle: t('analytics.hub.recent.viewedRecently'),
          icon: Activity,
          color: 'text-purple-500',
          onClick: () => onCategoryChange('performance', 'portfolioPerformance')
        }
      ];
    }
    
    // Map actual history to components
    return history.map((entry, index) => {
      const IconComponent = iconMap[entry.icon as keyof typeof iconMap] || PieChart;
      const colors = ['text-blue-500', 'text-green-500', 'text-purple-500'];
      
      return {
        title: entry.title,
        subtitle: t('analytics.hub.recent.viewedRecently'),
        icon: IconComponent,
        color: colors[index % colors.length],
        onClick: () => onCategoryChange(entry.category, entry.subCategory)
      };
    });
  }, [analyticsData, onCategoryChange, t]);

  // Smart recommendations based on real data analysis
  const recommendations = useMemo(() => {
    const recs = [];
    
    // High expenses recommendation
    if (analyticsData.hasHighExpenses) {
      recs.push({
        title: t('analytics.hub.hubRecommendations.expenseReview'),
        description: t('analytics.hub.hubRecommendations.expenseReviewDesc'),
        priority: 'high' as const,
        icon: Zap,
        onClick: () => onCategoryChange('distributions', 'expenses')
      });
    }
    
    // Diversification recommendation
    if (analyticsData.needsDiversification) {
      recs.push({
        title: t('analytics.hub.hubRecommendations.diversification'),
        description: t('analytics.hub.hubRecommendations.diversificationDesc'),
        priority: 'medium' as const,
        icon: Star,
        onClick: () => onCategoryChange('distributions', 'assets')
      });
    }
    
    // Goal setting recommendation
    if (!analyticsData.hasGoals) {
      recs.push({
        title: t('analytics.hub.hubRecommendations.goalSetting'),
        description: t('analytics.hub.hubRecommendations.goalSettingDesc'),
        priority: 'low' as const,
        icon: Target,
        onClick: () => onCategoryChange('milestones', 'fire')
      });
    }
    
    // If no specific recommendations, add general ones
    if (recs.length === 0) {
      recs.push(
        {
          title: t('analytics.hub.hubRecommendations.diversification'),
          description: t('analytics.hub.hubRecommendations.diversificationDesc'),
          priority: 'medium' as const,
          icon: Star,
          onClick: () => onCategoryChange('distributions', 'assets')
        },
        {
          title: t('analytics.hub.hubRecommendations.goalSetting'),
          description: t('analytics.hub.hubRecommendations.goalSettingDesc'),
          priority: 'low' as const,
          icon: Target,
          onClick: () => onCategoryChange('milestones', 'fire')
        }
      );
    }
    
    return recs.slice(0, 3); // Maximum 3 recommendations
  }, [analyticsData, onCategoryChange, t]);

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Recent Analytics */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span>{t('analytics.hub.recentAnalytics')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAnalytics.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={item.onClick}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <IconComponent className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>{t('analytics.hub.recommendations')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((item, index) => {
            const IconComponent = item.icon;
            const priorityColor = getPriorityColor(item.priority);
            
            return (
              <div 
                key={index}
                className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={item.onClick}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${priorityColor}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor}`}>
                    {t(`analytics.hub.priority.${item.priority}`)}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverviewSection;
