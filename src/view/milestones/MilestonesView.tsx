import React from 'react';
import BufferMilestone from '../../ui/milestones/BufferMilestone';
import DebtBreaker from '../../ui/milestones/DebtBreaker';
import DebtCoverage from '../../ui/milestones/DebtCoverage';
import FixedCostFreedom from '../../ui/milestones/FixedCostFreedom';
import LeisureMilestone from '../../ui/milestones/LeisureMilestone';
import TotalExpenseCoverage from '../../ui/milestones/TotalExpenseCoverage';
import { DebtEntry, DebtWithCoverage } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/common/Card';
import { Target, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MilestonesViewProps {
  liquidAssets: number;
  monthlyTotalExpenses: number;
  debts: DebtEntry[];
  totalProgress: number;
  debtCoverageData: DebtWithCoverage[];
  totalCoverage: number;
  monthlyLiabilityPayments: number;
  monthlyPassiveIncome: number;
  monthlyFixedCosts: number;
  monthlyLeisureExpenses: number;
}

const MilestonesView: React.FC<MilestonesViewProps> = ({
  liquidAssets,
  monthlyTotalExpenses,
  debts,
  totalProgress,
  debtCoverageData,
  totalCoverage,
  monthlyLiabilityPayments,
  monthlyPassiveIncome,
  monthlyFixedCosts,
  monthlyLeisureExpenses
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6" />
            {t('forecast.milestones.title', 'Finanzielle Meilensteine')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {((monthlyPassiveIncome / Math.max(monthlyTotalExpenses, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm opacity-90">{t('forecast.milestones.expenseCoverage', 'Ausgabendeckung')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {totalProgress.toFixed(1)}%
              </div>
              <div className="text-sm opacity-90">{t('forecast.milestones.debtProgress', 'Schuldenabbau')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {((liquidAssets / Math.max(monthlyTotalExpenses, 1))).toFixed(1)}
              </div>
              <div className="text-sm opacity-90">{t('forecast.milestones.monthsBuffer', 'Monate Puffer')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {((monthlyPassiveIncome / Math.max(monthlyFixedCosts, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm opacity-90">{t('forecast.milestones.fixedCosts', 'Fixkostendeckung')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <BufferMilestone
        liquidAssets={liquidAssets}
        monthlyTotalExpenses={monthlyTotalExpenses}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DebtBreaker
          debts={debts}
          totalProgress={totalProgress}
        />
        <DebtCoverage
          debts={debtCoverageData}
          totalCoverage={totalCoverage}
          totalMonthlyPayments={monthlyLiabilityPayments}
        />
      </div>

      <LeisureMilestone
        monthlyPassiveIncome={monthlyPassiveIncome}
        monthlyLeisureExpenses={monthlyLeisureExpenses}
      />

      <FixedCostFreedom
        monthlyPassiveIncome={monthlyPassiveIncome}
        monthlyFixedCosts={monthlyFixedCosts}
      />

      <TotalExpenseCoverage
        monthlyPassiveIncome={monthlyPassiveIncome}
        monthlyExpenses={monthlyTotalExpenses}
        monthlyLiabilityPayments={monthlyLiabilityPayments}
      />
    </div>
  );
};

export default MilestonesView;
