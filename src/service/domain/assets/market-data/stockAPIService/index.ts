import { getCurrentStockPrice } from './methods/getCurrentStockPrice';
import { getHistory } from './methods/getHistory';
import { getHistory30Days } from './methods/getHistory30Days';
import { getIntradayHistory } from './methods/getIntradayHistory';

export const stockAPIService = {
  getCurrentStockPrice,
  getHistory,
  getHistory30Days,
  getIntradayHistory,
};

export default stockAPIService;
