import { AssetDefinition, Transaction as Asset } from '@/types/domains/assets';
import { PortfolioPosition } from '@/types/domains/portfolio';
import { PortfolioIntradayPoint } from '@/service/infrastructure/sqlLitePortfolioHistory';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';
import { calculatePortfolioHistory, calculatePortfolioIntraday } from '@/service/domain/portfolio/history/portfolioHistoryService';

// Typen für Nachrichten
interface CalculatePortfolioHistoryParams {
  assetDefinitions: AssetDefinition[];
  portfolioPositions: PortfolioPosition[];
}

type WorkerRequest =
  | { type: 'calculateAll', params: CalculatePortfolioHistoryParams }
  | { type: 'calculateIntraday', params: CalculatePortfolioHistoryParams }
  | { type: 'calculateHistory', params: CalculatePortfolioHistoryParams };

type WorkerResponse =
  | { type: 'resultAll', intraday: PortfolioIntradayPoint[]; history: PortfolioHistoryPoint[] }
  | { type: 'resultIntraday', data: PortfolioIntradayPoint[] }
  | { type: 'resultHistory', data: PortfolioHistoryPoint[] }
  | { type: 'error', error: string };

// --- Berechnungsfunktionen ---
// All calculation logic is imported from the domain layer (portfolioHistoryService).
// This worker only orchestrates and delegates to domain logic.
// Persistence (saving to IndexedDB) must be handled in the main thread after receiving results from the worker.

// Helper: Convert PortfolioPosition[] to Asset[] for domain calculation
function flattenPortfolioPositionsToAssets(portfolioPositions: PortfolioPosition[]): Asset[] {
  return portfolioPositions.flatMap(pos => pos.transactions);
}

// --- Worker Event Handling ---

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  try {
    if (e.data.type === 'calculateAll') {
      // Always calculate both intraday and daily history and return both
      const assets = flattenPortfolioPositionsToAssets(e.data.params.portfolioPositions);
      const intraday = calculatePortfolioIntraday(e.data.params.assetDefinitions, e.data.params.portfolioPositions);
      const history = calculatePortfolioHistory(assets, e.data.params.assetDefinitions);
      const response: WorkerResponse = { type: 'resultAll', intraday, history };
      // @ts-ignore
      self.postMessage(response);
    } else if (e.data.type === 'calculateIntraday') {
      const data = calculatePortfolioIntraday(e.data.params.assetDefinitions, e.data.params.portfolioPositions);
      const response: WorkerResponse = { type: 'resultIntraday', data };
      // @ts-ignore
      self.postMessage(response);
    } else if (e.data.type === 'calculateHistory') {
      const assets = flattenPortfolioPositionsToAssets(e.data.params.portfolioPositions);
      const data = calculatePortfolioHistory(assets, e.data.params.assetDefinitions);
      const response: WorkerResponse = { type: 'resultHistory', data };
      // @ts-ignore
      self.postMessage(response);
    }
  } catch (err: any) {
    // @ts-ignore
    self.postMessage({ type: 'error', error: err?.message || String(err) });
  }
};
