import { Expense, Income } from '../../../types/domains/financial/';
import { PortfolioRecommendation } from '../interfaces/IAnalyticsService';
import { calculatorService } from '../../calculatorService';

export const generateExpenseRecommendations = (
  expenses: Expense[],
  income: Income[]
): PortfolioRecommendation[] => {
  const recommendations: PortfolioRecommendation[] = [];

  // Calculate expense metrics
  const totalMonthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);
  const totalMonthlyIncome = calculatorService.calculateTotalMonthlyIncome(income);
  const expenseCategories = groupExpensesByCategory(expenses);
  const subscriptionExpenses = findSubscriptionExpenses(expenses);

  // 17. Complete Expense Categories
  const categoryCount = Object.keys(expenseCategories).length;
  if (categoryCount < 5 && expenses.length > 0) {
    recommendations.push({
      id: 'complete-expense-categories',
      category: 'expenses',
      priority: 'medium',
      titleKey: 'recommendations.expenses.completeExpenseCategories.title',
      descriptionKey: 'recommendations.expenses.completeExpenseCategories.description',
      actionCategory: 'expenses',
      actionSubCategory: 'categories',
      metadata: { currentCategories: categoryCount }
    });
  }

  // 18. High Expense Categories
  const highExpenseCategories = findHighExpenseCategories(expenseCategories, totalMonthlyExpenses);
  if (highExpenseCategories.length > 0) {
    recommendations.push({
      id: 'reduce-high-expenses',
      category: 'expenses',
      priority: 'high',
      titleKey: 'recommendations.expenses.reduceHighExpenses.title',
      descriptionKey: 'recommendations.expenses.reduceHighExpenses.description',
      actionCategory: 'expenses',
      actionSubCategory: 'management',
      metadata: { 
        categories: highExpenseCategories.map(cat => cat.category),
        maxPercentage: Math.max(...highExpenseCategories.map(cat => cat.percentage))
      }
    });
  }

  // 19. Subscription Audit
  const totalSubscriptions = subscriptionExpenses.reduce((sum, exp) => 
    sum + calculatorService.calculateMonthlyExpense(exp), 0);
  if (totalSubscriptions > 200) {
    recommendations.push({
      id: 'audit-subscriptions',
      category: 'expenses',
      priority: 'medium',
      titleKey: 'recommendations.expenses.auditSubscriptions.title',
      descriptionKey: 'recommendations.expenses.auditSubscriptions.description',
      actionCategory: 'expenses',
      actionSubCategory: 'subscriptions',
      metadata: { totalAmount: Math.round(totalSubscriptions), count: subscriptionExpenses.length }
    });
  }

  // 20. Budget Control
  if (totalMonthlyExpenses > totalMonthlyIncome) {
    recommendations.push({
      id: 'budget-control',
      category: 'expenses',
      priority: 'high',
      titleKey: 'recommendations.expenses.budgetControl.title',
      descriptionKey: 'recommendations.expenses.budgetControl.description',
      actionCategory: 'expenses',
      actionSubCategory: 'budgeting',
      metadata: { 
        overspend: Math.round(totalMonthlyExpenses - totalMonthlyIncome),
        expenseRatio: Math.round((totalMonthlyExpenses / totalMonthlyIncome) * 100)
      }
    });
  }

  // 21. Seasonal Expenses
  const seasonalExpenses = findSeasonalExpenses(expenses);
  if (seasonalExpenses.length === 0 && expenses.length > 5) {
    recommendations.push({
      id: 'plan-seasonal-expenses',
      category: 'expenses',
      priority: 'low',
      titleKey: 'recommendations.expenses.planSeasonalExpenses.title',
      descriptionKey: 'recommendations.expenses.planSeasonalExpenses.description',
      actionCategory: 'expenses',
      actionSubCategory: 'planning'
    });
  }

  // 22. Emergency Buffer
  const emergencyExpenses = findEmergencyExpenses(expenses);
  if (emergencyExpenses.length === 0) {
    recommendations.push({
      id: 'create-emergency-buffer',
      category: 'expenses',
      priority: 'medium',
      titleKey: 'recommendations.expenses.createEmergencyBuffer.title',
      descriptionKey: 'recommendations.expenses.createEmergencyBuffer.description',
      actionCategory: 'expenses',
      actionSubCategory: 'emergency',
      metadata: { suggestedAmount: Math.round(totalMonthlyExpenses * 3) }
    });
  }

  return recommendations;
};

// Helper functions
interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

const groupExpensesByCategory = (expenses: Expense[]): Record<string, Expense[]> => {
  return expenses.reduce((groups, expense) => {
    const category = expense.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);
};

const findSubscriptionExpenses = (expenses: Expense[]): Expense[] => {
  return expenses.filter(expense => expense.category === 'subscriptions');
};

const findHighExpenseCategories = (
  expenseCategories: Record<string, Expense[]>, 
  totalExpenses: number
): ExpenseCategory[] => {
  return Object.entries(expenseCategories)
    .map(([category, expenses]) => {
      const amount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      return { category, amount, percentage };
    })
    .filter(cat => cat.percentage > 30);
};

const findSeasonalExpenses = (_expenses: Expense[]): Expense[] => {
  // TODO: Find expenses with seasonal patterns
  return [];
};

const findEmergencyExpenses = (_expenses: Expense[]): Expense[] => {
  // TODO: Find emergency or buffer expenses
  return [];
};
