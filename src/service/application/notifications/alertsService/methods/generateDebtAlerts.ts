import { FinancialMetrics, FinancialAlert } from '../interfaces/IAlertsService';
import { v4 as uuidv4 } from '../../../../../utils/uuid';

const createHighDebtRatioAlert = (debtToAssetRatio: number): FinancialAlert => {
  const isCritical = debtToAssetRatio > 0.7;
  
  return {
    id: uuidv4(),
    type: isCritical ? 'critical' : 'warning',
    category: 'debt',
    titleKey: 'alerts.debt.highRatio.title',
    descriptionKey: 'alerts.debt.highRatio.description',
    priority: isCritical ? 9 : 7,
    actionType: 'navigate',
    actionData: { route: '/liabilities' },
    actionLabelKey: 'alerts.debt.highRatio.action',
    calculatedValue: debtToAssetRatio * 100,
    thresholds: { warning: 40, critical: 70 },
    metadata: { healthyRatio: 30 }
  };
};

const createHighServiceRatioAlert = (debtServiceRatio: number): FinancialAlert => {
  const isCritical = debtServiceRatio > 0.5;
  
  return {
    id: uuidv4(),
    type: isCritical ? 'critical' : 'warning',
    category: 'debt',
    titleKey: 'alerts.debt.highServiceRatio.title',
    descriptionKey: 'alerts.debt.highServiceRatio.description',
    priority: isCritical ? 8 : 6,
    actionType: 'navigate',
    actionData: { route: '/liabilities' },
    actionLabelKey: 'alerts.debt.highServiceRatio.action',
    calculatedValue: debtServiceRatio * 100,
    thresholds: { warning: 30, critical: 50 },
    metadata: { recommendedMax: 25 }
  };
};

const createLowAssetCoverageAlert = (totalAssets: number, totalLiabilities: number): FinancialAlert => {
  return {
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
  };
};

export const generateDebtAlerts = (metrics: FinancialMetrics): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const { totalAssets, totalLiabilities, monthlyIncome, monthlyAssetIncome, monthlyLiabilityPayments } = metrics;
  const totalMonthlyIncome = monthlyIncome + monthlyAssetIncome;

  // 1. High Debt-to-Asset Ratio
  if (totalAssets > 0) {
    const debtToAssetRatio = totalLiabilities / totalAssets;
    if (debtToAssetRatio > 0.4) {
      alerts.push(createHighDebtRatioAlert(debtToAssetRatio));
    }
  }

  // 2. High Debt Service Ratio
  if (totalMonthlyIncome > 0) {
    const debtServiceRatio = monthlyLiabilityPayments / totalMonthlyIncome;
    if (debtServiceRatio > 0.3) {
      alerts.push(createHighServiceRatioAlert(debtServiceRatio));
    }
  }

  // 3. Low Asset Coverage for Debt
  if (totalLiabilities > 5000 && totalAssets < totalLiabilities * 0.5) {
    alerts.push(createLowAssetCoverageAlert(totalAssets, totalLiabilities));
  }

  return alerts;
};
