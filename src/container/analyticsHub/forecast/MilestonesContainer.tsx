import React, { useEffect, useMemo } from 'react';
import MilestonesView from '@/view/analytics-hub/milestones/MilestonesView';
import { Expense, Liability } from '@/types/domains/financial';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { useAppSelector } from '@/hooks/redux';
import { calculatorService } from '@/service';

interface MilestonesContainerProps {
  onBack?: () => void;
}

const MilestonesContainer: React.FC<MilestonesContainerProps> = ({ onBack }) => {
  const { cache: portfolioCache } = useAppSelector(state => state.transactions);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: income } = useAppSelector(state => state.income);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const normalIncome = calculatorService.calculatePassiveIncome(income);
  const assetIncome = portfolioCache?.totals?.monthlyIncome || 0;
  const monthlyPassiveIncome = normalIncome + assetIncome;

  const monthlyFixedExpenses = expenses
    .filter((expense: Expense) => ['housing', 'transportation', 'utilities', 'insurance', 'health'].includes(expense.category))
    .reduce((total: number, expense: Expense) => total + calculatorService.calculateMonthlyExpense(expense), 0);

  const monthlyLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
  
  const monthlyFixedCosts = monthlyFixedExpenses + monthlyLiabilityPayments;

  const liquidAssets = useMemo(() => {
    if (!portfolioCache?.positions) return 0;
    
    return portfolioCache.positions
      .filter((position: PortfolioPosition) => {
        const liquidTypes = ['stock', 'crypto', 'cash'];
        return liquidTypes.includes(position.type);
      })
      .reduce((sum: number, position: PortfolioPosition) => sum + position.currentValue, 0);
  }, [portfolioCache?.positions]);

  const debts = liabilities.map((liability: Liability) => {
    const initialAmount = liability.initialBalance || 0;
    const currentAmount = liability.currentBalance || 0;
    const paidAmount = Math.max(0, initialAmount - currentAmount);
    const progress = initialAmount > 0 ? (paidAmount / initialAmount) * 100 : 0;
    
    return {
      name: liability.name,
      type: liability.type,
      initialAmount,
      currentAmount,
      progress: Math.min(100, Math.max(0, progress))
    };
  });

  const totalInitialDebt = liabilities.reduce((sum: number, l: Liability) => sum + (l.initialBalance || 0), 0);
  const totalCurrentDebt = liabilities.reduce((sum: number, l: Liability) => sum + (l.currentBalance || 0), 0);
  const totalPaidDebt = Math.max(0, totalInitialDebt - totalCurrentDebt);
  const totalProgress = totalInitialDebt > 0 ? (totalPaidDebt / totalInitialDebt) * 100 : 0;

  const debtCoverageData = liabilities.map((liability: Liability) => {
    const monthlyPayment = calculatorService.calculateLiabilityMonthlyPayment(liability);
    return {
      name: liability.name,
      type: liability.type,
      monthlyPayment,
      coverage: monthlyPassiveIncome > 0 ? (monthlyPassiveIncome / monthlyPayment) * 100 : 0
    };
  });

  const totalCoverage = monthlyLiabilityPayments > 0 ? (monthlyPassiveIncome / monthlyLiabilityPayments) * 100 : 0;

  const monthlyLeisureExpenses = expenses
    .filter((expense: Expense) => expense.category === 'entertainment' || expense.category === 'personal')
    .reduce((total: number, expense: Expense) => total + calculatorService.calculateMonthlyExpense(expense), 0);

  const monthlyTotalExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);

  return (
    <MilestonesView
      liquidAssets={liquidAssets}
      monthlyTotalExpenses={monthlyTotalExpenses}
      debts={debts}
      totalProgress={totalProgress}
      debtCoverageData={debtCoverageData}
      totalCoverage={totalCoverage}
      monthlyLiabilityPayments={monthlyLiabilityPayments}
      monthlyPassiveIncome={monthlyPassiveIncome}
      monthlyFixedCosts={monthlyFixedCosts}
      monthlyLeisureExpenses={monthlyLeisureExpenses}
      onBack={onBack}
    />
  );
};

export default MilestonesContainer;
