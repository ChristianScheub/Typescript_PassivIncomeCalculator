import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { CreditCard } from 'lucide-react';
import formatService from '../../service/formatService';
import type { LiabilityType } from '../../types';
import { getHighestMilestone, getMilestoneKey } from '../../utils/milestoneUtils';
import './milestones.css';

interface DebtEntry {
  name: string;
  type: LiabilityType;
  initialAmount: number;
  currentAmount: number;
  progress: number;
}

interface DebtBreakerProps {
  debts: DebtEntry[];
  totalProgress: number;
}

const DebtBreaker: React.FC<DebtBreakerProps> = ({
  debts,
  totalProgress
}) => {
  const { t } = useTranslation();

  if (!debts.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
              <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>{t('forecast.milestones.debtBreaker.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            {t('forecast.milestones.debtBreaker.noDebt')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
            <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>{t('forecast.milestones.debtBreaker.title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('forecast.milestones.debtBreaker.description')}
        </p>
        
        {/* Total Progress */}
        <div className="space-y-4 mb-6">
          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-red-500 dark:bg-red-600 transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">
                {t('forecast.milestones.debtBreaker.totalProgress', { percent: totalProgress.toFixed(1) })}
              </p>
            </div>
            {totalProgress >= 100 && (
              <div className="text-emerald-500 dark:text-emerald-400 font-medium animate-fade-in">
                {t('forecast.milestones.debtBreaker.debtFree')}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {(() => {
              const highestMilestone = getHighestMilestone(totalProgress);
              if (!highestMilestone) return null;
              
              return (
                <div className="milestone milestone-achieved">
                  {t(`forecast.milestones.debtBreaker.${getMilestoneKey(highestMilestone)}`)}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Individual Debt Progress */}
        <div className="space-y-4">
          {debts.map((debt) => (
            <div key={debt.name} className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {t(`liabilities.types.${debt.type}`)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('forecast.milestones.debtBreaker.perDebt', {
                      name: t(`liabilities.types.${debt.type}`),
                      percent: debt.progress.toFixed(1)
                    })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <span>{formatService.formatCurrency(debt.currentAmount)}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      / {formatService.formatCurrency(debt.initialAmount)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('forecast.milestones.debtBreaker.remainingDebt')}
                  </div>
                </div>
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${debt.progress >= 100 ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-red-500 dark:bg-red-600'}`}
                  style={{ width: `${debt.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtBreaker;
