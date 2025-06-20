import { 
  FinancialMetrics, 
  UIAlert, 
  FinancialAlert, 
  AlertGenerationOptions 
} from '@/types/domains/analytics/reporting';

export interface IBaseAlertsService {
  generateFinancialAlerts: (
    metrics: FinancialMetrics, 
    options?: AlertGenerationOptions
  ) => FinancialAlert[];
  
  calculateAlertPriority: (alert: FinancialAlert, metrics: FinancialMetrics) => number;
  
  filterAlertsByType: (
    alerts: FinancialAlert[], 
    type?: FinancialAlert['type']
  ) => FinancialAlert[];
}

export interface IAlertsService extends IBaseAlertsService {
  transformToUIAlerts: (
    financialAlerts: FinancialAlert[],
    t: (key: string) => string,
    navigate: (route: string) => void
  ) => UIAlert[];
}
