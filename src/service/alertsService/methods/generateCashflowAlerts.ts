import { FinancialMetrics, FinancialAlert } from '../interfaces/IAlertsService';
import { v4 as uuidv4 } from '../../../utils/uuid';

export const generateCashflowAlerts = (metrics: FinancialMetrics): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const { monthlyCashFlow, monthlyIncome, monthlyAssetIncome } = metrics;
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;

  // 1. Negative Cash Flow Alert (Critical)
  if (monthlyCashFlow < 0) {
    alerts.push({
      id: uuidv4(),
      type: monthlyCashFlow < -1000 ? 'critical' : 'warning',
      category: 'cashflow',
      titleKey: 'alerts.cashflow.negative.title',
      descriptionKey: 'alerts.cashflow.negative.description',
      priority: monthlyCashFlow < -1000 ? 10 : 8,
      actionType: 'navigate',
      actionData: { route: '/expenses' },
      actionLabelKey: 'alerts.cashflow.negative.action',
      calculatedValue: monthlyCashFlow,
      thresholds: { warning: 0, critical: -1000 },
      metadata: { severity: monthlyCashFlow < -1000 ? 'high' : 'medium' }
    });
  }

  // 2. Very Low Savings Rate Alert
  if (totalMonthlyIncome > 0 && monthlyCashFlow >= 0) {
    const savingsRate = monthlyCashFlow / totalMonthlyIncome;
    
    if (savingsRate < 0.05) {
      alerts.push({
        id: uuidv4(),
        type: savingsRate < 0.02 ? 'warning' : 'info',
        category: 'cashflow',
        titleKey: 'alerts.cashflow.lowSavings.title',
        descriptionKey: 'alerts.cashflow.lowSavings.description',
        priority: savingsRate < 0.02 ? 7 : 5,
        actionType: 'navigate',
        actionData: { route: '/expenses' },
        actionLabelKey: 'alerts.cashflow.lowSavings.action',
        calculatedValue: savingsRate * 100,
        thresholds: { warning: 5, critical: 2 },
        metadata: { targetSavingsRate: 20 }
      });
    }
  }

  // 3. Cashflow Volatility Warning (if income is very low)
  if (totalMonthlyIncome < 1500 && totalMonthlyIncome > 0) {
    alerts.push({
      id: uuidv4(),
      type: 'info',
      category: 'cashflow',
      titleKey: 'alerts.cashflow.lowIncome.title',
      descriptionKey: 'alerts.cashflow.lowIncome.description',
      priority: 4,
      actionType: 'navigate',
      actionData: { route: '/income' },
      actionLabelKey: 'alerts.cashflow.lowIncome.action',
      calculatedValue: totalMonthlyIncome,
      metadata: { recommendedMinimum: 2000 }
    });
  }

  return alerts;
};
