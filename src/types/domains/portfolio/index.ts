/**
 * Portfolio domain types (konsolidiert, keine Legacy- oder Kompatibilitäts-Exporte mehr)
 */

export * from './allocations';
// Exportiere nur die Service-spezifischen Typen aus history.ts, nicht die Konflikt-Typen
export type {
  PortfolioHistoryDay,
  PortfolioTransaction,
  PortfolioHistoryCache,
  PortfolioServiceTransaction,
  ServiceAssetPosition,
  ServicePortfolioHistoryPoint,
  TimeRange
} from './history';
// Exportiere die zentralen Typen explizit aus performance.ts
export type {
  PerformanceMetrics,
  ChartDataPoint,
  PortfolioHistoryPoint,
  AssetPosition
} from './performance';
export * from './cache';
// Legacy- und Kompatibilitäts-Exporte entfernt (nur noch konsolidierte Typen!)
