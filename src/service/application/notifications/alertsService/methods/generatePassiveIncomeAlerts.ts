import { FinancialMetrics, FinancialAlert } from '../interfaces/IAlertsService';
import { v4 as uuidv4 } from '../../../../../utils/uuid';

export const generatePassiveIncomeAlerts = (metrics: FinancialMetrics): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const { monthlyIncome, monthlyAssetIncome, passiveIncome, monthlyExpenses, monthlyLiabilityPayments } = metrics;
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;
  const totalPassiveIncome = passiveIncome + monthlyAssetIncome;
  const totalMonthlyExpenses = monthlyExpenses + monthlyLiabilityPayments;

  // 1. Low Passive Income Ratio
  if (totalMonthlyIncome > 0) {
    const passiveRatio = totalPassiveIncome / totalMonthlyIncome;
    
    if (passiveRatio < 0.15) {
      alerts.push({
        id: uuidv4(),
        type: passiveRatio < 0.05 ? 'warning' : 'info',
        category: 'passive_income',
        titleKey: 'alerts.passiveIncome.lowRatio.title',
        descriptionKey: 'alerts.passiveIncome.lowRatio.description',
        priority: passiveRatio < 0.05 ? 6 : 4,
        actionType: 'navigate',
        actionData: { route: '/assets' },
        actionLabelKey: 'alerts.passiveIncome.lowRatio.action',
        calculatedValue: passiveRatio * 100,
        thresholds: { warning: 15, critical: 5 },
        metadata: { targetRatio: 25 }
      });
    }
  }

  // 2. Passive Income vs Expenses Ratio
  if (totalMonthlyExpenses > 0) {
    const expenseCoverageRatio = totalPassiveIncome / totalMonthlyExpenses;
    
    if (expenseCoverageRatio > 0.1 && expenseCoverageRatio < 0.5) {
      alerts.push({
        id: uuidv4(),
        type: 'info',
        category: 'passive_income',
        titleKey: 'alerts.passiveIncome.goodProgress.title',
        descriptionKey: 'alerts.passiveIncome.goodProgress.description',
        priority: 3,
        actionType: 'navigate',
        actionData: { route: '/forecast' },
        actionLabelKey: 'alerts.passiveIncome.goodProgress.action',
        calculatedValue: expenseCoverageRatio * 100,
        metadata: { progressToFire: expenseCoverageRatio * 100 }
      });
    }
  }

  // 3. No Passive Income at All
  if (totalPassiveIncome === 0 && totalMonthlyIncome > 1000) {
    alerts.push({
      id: uuidv4(),
      type: 'info',
      category: 'passive_income',
      titleKey: 'alerts.passiveIncome.none.title',
      descriptionKey: 'alerts.passiveIncome.none.description',
      priority: 5,
      actionType: 'navigate',
      actionData: { route: '/assets' },
      actionLabelKey: 'alerts.passiveIncome.none.action',
      calculatedValue: 0,
      metadata: { suggestedFirstStep: 'dividend_stocks' }
    });
  }

  return alerts;
};
