import React from 'react';
import { useAppSelector } from '../hooks/redux';
import calculatorService from '../service/calculatorService';
import MilestonesView from '../view/MilestonesView';

const MilestonesContainer: React.FC = () => {
  // Get necessary data from the store
  const { items: assets } = useAppSelector(state => state.assets);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: income } = useAppSelector(state => state.income);

  // Calculate values needed for the milestones
  const monthlyPassiveIncome = calculatorService.calculatePassiveIncome(income) +
                              calculatorService.calculateTotalMonthlyAssetIncome(assets);

  // Calculate fixed costs (only specific categories - WITHOUT liabilities for cleaner calculation)
  const monthlyFixedExpenses = expenses
    .filter(expense => ['housing', 'transportation', 'utilities', 'insurance', 'health'].includes(expense.category))
    .reduce((total, expense) => total + calculatorService.calculateMonthlyExpense(expense), 0);

  const monthlyLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
  
  // Fixed costs includes fixed expenses + liability payments
  const monthlyFixedCosts = monthlyFixedExpenses + monthlyLiabilityPayments;

  const liquidAssets = calculatorService.calculateLiquidAssetValue(assets);

  // Transform data for DebtBreaker component
  const debts = liabilities.map(liability => {
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
  const totalInitialDebt = liabilities.reduce((sum, l) => sum + (l.initialBalance || 0), 0);
  const totalCurrentDebt = liabilities.reduce((sum, l) => sum + (l.currentBalance || 0), 0);
  const totalPaidDebt = Math.max(0, totalInitialDebt - totalCurrentDebt);
  const totalProgress = totalInitialDebt > 0 ? (totalPaidDebt / totalInitialDebt) * 100 : 0;

  // Transform data for DebtCoverage component  
  const debtCoverageData = liabilities.map(liability => {
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
    .filter(expense => expense.category === 'entertainment' || expense.category === 'personal')
    .reduce((total, expense) => total + calculatorService.calculateMonthlyExpense(expense), 0);

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
    />
  );
};

export default MilestonesContainer;
