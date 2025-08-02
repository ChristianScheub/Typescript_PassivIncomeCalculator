
import { updateBatchDividends } from './methods/updateBatchDividends';
import { updateBatchHistoryData } from './methods/updateBatchHistoryData';
import { updateBatchCurrentPrices } from './methods/updateBatchCurrentPrices';
import { updateBatchIntradayPrices } from './methods/updateBatchIntradayPrices';


export const batchAssetUpdateService = {
  updateBatchDividends,
  updateBatchHistoryData,
  updateBatchCurrentPrices,
  updateBatchIntradayPrices,
};

export default batchAssetUpdateService;
