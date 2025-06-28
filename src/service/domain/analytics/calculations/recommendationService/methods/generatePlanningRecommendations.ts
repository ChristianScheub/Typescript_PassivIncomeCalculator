import { Transaction as Asset } from '@/types/domains/assets/';
import { Income, Expense, Liability } from '@/types/domains/financial/';
import calculatorService from '../../../../financial/calculations/compositeCalculatorService';
import { PortfolioRecommendation } from '@/types/domains/analytics';

export const generatePlanningRecommendations = (
  assets: Asset[],
  income: Income[],
  expenses: Expense[],
  liabilities: Liability[]
): PortfolioRecommendation[] => {
  const recommendations: PortfolioRecommendation[] = [];

  // Calculate financial metrics
  const totalMonthlyIncome = calculatorService.calculateTotalMonthlyIncome(income);
  const totalMonthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);
  const monthlyCashFlow = totalMonthlyIncome - totalMonthlyExpenses;
  const passiveIncome = calculatorService.calculatePassiveIncome(income, assets);

  // 28. Cashflow Improvement
  if (monthlyCashFlow < 0) {
    recommendations.push({
      id: 'improve-cashflow',
      category: 'planning',
      priority: 'high',
      titleKey: 'recommendations.planning.improveCashflow.title',
      descriptionKey: 'recommendations.planning.improveCashflow.description',
      actionCategory: 'income',
      actionSubCategory: 'optimization',
      metadata: { 
        deficit: Math.round(Math.abs(monthlyCashFlow)),
        incomeNeeded: Math.round(totalMonthlyExpenses - totalMonthlyIncome)
      }
    });
  }

  // 30. Financial Independence
  const expenseCoverage = totalMonthlyExpenses > 0 ? (passiveIncome / totalMonthlyExpenses) * 100 : 0;
  if (expenseCoverage < 25 && passiveIncome > 0) {
    recommendations.push({
      id: 'work-toward-financial-independence',
      category: 'planning',
      priority: 'low',
      titleKey: 'recommendations.planning.workTowardFinancialIndependence.title',
      descriptionKey: 'recommendations.planning.workTowardFinancialIndependence.description',
      actionCategory: 'income',
      actionSubCategory: 'passive',
      metadata: { 
        currentCoverage: Math.round(expenseCoverage),
        passiveIncomeNeeded: Math.round(totalMonthlyExpenses * 0.25 - passiveIncome)
      }
    });
  }

  return recommendations;
};