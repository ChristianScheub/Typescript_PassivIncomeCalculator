import { FinancialMetrics, FinancialAlert } from '../interfaces/IAlertsService';
import { v4 as uuidv4 } from '../../../utils/uuid';

export const generateDebtAlerts = (metrics: FinancialMetrics): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const { totalAssets, totalLiabilities, monthlyIncome, monthlyAssetIncome, monthlyLiabilityPayments } = metrics;
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;

  // 1. High Debt-to-Asset Ratio
  if (totalAssets > 0) {
    const debtToAssetRatio = totalLiabilities / totalAssets;
    
    if (debtToAssetRatio > 0.4) {
      alerts.push({
        id: uuidv4(),
        type: debtToAssetRatio > 0.7 ? 'critical' : 'warning',
        category: 'debt',
        titleKey: 'alerts.debt.highRatio.title',
        descriptionKey: 'alerts.debt.highRatio.description',
        priority: debtToAssetRatio > 0.7 ? 9 : 7,
        actionType: 'navigate',
        actionData: { route: '/liabilities' },
        actionLabelKey: 'alerts.debt.highRatio.action',
        calculatedValue: debtToAssetRatio * 100,
        thresholds: { warning: 40, critical: 70 },
        metadata: { healthyRatio: 30 }
      });
    }
  }

  // 2. High Debt Service Ratio (debt payments vs income)
  if (totalMonthlyIncome > 0) {
    const debtServiceRatio = monthlyLiabilityPayments / totalMonthlyIncome;
    
    if (debtServiceRatio > 0.3) {
      alerts.push({
        id: uuidv4(),
        type: debtServiceRatio > 0.5 ? 'critical' : 'warning',
        category: 'debt',
        titleKey: 'alerts.debt.highServiceRatio.title',
        descriptionKey: 'alerts.debt.highServiceRatio.description',
        priority: debtServiceRatio > 0.5 ? 8 : 6,
        actionType: 'navigate',
        actionData: { route: '/liabilities' },
        actionLabelKey: 'alerts.debt.highServiceRatio.action',
        calculatedValue: debtServiceRatio * 100,
        thresholds: { warning: 30, critical: 50 },
        metadata: { recommendedMax: 25 }
      });
    }
  }

  // 3. Substantial Debt Without Assets
  if (totalLiabilities > 5000 && totalAssets < totalLiabilities * 0.5) {
    alerts.push({
      id: uuidv4(),
      type: 'warning',
      category: 'debt',
      titleKey: 'alerts.debt.lowAssetCoverage.title',
      descriptionKey: 'alerts.debt.lowAssetCoverage.description',
      priority: 6,
      actionType: 'navigate',
      actionData: { route: '/assets' },
      actionLabelKey: 'alerts.debt.lowAssetCoverage.action',
      calculatedValue: totalAssets / totalLiabilities * 100,
      metadata: { debtAmount: totalLiabilities, assetAmount: totalAssets }
    });
  }

  return alerts;
};
