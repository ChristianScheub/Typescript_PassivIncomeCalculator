import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MonthlyProjection, AssetAllocation, ExpenseBreakdown, IncomeAllocation } from '../../types';
import calculatorService from '../../service/calculatorService';
import { calculateLiabilityMonthlyPayment } from '../../service/calculatorService/methods/calculateLiabilities';
import { RootState } from '..';
import Logger from '../../service/Logger/logger';
import { hydrateStore } from '../actions/hydrateAction';

interface ForecastState {
  projections: MonthlyProjection[];
  assetAllocation: AssetAllocation[];
  expenseBreakdown: ExpenseBreakdown[];
  incomeAllocation: IncomeAllocation[];
  transformedLiabilities: { category: string; amount: number }[];
  isLoading: boolean;
  lastUpdated: string | null;
  // Cache für monatliche Asset-Einkommen um Dividendentermine zu berücksichtigen
  monthlyAssetIncomeCache: Record<number, number>; // month -> total income
}

const initialState: ForecastState = {
  projections: [],
  assetAllocation: [],
  expenseBreakdown: [],
  incomeAllocation: [],
  transformedLiabilities: [],
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
    let baseValues = {
      totalMonthlyIncome: dashboard.totalMonthlyIncome,
      totalMonthlyExpenses: dashboard.totalMonthlyExpenses,
      totalLiabilityPayments: dashboard.totalLiabilityPayments,
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
    for (let month = 1; month <= 12; month++) {
      monthlyAssetIncomeCache[month] = calculatorService.calculateTotalAssetIncomeForMonth(assets.items, month);
    }

    // Verwende die gecachten Werte für Projektionen
    const projections = calculatorService.calculateProjectionsWithCache(
      baseValues,
      monthlyAssetIncomeCache
    );

    // Verwende bereits berechnete Asset Allocation aus Dashboard wenn verfügbar
    const assetAllocation = dashboard.assetAllocation.length > 0 
      ? dashboard.assetAllocation 
      : calculatorService.calculateAssetAllocation(assets.items);

    const expenseBreakdown = calculatorService.calculateExpenseBreakdown(expenses.items);
    const incomeAllocation = calculatorService.calculateIncomeAllocation(income.items, assets.items);
    
    const transformedLiabilities = liabilities.items.map(liability => ({
      category: liability.type,
      amount: calculateLiabilityMonthlyPayment(liability)
    }));

    const values = {
      projections,
      assetAllocation,
      expenseBreakdown,
      incomeAllocation,
      transformedLiabilities,
      monthlyAssetIncomeCache,
      lastUpdated: new Date().toISOString(),
    };

    Logger.infoRedux(`Forecast values updated: ${projections.length} projections calculated`);
    return values;
  }
);

// Thunk to update only monthly asset income cache when assets change
export const updateMonthlyAssetIncomeCache = createAsyncThunk(
  'forecast/updateAssetIncomeCache',
  async (_, { getState }) => {
    Logger.infoRedux('Updating monthly asset income cache');
    const state = getState() as RootState;
    const { assets } = state;

    const monthlyAssetIncomeCache: Record<number, number> = {};
    for (let month = 1; month <= 12; month++) {
      monthlyAssetIncomeCache[month] = calculatorService.calculateTotalAssetIncomeForMonth(assets.items, month);
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
        state.assetAllocation = action.payload.assetAllocation;
        state.expenseBreakdown = action.payload.expenseBreakdown;
        state.incomeAllocation = action.payload.incomeAllocation;
        state.transformedLiabilities = action.payload.transformedLiabilities;
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
          state.assetAllocation = forecastData.assetAllocation || state.assetAllocation;
          state.expenseBreakdown = forecastData.expenseBreakdown || state.expenseBreakdown;
          state.incomeAllocation = forecastData.incomeAllocation || state.incomeAllocation;
          state.transformedLiabilities = forecastData.transformedLiabilities || state.transformedLiabilities;
          state.monthlyAssetIncomeCache = forecastData.monthlyAssetIncomeCache || state.monthlyAssetIncomeCache;
          state.lastUpdated = forecastData.lastUpdated || state.lastUpdated;
          state.isLoading = forecastData.isLoading !== undefined ? forecastData.isLoading : state.isLoading;
        }
      });
  },
});

export const { invalidateCache } = forecastSlice.actions;
export default forecastSlice.reducer;
