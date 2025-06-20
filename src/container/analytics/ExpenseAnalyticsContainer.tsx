import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import ExpenseAnalyticsView from '../../view/analytics-hub/expenses/ExpenseAnalyticsView';
import calculatorService from '../../service/domain/financial/calculations/compositeCalculatorService';
import { Expense } from '../../types';
import Logger from '../../service/shared/logging/Logger/logger';

type ExpenseAnalyticsTab = 'monthly' | 'annual';

interface ExpenseAnalyticsContainerProps {
  onBack: () => void;
}

const ExpenseAnalyticsContainer: React.FC<ExpenseAnalyticsContainerProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<ExpenseAnalyticsTab>('monthly');
  
  // Get expense data from Redux store
  const { items: expenses } = useAppSelector(state => state.expenses);
  
  // Calculate expense analytics data
  const expenseAnalytics = useMemo(() => {
    if (!expenses.length) {
      Logger.info('No expenses available for analytics');
      return {
        monthlyBreakdown: [],
        annualBreakdown: [],
        monthlyIndividualExpenses: [],
        annualIndividualExpenses: [],
        totalMonthlyExpenses: 0,
        totalAnnualExpenses: 0
      };
    }
    
    Logger.info(`Calculating expense analytics for ${expenses.length} expenses`);
    
    // Calculate monthly expense breakdown by category
    const monthlyBreakdown = calculatorService.calculateExpenseBreakdown(expenses);
    
    // Calculate annual breakdown (same categories, but annual amounts)
    const annualBreakdown = monthlyBreakdown.map(category => ({
      ...category,
      amount: category.amount * 12,
      // Percentage stays the same as it's relative to total
    }));
    
    // Calculate individual expenses for monthly view
    const monthlyIndividualExpenses = expenses
      .map((expense: Expense) => ({
        name: expense.name,
        amount: calculatorService.calculateMonthlyExpense(expense),
        category: expense.category,
        percentage: 0 // Will be calculated below
      }))
      .filter((expense: any) => expense.amount > 0)
      .sort((a: any, b: any) => b.amount - a.amount);
    
    // Calculate individual expenses for annual view
    const annualIndividualExpenses = expenses
      .map((expense: Expense) => ({
        name: expense.name,
        amount: calculatorService.calculateMonthlyExpense(expense) * 12,
        category: expense.category,
        percentage: 0 // Will be calculated below
      }))
      .filter((expense: any) => expense.amount > 0)
      .sort((a: any, b: any) => b.amount - a.amount);
    
    // Calculate totals
    const totalMonthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);
    const totalAnnualExpenses = totalMonthlyExpenses * 12;
    
    // Calculate percentages for individual expenses
    if (totalMonthlyExpenses > 0) {
      monthlyIndividualExpenses.forEach((expense: any) => {
        expense.percentage = (expense.amount / totalMonthlyExpenses) * 100;
      });
    }
    
    if (totalAnnualExpenses > 0) {
      annualIndividualExpenses.forEach((expense: any) => {
        expense.percentage = (expense.amount / totalAnnualExpenses) * 100;
      });
    }
    
    Logger.info(`Expense analytics calculated - Monthly total: ${totalMonthlyExpenses}, Annual total: ${totalAnnualExpenses}`);
    
    return {
      monthlyBreakdown,
      annualBreakdown,
      monthlyIndividualExpenses,
      annualIndividualExpenses,
      totalMonthlyExpenses,
      totalAnnualExpenses
    };
  }, [expenses]);

  const handleTabChange = (tab: ExpenseAnalyticsTab) => {
    Logger.info(`Switching to expense analytics tab: ${tab}`);
    setSelectedTab(tab);
  };

  return (
    <ExpenseAnalyticsView
      selectedTab={selectedTab}
      expenseAnalytics={expenseAnalytics}
      onTabChange={handleTabChange}
      onBack={onBack}
    />
  );
};

export default ExpenseAnalyticsContainer;
