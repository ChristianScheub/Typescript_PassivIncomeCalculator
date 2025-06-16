import { FinancialAlert, FinancialMetrics } from '../interfaces/IAlertsService';

export const calculateAlertPriority = (
  alert: FinancialAlert, 
  metrics: FinancialMetrics
): number => {
  let priority = alert.priority;

  // Adjust priority based on severity of the calculated value
  if (alert.calculatedValue !== undefined && alert.thresholds) {
    const { calculatedValue, thresholds } = alert;
    
    // For negative values (like cash flow), lower is worse
    if (alert.category === 'cashflow' && alert.type !== 'success') {
      if (calculatedValue < (thresholds.critical || -1000)) {
        priority += 2;
      } else if (calculatedValue < (thresholds.warning || 0)) {
        priority += 1;
      }
    }
    
    // For ratio values (like debt ratio), higher is worse
    if (alert.category === 'debt') {
      if (calculatedValue > (thresholds.critical || 80)) {
        priority += 2;
      } else if (calculatedValue > (thresholds.warning || 50)) {
        priority += 1;
      }
    }
    
    // For passive income ratio, lower is worse
    if (alert.category === 'passive_income') {
      if (calculatedValue < (thresholds.critical || 5)) {
        priority += 2;
      } else if (calculatedValue < (thresholds.warning || 10)) {
        priority += 1;
      }
    }
  }

  // Ensure priority stays within bounds (1-10)
  return Math.max(1, Math.min(10, priority));
};
