import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MonthlyProjection } from '@/types/domains/analytics';
import calculatorService from '@service/domain/financial/calculations/compositeCalculatorService';
import { StoreState } from '../..';
import Logger from '@service/shared/logging/Logger/logger';
import { hydrateStore } from '../../actions/hydrateAction';
import { PortfolioPosition } from '@/types/domains/portfolio/position';

// Helper functions to calculate income for different asset types
const getAssetDefinition = (position: PortfolioPosition, assetDefinitions: any[]): any | undefined => {
  return assetDefinitions.find(def => def.id === position.assetDefinitionId);
};

const calculateStockDividendIncome = (position: PortfolioPosition, month: number, assetDefinitions: any[]): number => {
  const assetDefinition = getAssetDefinition(position, assetDefinitions);
  if (!assetDefinition?.dividendInfo?.frequency || assetDefinition.dividendInfo.frequency === 'none') {
    return 0;
  }
  if (position.totalQuantity <= 0) return 0;
  try {
    const dividendForMonth = calculatorService.calculateDividendForMonth(assetDefinition.dividendInfo, position.totalQuantity, month);
    return isFinite(dividendForMonth) ? dividendForMonth : 0;
  } catch (error) {
    Logger.cache(`Error calculating dividend for ${position.name}: ${error}`);
    return 0;
  }
};

const calculateBondInterestIncome = (position: PortfolioPosition, assetDefinitions: any[]): number => {
  const assetDefinition = getAssetDefinition(position, assetDefinitions);
  if (assetDefinition?.bondInfo?.interestRate === undefined) {
    return 0;
  }
  const interestRate = assetDefinition.bondInfo.interestRate;
  const annualInterest = (interestRate * position.currentValue) / 100;
  const monthlyInterest = annualInterest / 12;
  return isFinite(monthlyInterest) ? monthlyInterest : 0;
};

const calculateRealEstateIncome = (position: PortfolioPosition, assetDefinitions: any[]): number => {
  const assetDefinition = getAssetDefinition(position, assetDefinitions);
  if (assetDefinition?.rentalInfo?.baseRent === undefined) {
    return 0;
  }
  const monthlyRent = assetDefinition.rentalInfo.baseRent;
  return isFinite(monthlyRent) ? monthlyRent : 0;
};

// Helper function to calculate monthly income from portfolio positions for a specific month
const calculatePortfolioMonthlyIncome = (positions: PortfolioPosition[], month: number, assetDefinitions: any[]): number => {
  let totalIncome = 0;
  positions.forEach(position => {
    const assetDefinition = getAssetDefinition(position, assetDefinitions);
    if (!assetDefinition) return;
    switch (position.type) {
      case 'stock':
        totalIncome += calculateStockDividendIncome(position, month, assetDefinitions);
        break;
      case 'bond':
      case 'cash':
        totalIncome += calculateBondInterestIncome(position, assetDefinitions);
        break;
      case 'real_estate':
        totalIncome += calculateRealEstateIncome(position, assetDefinitions);
        break;
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
    Logger.infoRedux('Forecast: Starting values update');
    const state = getState() as StoreState;
    const { transactions, income, expenses, liabilities, assetDefinitions } = state;

    // Berechne Base-Werte direkt
    const baseValues = {
      totalMonthlyIncome: calculatorService.calculateTotalMonthlyIncome(income.items),
      totalMonthlyExpenses: calculatorService.calculateTotalMonthlyExpenses(expenses.items),
      totalLiabilityPayments: calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities.items),
      passiveIncome: calculatorService.calculatePassiveIncome(income.items),
    };

    // Cache Asset-Einkommen für jeden Monat (berücksichtigt Dividendentermine)
    const monthlyAssetIncomeCache: Record<number, number> = {};
    const portfolioCache = transactions.cache;
    if (!portfolioCache) {
      Logger.cache('Portfolio cache not available for forecast calculation');
      throw new Error('Portfolio cache required for forecast calculations');
    }
    Logger.cache('Using portfolio positions for monthly asset income cache');
    for (let month = 1; month <= 12; month++) {
      monthlyAssetIncomeCache[month] = calculatePortfolioMonthlyIncome(portfolioCache.positions, month, assetDefinitions.items);
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

    Logger.infoRedux(`Forecast: Values update completed successfully - ${projections.length} projections calculated`);
    return values;
  }
);

// Thunk to update only monthly asset income cache when assets change
export const updateMonthlyAssetIncomeCache = createAsyncThunk<
  { monthlyAssetIncomeCache: Record<number, number> },
  void,
  { state: StoreState }
>(
  'forecast/updateAssetIncomeCache',
  async (_, { getState }) => {
    Logger.cache('Updating monthly asset income cache');
    const state = getState() as StoreState;
    const { transactions, assetDefinitions } = state;
    const monthlyAssetIncomeCache: Record<number, number> = {};
    const portfolioCache = transactions.cache;
    if (!portfolioCache) {
      Logger.cache('Portfolio cache not available for cache update');
      throw new Error('Portfolio cache required for monthly asset income calculations');
    }
    Logger.cache('Using portfolio positions for cache update');
    for (let month = 1; month <= 12; month++) {
      monthlyAssetIncomeCache[month] = calculatePortfolioMonthlyIncome(portfolioCache.positions, month, assetDefinitions.items);
    }
    Logger.cache('Monthly asset income cache updated');
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
      Logger.cache('Forecast cache invalidated');
    },
    // Action zum kompletten Zurücksetzen des Forecast-Slices
    clearAllForecast: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateForecastValues.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateForecastValues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projections = action.payload.projections;
        state.monthlyAssetIncomeCache = action.payload.monthlyAssetIncomeCache;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(updateForecastValues.rejected, (state, action) => {
        state.isLoading = false;
        Logger.infoRedux(`Forecast: Update failed - ${action.error.message}`);
      })
      .addCase(updateMonthlyAssetIncomeCache.fulfilled, (state, action) => {
        state.monthlyAssetIncomeCache = action.payload.monthlyAssetIncomeCache;
        Logger.cache('Monthly asset income cache updated');
      })
      .addCase(hydrateStore, (state, action) => {
        if (action.payload.forecast) {
          const forecastData = action.payload.forecast;
          state.projections = forecastData.projections || state.projections;
          state.monthlyAssetIncomeCache = forecastData.monthlyAssetIncomeCache || state.monthlyAssetIncomeCache;
          state.lastUpdated = forecastData.lastUpdated || state.lastUpdated;
          state.isLoading = forecastData.isLoading !== undefined ? forecastData.isLoading : state.isLoading;
        }
      });
  },
});

export const { invalidateCache, clearAllForecast } = forecastSlice.actions;
export default forecastSlice.reducer;
