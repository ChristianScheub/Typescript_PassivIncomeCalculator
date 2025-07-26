/**
 * Worker Service for managing Web Worker operations
 * Provides a convenient interface for containers to use the new workers
 */

import { AssetDefinition } from '@/types/domains/assets';
import { TimeRangePeriod } from '@/types/shared/time';

// Import workers using Vite's worker syntax
import StockPriceWorker from '@/workers/stockPriceUpdateWorker.ts?worker';
import StockHistoryWorker from '@/workers/stockHistoryUpdateWorker.ts?worker';
import DividendWorker from '@/workers/dividendUpdateWorker.ts?worker';

// Union type alias for worker response types
type WorkerResponseType = 'batchResult' | 'singleResult' | 'error';

// Worker wrapper class for type-safe communication
export class WorkerService<RequestType, ResponseType> {
  private worker: Worker | null = null;
  private readonly createWorker: () => Worker;

  constructor(createWorker: () => Worker) {
    this.createWorker = createWorker;
  }

  private initWorker(): Promise<Worker> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.worker) {
          this.worker = this.createWorker();
        }
        resolve(this.worker);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async sendMessage(message: RequestType): Promise<ResponseType> {
    const worker = await this.initWorker();
    
    return new Promise((resolve, reject) => {
      const handleMessage = (e: MessageEvent<ResponseType>) => {
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        resolve(e.data);
      };

      const handleError = (error: ErrorEvent) => {
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        reject(new Error(`Worker error: ${error.message}`));
      };

      worker.addEventListener('message', handleMessage);
      worker.addEventListener('error', handleError);
      worker.postMessage(message);
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Stock Price Update Worker Service
interface StockPriceUpdateRequest {
  type: 'updateBatch' | 'updateSingle';
  definitions?: AssetDefinition[];
  definition?: AssetDefinition;
  apiKeys: Record<string, string | undefined>; // z.B. { FINNHUB: '...', YAHOO: '...', ... }
  selectedProvider: string;
}

interface StockPriceUpdateResponse {
  type: WorkerResponseType;
  results?: Array<{
    symbol: string;
    success: boolean;
    updatedDefinition?: AssetDefinition;
    error?: string;
  }>;
  result?: {
    symbol: string;
    success: boolean;
    updatedDefinition?: AssetDefinition;
    error?: string;
  };
  error?: string;
}

export class StockPriceWorkerService {
  private readonly workerService: WorkerService<StockPriceUpdateRequest, StockPriceUpdateResponse>;

  constructor() {
    this.workerService = new WorkerService<StockPriceUpdateRequest, StockPriceUpdateResponse>(
      () => new StockPriceWorker()
    );
  }

  async updateBatch(definitions: AssetDefinition[], apiKeys: Record<string, string | undefined>, selectedProvider: string): Promise<StockPriceUpdateResponse> {
    return this.workerService.sendMessage({
      type: 'updateBatch',
      definitions,
      apiKeys,
      selectedProvider
    });
  }

  async updateSingle(definition: AssetDefinition, apiKeys: Record<string, string | undefined>, selectedProvider: string): Promise<StockPriceUpdateResponse> {
    return this.workerService.sendMessage({
      type: 'updateSingle',
      definition,
      apiKeys,
      selectedProvider
    });
  }

  terminate() {
    this.workerService.terminate();
  }
}

// Stock History Update Worker Service
interface StockHistoryUpdateRequest {
  type: 'updateBatch' | 'updateSingle' | 'updateBatchDefault' | 'updateSingleDefault' | 'updateBatchIntraday' | 'updateSingleIntraday';
  definitions?: AssetDefinition[];
  definition?: AssetDefinition;
  period?: TimeRangePeriod;
  days?: number;
  apiKeys?: Record<string, string | undefined>;
  selectedProvider?: string;
}

interface StockHistoryUpdateResponse {
  type: WorkerResponseType;
  results?: Array<{
    symbol: string;
    success: boolean;
    updatedDefinition?: AssetDefinition;
    entriesCount?: number;
    error?: string;
  }>;
  result?: {
    symbol: string;
    success: boolean;
    updatedDefinition?: AssetDefinition;
    entriesCount?: number;
    error?: string;
  };
  error?: string;
}

export class StockHistoryWorkerService {
  private readonly workerService: WorkerService<StockHistoryUpdateRequest, StockHistoryUpdateResponse>;

  constructor() {
    this.workerService = new WorkerService<StockHistoryUpdateRequest, StockHistoryUpdateResponse>(
      () => new StockHistoryWorker()
    );
  }

  async updateBatch(definitions: AssetDefinition[], period?: TimeRangePeriod, apiKeys?: Record<string, string | undefined>, selectedProvider?: string): Promise<StockHistoryUpdateResponse> {
    return this.workerService.sendMessage({
      type: period ? 'updateBatch' : 'updateBatchDefault',
      definitions,
      period,
      apiKeys,
      selectedProvider
    });
  }

  async updateSingle(definition: AssetDefinition, period?: TimeRangePeriod, apiKeys?: Record<string, string | undefined>, selectedProvider?: string): Promise<StockHistoryUpdateResponse> {
    return this.workerService.sendMessage({
      type: period ? 'updateSingle' : 'updateSingleDefault',
      definition,
      period,
      apiKeys,
      selectedProvider
    });
  }

  async updateBatchIntraday(definitions: AssetDefinition[], days?: number, apiKeys?: Record<string, string | undefined>, selectedProvider?: string): Promise<StockHistoryUpdateResponse> {
    return this.workerService.sendMessage({
      type: 'updateBatchIntraday',
      definitions,
      days,
      apiKeys,
      selectedProvider
    });
  }

  async updateSingleIntraday(definition: AssetDefinition, days?: number, apiKeys?: Record<string, string | undefined>, selectedProvider?: string): Promise<StockHistoryUpdateResponse> {
    return this.workerService.sendMessage({
      type: 'updateSingleIntraday',
      definition,
      days,
      apiKeys,
      selectedProvider
    });
  }

  terminate() {
    this.workerService.terminate();
  }
}

// Dividend Update Worker Service
interface DividendUpdateRequest {
  type: 'updateBatch' | 'updateSingle';
  definitions?: AssetDefinition[];
  definition?: AssetDefinition;
  options?: {
    interval?: string;
    range?: string;
  };
  apiKeys: Record<string, string | undefined>;
  selectedProvider: string;
}

interface DividendUpdateResponse {
  type: WorkerResponseType;
  results?: Array<{
    symbol: string;
    success: boolean;
    updatedDefinition?: AssetDefinition;
    dividendCount?: number;
    error?: string;
  }>;
  result?: {
    symbol: string;
    success: boolean;
    updatedDefinition?: AssetDefinition;
    dividendCount?: number;
    error?: string;
  };
  error?: string;
}

export class DividendWorkerService {
  private readonly workerService: WorkerService<DividendUpdateRequest, DividendUpdateResponse>;

  constructor() {
    this.workerService = new WorkerService<DividendUpdateRequest, DividendUpdateResponse>(
      () => new DividendWorker()
    );
  }

  async updateBatch(definitions: AssetDefinition[], options?: { interval?: string; range?: string }, apiKeys?: Record<string, string | undefined>, selectedProvider?: string): Promise<DividendUpdateResponse> {
    return this.workerService.sendMessage({
      type: 'updateBatch',
      definitions,
      options,
      apiKeys: apiKeys || {},
      selectedProvider: selectedProvider || 'yahoo'
    });
  }

  async updateSingle(definition: AssetDefinition, options?: { interval?: string; range?: string }, apiKeys?: Record<string, string | undefined>, selectedProvider?: string): Promise<DividendUpdateResponse> {
    return this.workerService.sendMessage({
      type: 'updateSingle',
      definition,
      options,
      apiKeys: apiKeys || {},
      selectedProvider: selectedProvider || 'yahoo'
    });
  }

  terminate() {
    this.workerService.terminate();
  }
}

// Combined service for managing all workers
export class MarketDataWorkerService {
  public stockPrice: StockPriceWorkerService;
  public stockHistory: StockHistoryWorkerService;
  public dividend: DividendWorkerService;

  constructor() {
    this.stockPrice = new StockPriceWorkerService();
    this.stockHistory = new StockHistoryWorkerService();
    this.dividend = new DividendWorkerService();
  }

  terminateAll() {
    this.stockPrice.terminate();
    this.stockHistory.terminate();
    this.dividend.terminate();
  }
}

// Export singleton instance
export const marketDataWorkerService = new MarketDataWorkerService();