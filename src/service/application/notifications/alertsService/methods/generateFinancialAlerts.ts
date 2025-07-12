import type { FinancialMetrics, FinancialAlert } from '@/types/domains/analytics/reporting';
import { generateCashflowAlerts } from './generateCashflowAlerts';
import { generateDebtAlerts } from './generateDebtAlerts';
import { generatePassiveIncomeAlerts } from './generatePassiveIncomeAlerts';
import { generateSavingsAlerts } from './generateSavingsAlerts';
import { generateEmergencyFundAlerts } from './generateEmergencyFundAlerts';
import { generateGeneralAlerts } from './generateGeneralAlerts';

export const generateFinancialAlerts = (
  metrics: FinancialMetrics
): FinancialAlert[] => {
  // Use default options (could be made configurable elsewhere)
  const maxAlerts = 3;
  const includeSuccess = true;
  const priorityThreshold = 1;
  const excludeCategories: string[] = [];

  const alerts: FinancialAlert[] = [];

  // Generate alerts by category
  if (!excludeCategories.includes('cashflow')) {
    alerts.push(...generateCashflowAlerts(metrics));
  }

  if (!excludeCategories.includes('debt')) {
    alerts.push(...generateDebtAlerts(metrics));
  }

  if (!excludeCategories.includes('passive_income')) {
    alerts.push(...generatePassiveIncomeAlerts(metrics));
  }

  if (!excludeCategories.includes('savings')) {
    alerts.push(...generateSavingsAlerts(metrics));
  }

  if (!excludeCategories.includes('emergency_fund')) {
    alerts.push(...generateEmergencyFundAlerts(metrics));
  }

  if (!excludeCategories.includes('general')) {
    alerts.push(...generateGeneralAlerts(metrics, includeSuccess));
  }

  // Filter by priority threshold and sort by priority (highest first)
  const filteredAlerts = alerts
    .filter(alert => alert.priority >= priorityThreshold)
    .sort((a, b) => b.priority - a.priority);

  // Limit to maxAlerts
  return filteredAlerts.slice(0, maxAlerts);
};
