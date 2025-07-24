
import { updateBatchDividends } from './methods/updateBatchDividends';
import { updateBatchHistoryData } from './methods/updateBatchHistoryData';
import { updateBatchCurrentPrices } from './methods/updateBatchCurrentPrices';


export const batchAssetUpdateService = {
  updateBatchDividends,
  updateBatchHistoryData,
  updateBatchCurrentPrices,
};

export default batchAssetUpdateService;
