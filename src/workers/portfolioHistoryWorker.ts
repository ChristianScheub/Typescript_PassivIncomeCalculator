import { AssetDefinition, Transaction as Asset } from '@/types/domains/assets';
import { PortfolioPosition } from '@/types/domains/portfolio';
import { PortfolioIntradayPoint } from '@/service/infrastructure/sqlLitePortfolioHistory';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';
import portfolioHistoryService from '@/service/domain/portfolio/history/portfolioHistoryService';

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
  console.log('🔧 WORKER: Received message', e.data.type);
  console.log('🔧 WORKER: AssetDefinitions count:', e.data.params.assetDefinitions?.length || 0);
  console.log('🔧 WORKER: PortfolioPositions count:', e.data.params.portfolioPositions?.length || 0);
  
  try {
    if (e.data.type === 'calculateAll') {
      console.log('🔧 WORKER: Starting calculateAll');
      // Always calculate both intraday and daily history and return both
      const assets = flattenPortfolioPositionsToAssets(e.data.params.portfolioPositions);
      console.log('🔧 WORKER: Flattened assets count:', assets.length);
      
      console.log('🔧 WORKER: Calling calculatePortfolioIntraday...');
      const intraday = portfolioHistoryService.calculatePortfolioIntraday(e.data.params.assetDefinitions, e.data.params.portfolioPositions);
      console.log('🔧 WORKER: calculatePortfolioIntraday result:', intraday.length, 'points');
      
      console.log('🔧 WORKER: Calling calculatePortfolioHistory...');
      const history = portfolioHistoryService.calculatePortfolioHistory(assets, e.data.params.assetDefinitions);
      console.log('🔧 WORKER: calculatePortfolioHistory result:', history.length, 'points');
      
      const response: WorkerResponse = { type: 'resultAll', intraday, history };
      console.log('🔧 WORKER: Sending response with intraday:', intraday.length, 'history:', history.length);
      self.postMessage(response);
    } else if (e.data.type === 'calculateIntraday') {
      console.log('🔧 WORKER: Starting calculateIntraday');
      const data = portfolioHistoryService.calculatePortfolioIntraday(e.data.params.assetDefinitions, e.data.params.portfolioPositions);
      console.log('🔧 WORKER: calculateIntraday result:', data.length, 'points');
      const response: WorkerResponse = { type: 'resultIntraday', data };
      self.postMessage(response);
    } else if (e.data.type === 'calculateHistory') {
      console.log('🔧 WORKER: Starting calculateHistory');
      const assets = flattenPortfolioPositionsToAssets(e.data.params.portfolioPositions);
      const data = portfolioHistoryService.calculatePortfolioHistory(assets, e.data.params.assetDefinitions);
      console.log('🔧 WORKER: calculateHistory result:', data.length, 'points');
      const response: WorkerResponse = { type: 'resultHistory', data };
      self.postMessage(response);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('🔧 WORKER ERROR:', errorMessage);
    console.error('🔧 WORKER ERROR STACK:', err instanceof Error ? err.stack : 'No stack');
    self.postMessage({ type: 'error', error: errorMessage });
  }
};
