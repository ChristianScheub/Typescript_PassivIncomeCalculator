import { DeleteDataService } from '../interfaces/IDeleteDataService';
import { clearAssetDefinitions } from './clearAssetDefinitions';
import { clearPriceHistory } from './clearPriceHistory';
import { clearAssetTransactions } from './clearAssetTransactions';
import { clearDebts } from './clearDebts';
import { clearExpenses } from './clearExpenses';
import { clearIncome } from './clearIncome';
import { clearPartialData } from './clearPartialData';
import { clearAllData } from './clearAllData';
import { clearPortfolioHistory } from './clearPortfolioHistory';
import { clearReduxCacheOnly } from './clearReduxCacheOnly';

class DeleteDataServiceImpl implements DeleteDataService {
    clearAssetDefinitions = clearAssetDefinitions;
    clearPriceHistory = clearPriceHistory;
    clearAssetTransactions = clearAssetTransactions;
    clearDebts = clearDebts;
    clearExpenses = clearExpenses;
    clearIncome = clearIncome;
    clearPartialData = clearPartialData;
    clearAllData = clearAllData;
    clearPortfolioHistory = clearPortfolioHistory;
    clearReduxCacheOnly = clearReduxCacheOnly;
}

export const deleteDataServiceImpl = new DeleteDataServiceImpl();
