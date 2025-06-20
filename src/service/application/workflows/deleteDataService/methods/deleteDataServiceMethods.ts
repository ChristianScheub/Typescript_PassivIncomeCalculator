import { DeleteDataService } from '../interfaces/IDeleteDataService';
import { clearAssetDefinitions } from './clearAssetDefinitions';
import { clearPriceHistory } from './clearPriceHistory';
import { clearAssetTransactions } from './clearAssetTransactions';
import { clearDebts } from './clearDebts';
import { clearExpenses } from './clearExpenses';
import { clearIncome } from './clearIncome';
import { clearPartialData } from './clearPartialData';
import { clearAllData } from './clearAllData';

class DeleteDataServiceImpl implements DeleteDataService {
    clearAssetDefinitions = clearAssetDefinitions;
    clearPriceHistory = clearPriceHistory;
    clearAssetTransactions = clearAssetTransactions;
    clearDebts = clearDebts;
    clearExpenses = clearExpenses;
    clearIncome = clearIncome;
    clearPartialData = clearPartialData;
    clearAllData = clearAllData;
}

export const deleteDataServiceImpl = new DeleteDataServiceImpl();
