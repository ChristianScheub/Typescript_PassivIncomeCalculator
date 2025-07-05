import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { formatService } from '@/service';
import { getHighestBufferMilestone, getBufferMilestoneKey } from '@/utils/milestoneUtils';
import './milestones.css';
import { CardTitle,Card, CardContent, CardHeader } from '@/ui/shared';

interface BufferMilestoneProps {
  liquidAssets: number;
  monthlyTotalExpenses: number;
}

const BufferMilestone: React.FC<BufferMilestoneProps> = ({
  liquidAssets,
  monthlyTotalExpenses,
}) => {
  const { t } = useTranslation();
  
  const bufferMonths = monthlyTotalExpenses > 0 
    ? liquidAssets / monthlyTotalExpenses
    : 0;

  const percentage = (bufferMonths / 6) * 100; // Target is 6 months

  if (monthlyTotalExpenses === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>{t('forecast.milestones.bufferMilestone.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            {t('forecast.milestones.bufferMilestone.noExpenses')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>{t('forecast.milestones.bufferMilestone.title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('forecast.milestones.bufferMilestone.description')}
        </p>
        
        <div className="space-y-4">
          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-500 dark:bg-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-blue-600 dark:text-blue-400">
                {t('forecast.milestones.bufferMilestone.monthsCovered', { months: bufferMonths.toFixed(0) })}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {formatService.formatCurrency(liquidAssets)} / {formatService.formatCurrency(monthlyTotalExpenses * 6)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {(() => {
              const highestMilestone = getHighestBufferMilestone(percentage);
              if (!highestMilestone) return null;
              
              return (
                <div className="milestone milestone-achieved">
                  {t(`forecast.milestones.bufferMilestone.${getBufferMilestoneKey(highestMilestone)}`)}
                </div>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BufferMilestone;
