import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { PartyPopper } from 'lucide-react';
import { formatService } from '@/service';
import { getHighestMilestone, getMilestoneKey } from '@/utils/milestoneUtils';
import './milestones.css';

interface LeisureMilestoneProps {
  monthlyPassiveIncome: number;
  monthlyLeisureExpenses: number;
}

const LeisureMilestone: React.FC<LeisureMilestoneProps> = ({
  monthlyPassiveIncome,
  monthlyLeisureExpenses,
}) => {
  const { t } = useTranslation();
  
  const percentage = monthlyLeisureExpenses > 0 
    ? Math.min((monthlyPassiveIncome / monthlyLeisureExpenses) * 100, 100)
    : 0;

  if (monthlyLeisureExpenses === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-violet-100 dark:bg-violet-900 p-2 rounded-full">
              <PartyPopper className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <CardTitle>{t('forecast.milestones.leisureMilestone.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            {t('forecast.milestones.leisureMilestone.noExpenses')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-violet-100 dark:bg-violet-900 p-2 rounded-full">
            <PartyPopper className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <CardTitle>{t('forecast.milestones.leisureMilestone.title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('forecast.milestones.leisureMilestone.description')}
        </p>
        
        <div className="space-y-4">
          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-violet-500 dark:bg-violet-600 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-violet-600 dark:text-violet-400">
                {t('forecast.milestones.leisureMilestone.percentCovered', { percent: percentage.toFixed(1) })}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {formatService.formatCurrency(monthlyPassiveIncome)} / {formatService.formatCurrency(monthlyLeisureExpenses)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {(() => {
              const highestMilestone = getHighestMilestone(percentage);
              if (!highestMilestone) return null;
              
              return (
                <div className="milestone milestone-achieved">
                  {t(`forecast.milestones.leisureMilestone.${getMilestoneKey(highestMilestone)}`)}
                </div>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeisureMilestone;
