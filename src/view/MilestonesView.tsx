import React from 'react';
import BufferMilestone from '../ui/milestones/BufferMilestone';
import DebtBreaker from '../ui/milestones/DebtBreaker';
import DebtCoverage from '../ui/milestones/DebtCoverage';
import FixedCostFreedom from '../ui/milestones/FixedCostFreedom';
import LeisureMilestone from '../ui/milestones/LeisureMilestone';
import TotalExpenseCoverage from '../ui/milestones/TotalExpenseCoverage';
import { DebtEntry, DebtWithCoverage } from '../types';

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
  return (
    <div className="space-y-6">
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

      <FixedCostFreedom
        monthlyPassiveIncome={monthlyPassiveIncome}
        monthlyFixedCosts={monthlyFixedCosts}
      />

      <LeisureMilestone
        monthlyPassiveIncome={monthlyPassiveIncome}
        monthlyLeisureExpenses={monthlyLeisureExpenses}
      />

      <TotalExpenseCoverage
        monthlyPassiveIncome={monthlyPassiveIncome}
        monthlyExpenses={monthlyTotalExpenses - monthlyLiabilityPayments}
        monthlyLiabilityPayments={monthlyLiabilityPayments}
      />
    </div>
  );
};

export default MilestonesView;
