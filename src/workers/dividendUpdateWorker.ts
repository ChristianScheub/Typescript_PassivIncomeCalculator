import { AssetDefinition } from '@/types/domains/assets';
import { batchAssetUpdateService } from '@/service/domain/assets/market-data/batchAssetUpdateService';


// Message types for communication with main thread
type WorkerRequest =
  | { type: 'updateBatch', definitions: AssetDefinition[], options?: { interval?: string; range?: string } }
  | { type: 'updateSingle', definition: AssetDefinition, options?: { interval?: string; range?: string } };



// --- Worker Event Handling ---
self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'updateBatch') {
    const options = {
      interval: e.data.options?.interval ?? '1d',
      range: e.data.options?.range ?? '2y',
    };
    batchAssetUpdateService.updateBatchDividends(e.data.definitions, options).then(res => {
      self.postMessage({ type: 'batchResult', results: res.results });
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateSingle') {
    const options = {
      interval: e.data.options?.interval ?? '1d',
      range: e.data.options?.range ?? '2y',
    };
    const definition = e.data.definition;
    batchAssetUpdateService.updateBatchDividends([definition], options).then(res => {
      const result = Array.isArray(res.results) && res.results.length > 0 ? res.results[0] : { success: false, symbol: definition?.ticker, error: 'No result' };
      self.postMessage({ type: 'singleResult', result });
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};