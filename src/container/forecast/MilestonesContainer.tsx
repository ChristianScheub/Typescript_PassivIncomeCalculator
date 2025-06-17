import React, { useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import calculatorService from '../../service/calculatorService';
import MilestonesView from '../../view/analytics-hub/milestones/MilestonesView';
import { Expense, Liability } from '../../types';

interface MilestonesContainerProps {
  onBack?: () => void;
}

const MilestonesContainer: React.FC<MilestonesContainerProps> = ({ onBack }) => {
  // Get necessary data from the store
  const { portfolioCache } = useAppSelector(state => state.assets);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: income } = useAppSelector(state => state.income);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Calculate values needed for the milestones
  const normalIncome = calculatorService.calculatePassiveIncome(income);
  const assetIncome = portfolioCache?.totals?.monthlyIncome || 0;
  const monthlyPassiveIncome = normalIncome + assetIncome;

  // Calculate fixed costs (only specific categories - WITHOUT liabilities for cleaner calculation)
  const monthlyFixedExpenses = expenses
    .filter((expense: Expense) => ['housing', 'transportation', 'utilities', 'insurance', 'health'].includes(expense.category))
    .reduce((total: number, expense: Expense) => total + calculatorService.calculateMonthlyExpense(expense), 0);

  const monthlyLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
  
  // Fixed costs includes fixed expenses + liability payments
  const monthlyFixedCosts = monthlyFixedExpenses + monthlyLiabilityPayments;

  const liquidAssets = portfolioCache?.totals?.totalValue || 0;

  // Transform data for DebtBreaker component
  const debts = liabilities.map((liability: Liability) => {
    // Avoid division by zero and ensure valid numbers
    const initialAmount = liability.initialBalance || 0;
    const currentAmount = liability.currentBalance || 0;
    const paidAmount = Math.max(0, initialAmount - currentAmount);
    const progress = initialAmount > 0 ? (paidAmount / initialAmount) * 100 : 0;
    
    return {
      name: liability.name,
      type: liability.type,
      initialAmount,
      currentAmount,
      progress: Math.min(100, Math.max(0, progress)) // Clamp between 0-100%
    };
  });

  // Calculate total progress based on how much debt has been paid off
  const totalInitialDebt = liabilities.reduce((sum: number, l: Liability) => sum + (l.initialBalance || 0), 0);
  const totalCurrentDebt = liabilities.reduce((sum: number, l: Liability) => sum + (l.currentBalance || 0), 0);
  const totalPaidDebt = Math.max(0, totalInitialDebt - totalCurrentDebt);
  const totalProgress = totalInitialDebt > 0 ? (totalPaidDebt / totalInitialDebt) * 100 : 0;

  // Transform data for DebtCoverage component  
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

  // Calculate leisure expenses (entertainment + personal categories)
  const monthlyLeisureExpenses = expenses
    .filter((expense: Expense) => expense.category === 'entertainment' || expense.category === 'personal')
    .reduce((total: number, expense: Expense) => total + calculatorService.calculateMonthlyExpense(expense), 0);

  // Calculate ALL monthly expenses (using the calculator service)
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
