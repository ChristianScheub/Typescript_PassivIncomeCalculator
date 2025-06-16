import { FinancialMetrics, FinancialAlert, AlertGenerationOptions } from '../interfaces/IAlertsService';
import { v4 as uuidv4 } from '../../../utils/uuid';
import { generateCashflowAlerts } from './generateCashflowAlerts';
import { generateDebtAlerts } from './generateDebtAlerts';
import { generatePassiveIncomeAlerts } from './generatePassiveIncomeAlerts';
import { generateSavingsAlerts } from './generateSavingsAlerts';
import { generateEmergencyFundAlerts } from './generateEmergencyFundAlerts';
import { generateGeneralAlerts } from './generateGeneralAlerts';

export const generateFinancialAlerts = (
  metrics: FinancialMetrics,
  options: AlertGenerationOptions = {}
): FinancialAlert[] => {
  const {
    maxAlerts = 3,
    includeSuccess = true,
    priorityThreshold = 1,
    excludeCategories = []
  } = options;

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
