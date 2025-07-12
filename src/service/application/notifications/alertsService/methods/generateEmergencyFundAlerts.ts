import type { FinancialMetrics, FinancialAlert } from '@/types/domains/analytics/reporting';
import { v4 as uuidv4 } from '@/utils/uuid';

export const generateEmergencyFundAlerts = (metrics: FinancialMetrics): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];
  const { totalAssets, monthlyExpenses, monthlyLiabilityPayments } = metrics;
  const totalMonthlyExpenses = monthlyExpenses + monthlyLiabilityPayments;
  
  // Assuming liquid assets are roughly 60% of total assets (conservative estimate)
  const estimatedLiquidAssets = totalAssets * 0.6;

  // 1. Insufficient Emergency Fund
  if (totalMonthlyExpenses > 0 && estimatedLiquidAssets > 0) {
    const monthsCovered = estimatedLiquidAssets / totalMonthlyExpenses;
    
    if (monthsCovered < 3) {
      alerts.push({
        id: uuidv4(),
        type: monthsCovered < 1 ? 'warning' : 'info',
        category: 'emergency_fund',
        titleKey: 'alerts.emergencyFund.insufficient.title',
        descriptionKey: 'alerts.emergencyFund.insufficient.description',
        priority: monthsCovered < 1 ? 7 : 5,
        actionType: 'navigate',
        actionData: { route: '/forecast' },
        actionLabelKey: 'alerts.emergencyFund.insufficient.action',
        calculatedValue: monthsCovered,
        thresholds: { warning: 3, critical: 1 },
        metadata: { 
          targetAmount: totalMonthlyExpenses * 6,
          currentAmount: estimatedLiquidAssets,
          shortfall: (totalMonthlyExpenses * 3) - estimatedLiquidAssets
        }
      });
    }
  }

  // 2. Excellent Emergency Fund
  if (totalMonthlyExpenses > 0 && estimatedLiquidAssets > 0) {
    const monthsCovered = estimatedLiquidAssets / totalMonthlyExpenses;
    
    if (monthsCovered >= 6 && monthsCovered < 12) {
      alerts.push({
        id: uuidv4(),
        type: 'success',
        category: 'emergency_fund',
        titleKey: 'alerts.emergencyFund.excellent.title',
        descriptionKey: 'alerts.emergencyFund.excellent.description',
        priority: 2,
        actionType: 'navigate',
        actionData: { route: '/assets' },
        actionLabelKey: 'alerts.emergencyFund.excellent.action',
        calculatedValue: monthsCovered,
        metadata: { readyForInvesting: true }
      });
    }
  }

  return alerts;
};
