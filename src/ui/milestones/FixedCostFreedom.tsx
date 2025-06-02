import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Home } from 'lucide-react';
import formatService from '../../service/formatService';

interface FixedCostFreedomProps {
  monthlyPassiveIncome: number;
  monthlyFixedCosts: number;
}

const FixedCostFreedom: React.FC<FixedCostFreedomProps> = ({
  monthlyPassiveIncome,
  monthlyFixedCosts,
}) => {
  const { t } = useTranslation();
  
  const percentage = monthlyFixedCosts > 0 
    ? Math.min((monthlyPassiveIncome / monthlyFixedCosts) * 100, 100)
    : 0;

  if (monthlyFixedCosts === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-full">
              <Home className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>{t('forecast.milestones.fixedCostFreedom.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            {t('forecast.milestones.fixedCostFreedom.noFixedCosts')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-full">
            <Home className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle>{t('forecast.milestones.fixedCostFreedom.title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('forecast.milestones.fixedCostFreedom.description')}
        </p>
        
        <div className="space-y-4">
          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-emerald-500 dark:bg-emerald-600 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                {t('forecast.milestones.fixedCostFreedom.percentCovered', { percent: percentage.toFixed(1) })}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {formatService.formatCurrency(monthlyPassiveIncome)} / {formatService.formatCurrency(monthlyFixedCosts)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {percentage >= 25 && (
              <div className={`milestone ${percentage >= 25 ? 'milestone-achieved' : ''}`}>
                {t('forecast.milestones.fixedCostFreedom.milestone25')}
              </div>
            )}
            {percentage >= 50 && (
              <div className={`milestone ${percentage >= 50 ? 'milestone-achieved' : ''}`}>
                {t('forecast.milestones.fixedCostFreedom.milestone50')}
              </div>
            )}
            {percentage >= 75 && (
              <div className={`milestone ${percentage >= 75 ? 'milestone-achieved' : ''}`}>
                {t('forecast.milestones.fixedCostFreedom.milestone75')}
              </div>
            )}
            {percentage >= 100 && (
              <div className={`milestone ${percentage >= 100 ? 'milestone-achieved' : ''}`}>
                {t('forecast.milestones.fixedCostFreedom.milestone100')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FixedCostFreedom;
