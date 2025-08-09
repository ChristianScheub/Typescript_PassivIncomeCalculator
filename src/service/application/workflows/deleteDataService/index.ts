import { DeleteDataService } from './interfaces/IDeleteDataService';
import { clearAllData } from './methods/clearAllData';
import { clearAssetDefinitions } from './methods/clearAssetDefinitions';
import { clearAssetTransactions } from './methods/clearAssetTransactions';
import { clearDebts } from './methods/clearDebts';
import { clearExpenses } from './methods/clearExpenses';
import { clearIncome } from './methods/clearIncome';
import { clearPartialData } from './methods/clearPartialData';
import { clearPriceHistory } from './methods/clearPriceHistory';
import { clearPortfolioHistory } from './methods/clearPortfolioHistory';
import { refreshPortfolioHistory } from './methods/refreshPortfolioHistory';
import { clearReduxCacheOnly } from './methods/clearReduxCacheOnly';
import { clearDividendHistory } from './methods/clearDividendHistory';

// Create deleteDataService as a functional object
const deleteDataService: DeleteDataService = {
    clearAllData,
    clearAssetDefinitions,
    clearAssetTransactions,
    clearDebts,
    clearExpenses,
    clearIncome,
    clearDividendHistory,
    clearPartialData,
    clearPriceHistory,
    clearPortfolioHistory,
    clearReduxCacheOnly,
};

// Export the service interface and implementation
export { deleteDataService };

// Export default instance for direct use
export default deleteDataService;

// Export individual methods for direct use if needed
export {
    refreshPortfolioHistory
};
