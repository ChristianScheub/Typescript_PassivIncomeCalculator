import type { FinancialMetrics, FinancialAlert } from '@/types/domains/analytics/reporting';
import { v4 as uuidv4 } from '@/utils/uuid';

export const generateSavingsAlerts = (metrics: FinancialMetrics): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const { monthlyCashFlow, monthlyIncome, monthlyAssetIncome } = metrics;
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;

  // 1. Excellent Savings Rate
  if (totalMonthlyIncome > 0 && monthlyCashFlow > 0) {
    const savingsRate = monthlyCashFlow / totalMonthlyIncome;
    
    if (savingsRate > 0.3) {
      alerts.push({
        id: uuidv4(),
        type: 'success',
        category: 'savings',
        titleKey: 'alerts.savings.excellent.title',
        descriptionKey: 'alerts.savings.excellent.description',
        priority: 2,
        actionType: 'navigate',
        actionData: { route: '/forecast' },
        actionLabelKey: 'alerts.savings.excellent.action',
        calculatedValue: savingsRate * 100,
        metadata: { fireProgress: 'fast_track' }
      });
    }
  }

  // 2. Good Savings Potential
  if (totalMonthlyIncome > 3000 && monthlyCashFlow > 500) {
    const savingsRate = monthlyCashFlow / totalMonthlyIncome;
    
    if (savingsRate >= 0.15 && savingsRate <= 0.3) {
      alerts.push({
        id: uuidv4(),
        type: 'success',
        category: 'savings',
        titleKey: 'alerts.savings.good.title',
        descriptionKey: 'alerts.savings.good.description',
        priority: 3,
        actionType: 'navigate',
        actionData: { route: '/assets' },
        actionLabelKey: 'alerts.savings.good.action',
        calculatedValue: savingsRate * 100,
        metadata: { monthlyInvestmentPotential: monthlyCashFlow }
      });
    }
  }

  return alerts;
};
