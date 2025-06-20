import { ChartDataPoint, PortfolioHistoryPoint } from '../interfaces/IPortfolioHistoryService';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * Formats portfolio history points for chart display
 * Adds formatted dates and transaction flags for UI consumption
 */
export function formatForChart(historyPoints: PortfolioHistoryPoint[]): ChartDataPoint[] {
  Logger.infoService(`Formatting ${historyPoints.length} history points for chart display`);
  
  if (historyPoints.length === 0) {
    Logger.warn('No history points to format for chart');
    return [];
  }

  const chartData = historyPoints.map(point => {
    const formattedDate = new Date(point.date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return {
      date: point.date,
      value: point.value,
      formattedDate,
      hasTransactions: point.transactions.length > 0,
      transactions: point.transactions
    };
  });

  Logger.infoService(
    `Formatted chart data: ${chartData.length} points, ${chartData.filter(p => p.hasTransactions).length} with transactions`
  );

  return chartData;
}
