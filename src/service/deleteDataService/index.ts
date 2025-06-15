import { DeleteDataService } from './interfaces/IDeleteDataService';
import { clearAllData } from './methods/clearAllData';
import { clearAssetDefinitions } from './methods/clearAssetDefinitions';
import { clearAssetTransactions } from './methods/clearAssetTransactions';
import { clearDebts } from './methods/clearDebts';
import { clearExpenses } from './methods/clearExpenses';
import { clearIncome } from './methods/clearIncome';
import { clearPartialData } from './methods/clearPartialData';
import { clearPriceHistory } from './methods/clearPriceHistory';

class DeleteDataServiceImpl implements DeleteDataService {
    clearAllData = clearAllData;
    clearAssetDefinitions = clearAssetDefinitions;
    clearAssetTransactions = clearAssetTransactions;
    clearDebts = clearDebts;
    clearExpenses = clearExpenses;
    clearIncome = clearIncome;
    clearPartialData = clearPartialData;
    clearPriceHistory = clearPriceHistory;
}

// Export the service interface and implementation
export type { DeleteDataService };
export const deleteDataService = new DeleteDataServiceImpl();

// Export default instance for direct use
export default deleteDataService;

// Export individual methods for direct use if needed
export {
    clearAllData,
    clearAssetDefinitions,
    clearAssetTransactions,
    clearDebts,
    clearExpenses,
    clearIncome,
    clearPartialData,
    clearPriceHistory
};
