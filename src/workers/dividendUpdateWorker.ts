import { AssetDefinition } from '@/types/domains/assets';

// Result for individual dividend update
interface DividendUpdateResult {
  symbol: string;
  success: boolean;
  updatedDefinition?: AssetDefinition;
  dividendCount?: number;
  error?: string;
}

// Message types for communication with main thread
type WorkerRequest =
  | { type: 'updateBatch', definitions: AssetDefinition[], options?: { interval?: string; range?: string }, apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateSingle', definition: AssetDefinition, options?: { interval?: string; range?: string }, apiKeys: Record<string, string | undefined>, selectedProvider: string };

type WorkerResponse =
  | { type: 'batchResult', results: DividendUpdateResult[] }
  | { type: 'singleResult', result: DividendUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// Nutzt Dividenden-APIs direkt mit API-Keys und Provider (Worker-kompatibel)

async function updateBatchDividends(
  definitions: AssetDefinition[],
  options: { interval: string; range: string },
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<DividendUpdateResult[]> {
  try {
    // Import dividend providers directly (Worker-kompatibel, ohne Redux)
    const { dividendProviders } = await import('@/service/domain/assets/market-data/dividendAPIService/methods/dividendProviders');
    
    // Filter only definitions with tickers
    const stockDefinitions = definitions.filter(def => 
      def.type === 'stock' && def.ticker
    );
    
    // Verwende Promise.allSettled statt for-Schleife, um sicherzustellen, dass alle Requests verarbeitet werden
    const settledResults = await Promise.allSettled(
      stockDefinitions.map(async (definition): Promise<DividendUpdateResult> => {
        try {
          // Get provider and API key
          const provider = selectedProvider === 'finnhub' ? 'finnhub' : 'yahoo';
          const apiKey = apiKeys[provider] || '';
          
          // Get provider function
          const providerFn = dividendProviders[provider];
          if (!providerFn) {
            return {
              symbol: definition.ticker!,
              success: false,
              error: `No provider implementation for ${provider}`
            };
          }
          
          // Fetch dividends using provider
          const response = await providerFn(definition.ticker!, {
            apiKey,
            interval: options.interval,
            range: options.range
          });
          
          if (response?.dividends && Array.isArray(response.dividends)) {
            // Parse dividends to internal format
            const dividendHistory = response.dividends.map((div: { date?: string; lastDividendDate?: string; amount?: number }) => ({
              date: div.date || div.lastDividendDate || new Date().toISOString(),
              amount: div.amount || 0,
              source: 'api' as const,
              currency: definition.currency || 'USD'
            })).filter((entry: { amount: number }) => entry.amount > 0);
            
            // Calculate additional dividend info
            const lastDividend = dividendHistory.length > 0 ? dividendHistory[dividendHistory.length - 1] : undefined;
            
            const updatedDefinition = {
              ...definition,
              dividendHistory,
              dividendInfo: lastDividend ? {
                amount: lastDividend.amount,
                frequency: 'quarterly' as const,
                lastDividendDate: lastDividend.date,
                paymentMonths: []
              } : undefined,
              updatedAt: new Date().toISOString()
            };
            
            return {
              symbol: definition.ticker!,
              success: true,
              updatedDefinition,
              dividendCount: dividendHistory.length
            };
          } else {
            return {
              symbol: definition.ticker!,
              success: false,
              error: 'No dividend data received from API'
            };
          }
        } catch (error) {
          return {
            symbol: definition.ticker!,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );
    
    // Extrahiere Ergebnisse aus Promise.allSettled
    const results: DividendUpdateResult[] = settledResults.map(settledResult => {
      if (settledResult.status === 'fulfilled') {
        return settledResult.value;
      } else {
        // Falls die Promise selbst fehlschlägt, erstelle einen Fehler-Eintrag
        return {
          symbol: 'unknown',
          success: false,
          error: settledResult.reason instanceof Error ? settledResult.reason.message : String(settledResult.reason)
        };
      }
    });
    
    return results;
  } catch (error) {
    return [{ symbol: '', success: false, error: error instanceof Error ? error.message : String(error) }];
  }
}

async function updateSingleDividend(
  definition: AssetDefinition,
  options: { interval: string; range: string },
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<DividendUpdateResult> {
  try {
    const results = await updateBatchDividends([definition], options, apiKeys, selectedProvider);
    return results[0] || { symbol: definition.ticker || definition.name || 'unknown', success: false, error: 'No result' };
  } catch (error) {
    return { 
      symbol: definition.ticker || definition.name || 'unknown', 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}



// --- Worker Event Handling ---
self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'updateBatch') {
    const options = {
      interval: e.data.options?.interval ?? '1d',
      range: e.data.options?.range ?? '2y',
    };
    updateBatchDividends(e.data.definitions, options, e.data.apiKeys, e.data.selectedProvider).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch((error: unknown) => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateSingle') {
    const options = {
      interval: e.data.options?.interval ?? '1d',
      range: e.data.options?.range ?? '2y',
    };
    updateSingleDividend(e.data.definition, options, e.data.apiKeys, e.data.selectedProvider).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
      self.postMessage(response);
    }).catch((error: unknown) => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};