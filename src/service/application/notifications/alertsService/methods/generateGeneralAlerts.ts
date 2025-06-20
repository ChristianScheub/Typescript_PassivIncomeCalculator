import { FinancialMetrics, FinancialAlert } from '../interfaces/IAlertsService';
import { v4 as uuidv4 } from '../../../../../utils/uuid';

export const generateGeneralAlerts = (metrics: FinancialMetrics, includeSuccess: boolean = true): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const { totalAssets, netWorth, monthlyIncome, monthlyAssetIncome } = metrics;
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;

  // 1. No Assets Alert
  if (totalAssets === 0 && totalMonthlyIncome > 500) {
    alerts.push({
      id: uuidv4(),
      type: 'info',
      category: 'general',
      titleKey: 'alerts.general.noAssets.title',
      descriptionKey: 'alerts.general.noAssets.description',
      priority: 4,
      actionType: 'navigate',
      actionData: { route: '/assets' },
      actionLabelKey: 'alerts.general.noAssets.action',
      calculatedValue: 0,
      metadata: { suggestedFirstInvestment: 500 }
    });
  }

  // 2. Negative Net Worth Warning
  if (netWorth < 0) {
    alerts.push({
      id: uuidv4(),
      type: 'warning',
      category: 'general',
      titleKey: 'alerts.general.negativeNetWorth.title',
      descriptionKey: 'alerts.general.negativeNetWorth.description',
      priority: 8,
      actionType: 'navigate',
      actionData: { route: '/liabilities' },
      actionLabelKey: 'alerts.general.negativeNetWorth.action',
      calculatedValue: netWorth,
      metadata: { focusArea: 'debt_reduction' }
    });
  }

  // 3. Strong Financial Position (Success Alert)
  if (includeSuccess && netWorth > 10000 && totalAssets > 0) {
    const hasGoodCashflow = metrics.monthlyCashFlow > 0;
    const hasPassiveIncome = (metrics.passiveIncome + metrics.monthlyAssetIncome) > 0;
    const lowDebtRatio = metrics.totalLiabilities / Math.max(metrics.totalAssets, 1) < 0.3;
    
    if (hasGoodCashflow && hasPassiveIncome && lowDebtRatio) {
      alerts.push({
        id: uuidv4(),
        type: 'success',
        category: 'general',
        titleKey: 'alerts.general.strongPosition.title',
        descriptionKey: 'alerts.general.strongPosition.description',
        priority: 1,
        actionType: 'navigate',
        actionData: { route: '/forecast' },
        actionLabelKey: 'alerts.general.strongPosition.action',
        calculatedValue: netWorth,
        metadata: { 
          financialHealth: 'excellent',
          nextStep: 'optimization'
        }
      });
    }
  }

  return alerts;
};
