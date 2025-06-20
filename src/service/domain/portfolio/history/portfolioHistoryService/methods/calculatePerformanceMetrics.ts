import { PerformanceMetrics, PortfolioHistoryPoint } from '../interfaces/IPortfolioHistoryService';
import Logger from '../../../../../shared/logging/Logger/logger';

/**
 * Calculates portfolio performance metrics from history points
 * Returns comprehensive performance data for display
 */
export function calculatePerformanceMetrics(
  historyPoints: PortfolioHistoryPoint[], 
  totalInvestment: number
): PerformanceMetrics {
  if (historyPoints.length === 0) {
    Logger.warn('No history points available for performance metrics calculation');
    return {
      totalReturn: 0,
      totalReturnPercentage: 0,
      startValue: 0,
      endValue: 0,
      peakValue: 0,
      lowestValue: 0
    };
  }

  Logger.infoService(
    `Calculating performance metrics from ${historyPoints.length} history points, total investment: €${totalInvestment.toFixed(2)}`
  );

  const startValue = historyPoints[0]?.value || 0;
  const endValue = historyPoints[historyPoints.length - 1]?.value || 0;
  
  // Filter out invalid values for peak/lowest calculations
  const values = historyPoints
    .map(p => p.value)
    .filter(v => isFinite(v) && v >= 0);
  
  if (values.length === 0) {
    Logger.error('No valid values found for performance metrics calculation');
    return {
      totalReturn: 0,
      totalReturnPercentage: 0,
      startValue: 0,
      endValue: 0,
      peakValue: 0,
      lowestValue: 0
    };
  }

  const peakValue = Math.max(...values);
  const lowestValue = Math.min(...values);
  const totalReturn = endValue - totalInvestment;
  const totalReturnPercentage = totalInvestment > 0 ? 
    ((endValue - totalInvestment) / totalInvestment) * 100 : 0;
  
  Logger.infoService(
    `Performance metrics: Total Return: €${totalReturn.toFixed(2)} (${totalReturnPercentage.toFixed(2)}%), Peak: €${peakValue.toFixed(2)}, Lowest: €${lowestValue.toFixed(2)}`
  );
  
  const metrics: PerformanceMetrics = {
    totalReturn,
    totalReturnPercentage,
    startValue,
    endValue,
    peakValue: isFinite(peakValue) ? peakValue : 0,
    lowestValue: isFinite(lowestValue) ? lowestValue : 0
  };

  return metrics;
}
