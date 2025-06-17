import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Target } from 'lucide-react';
import formatService from '../../service/formatService';
import { getHighestMilestone, getMilestoneKey } from '../../utils/milestoneUtils';
import './milestones.css';

interface TotalExpenseCoverageProps {
  monthlyPassiveIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
}

const TotalExpenseCoverage: React.FC<TotalExpenseCoverageProps> = ({
  monthlyPassiveIncome,
  monthlyExpenses,
  monthlyLiabilityPayments,
}) => {
  const { t } = useTranslation();
  
  const totalMonthlyExpenses = monthlyExpenses + monthlyLiabilityPayments;
  const percentage = totalMonthlyExpenses > 0 
    ? Math.min((monthlyPassiveIncome / totalMonthlyExpenses) * 100, 100)
    : 0;

  if (totalMonthlyExpenses === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-full">
              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>{t('forecast.milestones.totalExpenseCoverage.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            {t('forecast.milestones.totalExpenseCoverage.noExpenses')}
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
            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle>{t('forecast.milestones.totalExpenseCoverage.title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('forecast.milestones.totalExpenseCoverage.description')}
        </p>

        <div className="space-y-4">
          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-emerald-500 dark:bg-emerald-600 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                {t('forecast.milestones.totalExpenseCoverage.percentCovered', { percent: percentage.toFixed(1) })}
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {t('forecast.milestones.totalExpenseCoverage.passiveIncome', { income: formatService.formatCurrency(monthlyPassiveIncome) })}
              </p>
              
              <p className="text-gray-500 dark:text-gray-400">
                {t('forecast.milestones.totalExpenseCoverage.totalMonthlyExpenses', { amount: formatService.formatCurrency(totalMonthlyExpenses) })}
              </p>
              
              <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                <p className="font-medium">{t('forecast.milestones.totalExpenseCoverage.breakdownTitle')}</p>
                <p className="ml-2">{t('forecast.milestones.totalExpenseCoverage.regularExpenses', { expenses: formatService.formatCurrency(monthlyExpenses) })}</p>
                <p className="ml-2">{t('forecast.milestones.totalExpenseCoverage.liabilityPayments', { debts: formatService.formatCurrency(monthlyLiabilityPayments) })}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {(() => {
              const highestMilestone = getHighestMilestone(percentage);
              if (!highestMilestone) return null;
              
              return (
                <div className="milestone milestone-achieved">
                  {t(`forecast.milestones.totalExpenseCoverage.${getMilestoneKey(highestMilestone)}`)}
                </div>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalExpenseCoverage;
