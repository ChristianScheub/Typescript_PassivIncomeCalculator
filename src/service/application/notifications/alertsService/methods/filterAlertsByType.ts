import { FinancialAlert } from '../interfaces/IAlertsService';

export const filterAlertsByType = (
  alerts: FinancialAlert[],
  type?: FinancialAlert['type']
): FinancialAlert[] => {
  if (!type) {
    return alerts;
  }
  
  return alerts.filter(alert => alert.type === type);
};
