import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MonthlyProjection } from '../../types';
import calculatorService from '../../service/calculatorService';
import { RootState } from '..';
import Logger from '../../service/Logger/logger';
import { hydrateStore } from '../actions/hydrateAction';
import { PortfolioPosition } from '../../service/portfolioService/portfolioCalculations';
import { calculateDividendForMonth } from '../../service/calculatorService/methods/calculatePayment';

// Helper function to calculate monthly income from portfolio positions for a specific month
const calculatePortfolioMonthlyIncome = (positions: PortfolioPosition[], month: number): number => {
  let totalIncome = 0;
  
  positions.forEach(position => {
    if (!position.assetDefinition) return;
    
    const assetDefinition = position.assetDefinition;
    const totalQuantity = position.totalQuantity;
    
    // Stock dividends
    if (position.type === 'stock' && assetDefinition.dividendInfo?.frequency && assetDefinition.dividendInfo.frequency !== 'none') {
      if (totalQuantity <= 0) return;
      
      try {
        const dividendForMonth = calculateDividendForMonth(assetDefinition.dividendInfo, totalQuantity, month);
        totalIncome += isFinite(dividendForMonth) ? dividendForMonth : 0;
      } catch (error) {
        Logger.cache(`Error calculating dividend for ${position.name}: ${error}`);
      }
    }

    // Bond/Cash interest
    if ((position.type === 'bond' || position.type === 'cash') && assetDefinition.bondInfo?.interestRate !== undefined) {
      const interestRate = assetDefinition.bondInfo.interestRate;
      const currentValue = position.currentValue;
      const annualInterest = (interestRate * currentValue) / 100;
      const monthlyInterest = annualInterest / 12;
      totalIncome += isFinite(monthlyInterest) ? monthlyInterest : 0;
    }

    // Real estate rental
    if (position.type === 'real_estate' && assetDefinition.rentalInfo?.baseRent !== undefined) {
      const monthlyRent = assetDefinition.rentalInfo.baseRent;
      totalIncome += isFinite(monthlyRent) ? monthlyRent : 0;
    }
  });
  
  return isFinite(totalIncome) ? totalIncome : 0;
};

interface ForecastState {
  projections: MonthlyProjection[];
  isLoading: boolean;
  lastUpdated: string | null;
  // Cache für monatliche Asset-Einkommen um Dividendentermine zu berücksichtigen
  monthlyAssetIncomeCache: Record<number, number>; // month -> total income
}

const initialState: ForecastState = {
  projections: [],
  isLoading: false,
  lastUpdated: null,
  monthlyAssetIncomeCache: {},
};

// Thunk to calculate and cache all forecast values
export const updateForecastValues = createAsyncThunk(
  'forecast/updateValues',
  async (_, { getState }) => {
    Logger.infoRedux('Starting forecast values update');
    const state = getState() as RootState;
    const { assets, income, expenses, liabilities, dashboard } = state;

    // Verwende bereits berechnete Dashboard-Werte wenn verfügbar, sonst berechne neu
    const baseValues = {
      totalMonthlyIncome: dashboard.monthlyIncome,
      totalMonthlyExpenses: dashboard.monthlyExpenses,
      totalLiabilityPayments: dashboard.monthlyLiabilityPayments,
      passiveIncome: dashboard.passiveIncome,
    };

    // Falls Dashboard-Werte nicht verfügbar sind, berechne sie
    if (!baseValues.totalMonthlyIncome && !baseValues.totalMonthlyExpenses) {
      Logger.infoRedux('Dashboard values not available, calculating base values');
      baseValues.totalMonthlyIncome = calculatorService.calculateTotalMonthlyIncome(income.items);
      baseValues.totalMonthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses.items);
      baseValues.totalLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities.items);
      baseValues.passiveIncome = calculatorService.calculatePassiveIncome(income.items);
    }

    // Cache Asset-Einkommen für jeden Monat (berücksichtigt Dividendentermine)
    const monthlyAssetIncomeCache: Record<number, number> = {};
    
    // Use portfolio cache if available (new transaction-based system)
    const portfolioCache = assets.portfolioCache;
    if (portfolioCache && assets.portfolioCacheValid) {
      Logger.infoRedux('Using portfolio positions for monthly asset income cache');
      for (let month = 1; month <= 12; month++) {
        monthlyAssetIncomeCache[month] = calculatePortfolioMonthlyIncome(portfolioCache.positions, month);
      }
    } else {
      // Fallback to legacy asset-based calculations
      Logger.infoRedux('Using legacy assets for monthly asset income cache');
      for (let month = 1; month <= 12; month++) {
        monthlyAssetIncomeCache[month] = calculatorService.calculateTotalAssetIncomeForMonth(assets.items, month);
      }
    }

    // Verwende die gecachten Werte für Projektionen
    const projections = calculatorService.calculateProjectionsWithCache(
      baseValues,
      monthlyAssetIncomeCache
    );

    const values = {
      projections,
      monthlyAssetIncomeCache,
      lastUpdated: new Date().toISOString(),
    };

    Logger.infoRedux(`Forecast values updated: ${projections.length} projections calculated`);
    return values;
  }
);

// Thunk to update only monthly asset income cache when assets change
export const updateMonthlyAssetIncomeCache = createAsyncThunk<
  { monthlyAssetIncomeCache: Record<number, number> },
  void,
  { state: RootState }
>(
  'forecast/updateAssetIncomeCache',
  async (_, { getState }) => {
    Logger.infoRedux('Updating monthly asset income cache');
    const state = getState() as RootState;
    const { assets } = state;

    const monthlyAssetIncomeCache: Record<number, number> = {};
    
    // Use portfolio cache if available (new transaction-based system)
    const portfolioCache = assets.portfolioCache;
    if (portfolioCache && assets.portfolioCacheValid) {
      Logger.infoRedux('Using portfolio positions for cache update');
      for (let month = 1; month <= 12; month++) {
        monthlyAssetIncomeCache[month] = calculatePortfolioMonthlyIncome(portfolioCache.positions, month);
      }
    } else {
      // Fallback to legacy asset-based calculations
      Logger.infoRedux('Using legacy assets for cache update');
      for (let month = 1; month <= 12; month++) {
        monthlyAssetIncomeCache[month] = calculatorService.calculateTotalAssetIncomeForMonth(assets.items, month);
      }
    }

    Logger.infoRedux('Monthly asset income cache updated');
    return { monthlyAssetIncomeCache };
  }
);

const forecastSlice = createSlice({
  name: 'forecast',
  initialState,
  reducers: {
    // Manual cache invalidation if needed
    invalidateCache: (state) => {
      state.monthlyAssetIncomeCache = {};
      state.lastUpdated = null;
      Logger.infoRedux('Forecast cache invalidated');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateForecastValues.pending, (state) => {
        state.isLoading = true;
        Logger.infoRedux('Updating forecast values...');
      })
      .addCase(updateForecastValues.fulfilled, (state, action) => {
        Logger.infoRedux('Forecast values updated successfully');
        state.isLoading = false;
        state.projections = action.payload.projections;
        state.monthlyAssetIncomeCache = action.payload.monthlyAssetIncomeCache;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(updateForecastValues.rejected, (state, action) => {
        state.isLoading = false;
        Logger.infoRedux(`Failed to update forecast values: ${action.error.message}`);
      })
      .addCase(updateMonthlyAssetIncomeCache.fulfilled, (state, action) => {
        state.monthlyAssetIncomeCache = action.payload.monthlyAssetIncomeCache;
        Logger.infoRedux('Monthly asset income cache updated');
      })
      .addCase(hydrateStore, (state, action) => {
        if (action.payload.forecast) {
          Logger.infoRedux('Hydrating forecast state');
          const forecastData = action.payload.forecast;
          state.projections = forecastData.projections || state.projections;
          state.monthlyAssetIncomeCache = forecastData.monthlyAssetIncomeCache || state.monthlyAssetIncomeCache;
          state.lastUpdated = forecastData.lastUpdated || state.lastUpdated;
          state.isLoading = forecastData.isLoading !== undefined ? forecastData.isLoading : state.isLoading;
        }
      });
  },
});

export const { invalidateCache } = forecastSlice.actions;
export default forecastSlice.reducer;
