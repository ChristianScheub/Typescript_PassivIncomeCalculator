import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardTitle,Card, CardContent, CardHeader } from '@/ui/shared';
import { Home } from 'lucide-react';
import { formatService } from '@/service';
import { getHighestMilestone, getMilestoneKey } from '@/utils/milestoneUtils';
import './milestones.css';

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
        <div className="space-y-3 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('forecast.milestones.fixedCostFreedom.mainDescription')}
          </p>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">{t('forecast.milestones.fixedCostFreedom.includedCosts')}</p>
            <p className="ml-2">{t('forecast.milestones.fixedCostFreedom.categories')}</p>
            <p className="ml-2">{t('forecast.milestones.fixedCostFreedom.debtPayments')}</p>
          </div>
          
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
            {t('forecast.milestones.fixedCostFreedom.exclusionNote')}
          </div>
        </div>
        
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
            {(() => {
              const highestMilestone = getHighestMilestone(percentage);
              if (!highestMilestone) return null;
              
              return (
                <div className="milestone milestone-achieved">
                  {t(`forecast.milestones.fixedCostFreedom.${getMilestoneKey(highestMilestone)}`)}
                </div>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FixedCostFreedom;
