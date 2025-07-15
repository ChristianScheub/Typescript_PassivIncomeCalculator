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

  const alerts: FinancialAlert[] = [];

  // Generate alerts by category
  alerts.push(...generateCashflowAlerts(metrics));
  alerts.push(...generateDebtAlerts(metrics));
  alerts.push(...generatePassiveIncomeAlerts(metrics));
  alerts.push(...generateSavingsAlerts(metrics));
  alerts.push(...generateEmergencyFundAlerts(metrics));
  alerts.push(...generateGeneralAlerts(metrics, includeSuccess));

  // Filter by priority threshold and sort by priority (highest first)
  const filteredAlerts = alerts
    .filter(alert => alert.priority >= priorityThreshold)
    .sort((a, b) => b.priority - a.priority);

  // Limit to maxAlerts
  return filteredAlerts.slice(0, maxAlerts);
};
