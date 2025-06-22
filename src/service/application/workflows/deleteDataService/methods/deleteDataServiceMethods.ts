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
}

export const deleteDataServiceImpl = new DeleteDataServiceImpl();
