import React from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shared/Card';
import type { AIInsightsCardProps } from '@/types/domains/analytics/ai';

/**
 * AI Insights Card Component
 * Displays a card for accessing AI-generated financial recommendations
 */
const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ onClick, className = '' }) => {
  const { t } = useTranslation();

  return (
    <Card 
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('ai.insights.title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('ai.insights.subtitle')}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <Sparkles className="h-4 w-4" />
          <span>{t('ai.insights.generate')}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('ai.responses.requestTypes.general')}
        </p>
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;
