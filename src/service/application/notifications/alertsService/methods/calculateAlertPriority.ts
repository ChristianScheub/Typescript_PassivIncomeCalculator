import { FinancialAlert, FinancialMetrics } from '../interfaces/IAlertsService';

interface PriorityAdjustmentConfig {
  criticalThreshold: number;
  warningThreshold: number;
  isLowerWorse: boolean;
}

const getCategoryConfig = (category: string): PriorityAdjustmentConfig | null => {
  const configs: Record<string, PriorityAdjustmentConfig> = {
    cashflow: { criticalThreshold: -1000, warningThreshold: 0, isLowerWorse: true },
    debt: { criticalThreshold: 80, warningThreshold: 50, isLowerWorse: false },
    passive_income: { criticalThreshold: 5, warningThreshold: 10, isLowerWorse: true }
  };
  
  return configs[category] || null;
};

const calculatePriorityAdjustment = (
  calculatedValue: number,
  thresholds: { critical?: number; warning?: number },
  config: PriorityAdjustmentConfig
): number => {
  const criticalThreshold = thresholds.critical || config.criticalThreshold;
  const warningThreshold = thresholds.warning || config.warningThreshold;
  
  if (config.isLowerWorse) {
    if (calculatedValue < criticalThreshold) return 2;
    if (calculatedValue < warningThreshold) return 1;
  } else {
    if (calculatedValue > criticalThreshold) return 2;
    if (calculatedValue > warningThreshold) return 1;
  }
  
  return 0;
};

export const calculateAlertPriority = (
  alert: FinancialAlert, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _metrics: FinancialMetrics
): number => {
  let priority = alert.priority;

  if (alert.calculatedValue === undefined || !alert.thresholds) {
    return Math.max(1, Math.min(10, priority));
  }

  // Skip priority adjustment for success alerts
  if (alert.type === 'success') {
    return Math.max(1, Math.min(10, priority));
  }

  const config = getCategoryConfig(alert.category);
  if (config) {
    const adjustment = calculatePriorityAdjustment(
      alert.calculatedValue,
      alert.thresholds,
      config
    );
    priority += adjustment;
  }

  return Math.max(1, Math.min(10, priority));
};
