import type { PerformanceMetrics, PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';
import Logger from "@/service/shared/logging/Logger/logger";

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
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      averageGain: 0,
      averageLoss: 0
    };
  }

  Logger.infoService(
    `Calculating performance metrics from ${historyPoints.length} history points, total investment: ${totalInvestment.toFixed(2)}`
  );

  const endValue = historyPoints[historyPoints.length - 1]?.totalValue || 0;
  
  // Filter out invalid values for peak/lowest calculations
  const values = historyPoints
    .map(p => p.totalValue)
    .filter(v => isFinite(v) && v >= 0);
  
  if (values.length === 0) {
    Logger.error('No valid values found for performance metrics calculation');
    return {
      totalReturn: 0,
      totalReturnPercentage: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      averageGain: 0,
      averageLoss: 0
    };
  }

  const peakValue = Math.max(...values);
  const lowestValue = Math.min(...values);
  const totalReturn = endValue - totalInvestment;
  const totalReturnPercentage = totalInvestment > 0 ? 
    ((endValue - totalInvestment) / totalInvestment) * 100 : 0;
  
  Logger.infoService(
    `Performance metrics: Total Return: ${totalReturn.toFixed(2)} (${totalReturnPercentage.toFixed(2)}%), Peak: ${peakValue.toFixed(2)}, Lowest: ${lowestValue.toFixed(2)}`
  );
  
  const metrics: PerformanceMetrics = {
    totalReturn,
    totalReturnPercentage,
    annualizedReturn: 0, // TODO: implement
    volatility: 0, // TODO: implement
    sharpeRatio: 0, // TODO: implement
    maxDrawdown: 0, // TODO: implement
    winRate: 0, // TODO: implement
    averageGain: 0, // TODO: implement
    averageLoss: 0 // TODO: implement
  };

  return metrics;
}
