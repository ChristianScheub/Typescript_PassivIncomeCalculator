import { FinancialMetrics, FinancialAlert } from '../interfaces/IAlertsService';
import { v4 as uuidv4 } from '../../../../../utils/uuid';

const createNegativeCashFlowAlert = (monthlyCashFlow: number): FinancialAlert => {
  const isCritical = monthlyCashFlow < -1000;
  
  return {
    id: uuidv4(),
    type: isCritical ? 'critical' : 'warning',
    category: 'cashflow',
    titleKey: 'alerts.cashflow.negative.title',
    descriptionKey: 'alerts.cashflow.negative.description',
    priority: isCritical ? 10 : 8,
    actionType: 'navigate',
    actionData: { route: '/expenses' },
    actionLabelKey: 'alerts.cashflow.negative.action',
    calculatedValue: monthlyCashFlow,
    thresholds: { warning: 0, critical: -1000 },
    metadata: { severity: isCritical ? 'high' : 'medium' }
  };
};

const createLowSavingsAlert = (savingsRate: number): FinancialAlert => {
  const isWarning = savingsRate < 0.02;
  
  return {
    id: uuidv4(),
    type: isWarning ? 'warning' : 'info',
    category: 'cashflow',
    titleKey: 'alerts.cashflow.lowSavings.title',
    descriptionKey: 'alerts.cashflow.lowSavings.description',
    priority: isWarning ? 7 : 5,
    actionType: 'navigate',
    actionData: { route: '/expenses' },
    actionLabelKey: 'alerts.cashflow.lowSavings.action',
    calculatedValue: savingsRate * 100,
    thresholds: { warning: 5, critical: 2 },
    metadata: { targetSavingsRate: 20 }
  };
};

const createLowIncomeAlert = (totalMonthlyIncome: number): FinancialAlert => {
  return {
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
  };
};

export const generateCashflowAlerts = (metrics: FinancialMetrics): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const { monthlyCashFlow, monthlyIncome, monthlyAssetIncome } = metrics;
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;

  // 1. Negative Cash Flow Alert
  if (monthlyCashFlow < 0) {
    alerts.push(createNegativeCashFlowAlert(monthlyCashFlow));
  }

  // 2. Low Savings Rate Alert
  if (totalMonthlyIncome > 0 && monthlyCashFlow >= 0) {
    const savingsRate = monthlyCashFlow / totalMonthlyIncome;
    if (savingsRate < 0.05) {
      alerts.push(createLowSavingsAlert(savingsRate));
    }
  }

  // 3. Low Income Warning
  if (totalMonthlyIncome > 0 && totalMonthlyIncome < 1500) {
    alerts.push(createLowIncomeAlert(totalMonthlyIncome));
  }

  return alerts;
};
