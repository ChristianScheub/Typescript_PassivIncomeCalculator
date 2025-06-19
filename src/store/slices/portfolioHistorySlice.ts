import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StoreState } from '..';
import Logger from '../../service/Logger/logger';
import { getPriceHistoryForRange } from '../../utils/priceHistoryUtils';
import { PortfolioCache } from './transactionsSlice';
import { PortfolioPosition } from '../../types/domains/portfolio/position';
import { AssetDefinition } from '../../types/domains/assets/entities';

interface PortfolioHistoryDay {
  date: string;
  value: number;
  change: number;
  changePercentage: number;
}

interface PortfolioHistoryState {
  history30Days: PortfolioHistoryDay[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastCalculated: string | null;
}

const initialState: PortfolioHistoryState = {
  history30Days: [],
  status: 'idle',
  error: null,
  lastCalculated: null
};

export const calculate30DayHistory = createAsyncThunk(
  'portfolioHistory/calculate30Days',
  async (_, { getState }) => {
    const state = getState() as StoreState;
    const { transactions } = state;
    Logger.infoRedux('Calculating 30-day portfolio history using portfolio system');
    
    const portfolioCache = transactions.portfolioCache;
    if (!portfolioCache || !transactions.portfolioCacheValid) {
      throw new Error('Portfolio cache not available for history calculation');
    }
    
    return calculateHistoryFromPortfolio(portfolioCache);
  }
);

// Function for portfolio-based history calculation with proper typing
const calculateHistoryFromPortfolio = (portfolioCache: PortfolioCache): PortfolioHistoryDay[] => {
  Logger.infoRedux('Portfolio-based history calculation - analyzing positions');
  
  // Get all unique asset definitions from portfolio positions with price history
  const relevantDefinitions = portfolioCache.positions
    .map((pos: PortfolioPosition) => pos.assetDefinition)
    .filter((def): def is AssetDefinition => 
      def != null && Array.isArray(def.priceHistory) && def.priceHistory.length > 0
    );

  Logger.infoRedux('Asset Definitions in portfolio for history:');
  Logger.infoRedux('=================================================');
  relevantDefinitions.forEach((def: AssetDefinition) => {
    Logger.infoRedux(`- ${def.name} (ID: ${def.id})`);
    Logger.infoRedux(`  Price History Points: ${def.priceHistory?.length || 0}`);
    const position = portfolioCache.positions.find((p: PortfolioPosition) => p.assetDefinition?.id === def.id);
    Logger.infoRedux(`  Associated Transactions: ${position?.transactionCount || 0}`);
  });
  Logger.infoRedux('=================================================');

  // Get last 30 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const history: PortfolioHistoryDay[] = [];
  let previousValue = 0;

  // Calculate portfolio value for each day using portfolio positions
  for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().split('T')[0];
    let totalValue = 0;

    portfolioCache.positions.forEach((position: PortfolioPosition) => {
      const definition = position.assetDefinition;
      if (!definition?.priceHistory?.length) return;

      // Get the price for this date
      const dayPrices = getPriceHistoryForRange(date, date, definition.priceHistory);
      let price = 0;
      
      if (!dayPrices.length) {
        // If no price on exact date, use the most recent previous price
        const pastPrices = getPriceHistoryForRange(startDate, date, definition.priceHistory);
        if (!pastPrices.length) return;
        price = pastPrices[pastPrices.length - 1].price;
      } else {
        price = dayPrices[0].price;
      }

      // Calculate position value considering only transactions that occurred before or on this date
      const validTransactions = position.transactions.filter((transaction) => 
        transaction.transactionType === 'buy' && new Date(transaction.purchaseDate) <= new Date(date)
      );

      const positionQuantity = validTransactions.reduce((sum: number, transaction) => {
        return sum + (transaction.purchaseQuantity || 0);
      }, 0);

      const positionValue = positionQuantity * price;
      totalValue += positionValue;

      Logger.infoRedux(`Date ${date}: Position ${definition.name} - Valid transactions: ${validTransactions.length}/${position.transactions.length}, Quantity: ${positionQuantity}, Price: ${price}, Value: ${positionValue}`);
    });

    // Calculate change from previous day
    const change = previousValue ? totalValue - previousValue : 0;
    const changePercentage = previousValue ? (change / previousValue) * 100 : 0;
    
    history.push({
      date,
      value: totalValue,
      change,
      changePercentage
    });
    
    // Save current value to use as previous value in next iteration
    previousValue = totalValue;
  }

  return history;
};

const portfolioHistorySlice = createSlice({
  name: 'portfolioHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(calculate30DayHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(calculate30DayHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.history30Days = action.payload;
        state.lastCalculated = new Date().toISOString();
      })
      .addCase(calculate30DayHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to calculate portfolio history';
      });
  }
});

export default portfolioHistorySlice.reducer;
