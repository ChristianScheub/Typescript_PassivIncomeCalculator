import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { CreditCard } from 'lucide-react';
import { formatService } from '../../service';

interface DebtWithCoverage {
  name: string;
  type: string;
  monthlyPayment: number;
  coverage: number;
}

interface DebtCoverageProps {
  debts: DebtWithCoverage[];
  totalCoverage: number;
  totalMonthlyPayments: number;
}

const DebtCoverage: React.FC<DebtCoverageProps> = ({
  debts,
  totalCoverage,
  totalMonthlyPayments
}) => {
  const { t } = useTranslation();

  if (!debts.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>{t('forecast.milestones.debtCoverage.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">
            {t('forecast.milestones.debtCoverage.noDebt')}
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
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>{t('forecast.milestones.debtCoverage.title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('forecast.milestones.debtCoverage.description')}
        </p>

        {/* Total Coverage Progress */}
        <div className="space-y-4 mb-6">
          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-500 dark:bg-blue-600 transition-all duration-500"
              style={{ width: `${totalCoverage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-blue-600 dark:text-blue-400">
                {t('forecast.milestones.debtCoverage.totalCoverage', { percent: totalCoverage.toFixed(1) })}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {t('forecast.milestones.debtCoverage.monthlyCost', { 
                  amount: formatService.formatCurrency(totalMonthlyPayments)
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Individual Debt Coverage */}
        <div className="space-y-4">
          {debts.map((debt) => (
            <div key={debt.name} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {t(`liabilities.types.${debt.type}`)}
                  </span>
                  <br />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('forecast.milestones.debtCoverage.perDebt', {
                      name: t(`liabilities.types.${debt.type}`),
                      percent: debt.coverage.toFixed(1)
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {formatService.formatCurrency(debt.monthlyPayment)}/mo
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-blue-500 dark:bg-blue-600 transition-all duration-500"
                  style={{ width: `${debt.coverage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtCoverage;
