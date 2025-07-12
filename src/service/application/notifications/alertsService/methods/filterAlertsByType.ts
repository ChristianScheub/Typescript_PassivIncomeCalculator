import type { FinancialAlert } from '@/types/domains/analytics/reporting';

export const filterAlertsByType = (
  alerts: FinancialAlert[],
  type?: FinancialAlert['type']
): FinancialAlert[] => {
  if (!type) {
    return alerts;
  }
  
  return alerts.filter(alert => alert.type === type);
};
