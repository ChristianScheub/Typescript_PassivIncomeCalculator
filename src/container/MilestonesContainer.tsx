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

  // Calculate fixed costs (only specific categories + liabilities)
  const monthlyFixedCosts = expenses
    .filter(expense => ['housing', 'transportation', 'utilities', 'insurance', 'health'].includes(expense.category))
    .reduce((total, expense) => total + calculatorService.calculateMonthlyExpense(expense), 0) +
    calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);

  const totalDebt = calculatorService.calculateTotalDebt(liabilities);
  const monthlyLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);

  const liquidAssets = calculatorService.calculateLiquidAssetValue(assets);

  // Transform data for DebtBreaker component
  const debts = liabilities.map(liability => ({
    name: liability.name,
    type: liability.type,
    initialAmount: liability.initialBalance,
    currentAmount: liability.currentBalance,
    progress: ((liability.initialBalance - liability.currentBalance) / liability.initialBalance) * 100
  }));

  const totalProgress = totalDebt > 0 ? 
    ((liabilities.reduce((sum, l) => sum + l.initialBalance, 0) - totalDebt) / 
    liabilities.reduce((sum, l) => sum + l.initialBalance, 0)) * 100 : 0;

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

  const monthlyTotalExpenses = monthlyFixedCosts + monthlyLeisureExpenses;

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
