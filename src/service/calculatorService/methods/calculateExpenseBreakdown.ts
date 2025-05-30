import { Expense, ExpenseBreakdown, ExpenseCategory } from '../../../types';
import Logger from '../../Logger/logger';
import { calculateMonthlyExpense } from './calculateExpenses';

export const calculateExpenseBreakdown = (expenses: Expense[]): ExpenseBreakdown[] => {
  const breakdownMap = new Map<ExpenseCategory, number>();
  let total = 0;

  expenses.forEach(expense => {
    if (!expense.paymentSchedule) return;
    const monthlyAmount = calculateMonthlyExpense(expense);
    const currentAmount = breakdownMap.get(expense.category) || 0;
    breakdownMap.set(expense.category, currentAmount + monthlyAmount);
    total += monthlyAmount;
  });

  const result = Array.from(breakdownMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  Logger.info(`Expense breakdown calculated - categories: ${result.length}, total: ${total}`);
  return result;
};
