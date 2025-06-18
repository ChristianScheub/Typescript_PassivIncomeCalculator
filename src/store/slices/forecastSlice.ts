import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MonthlyProjection } from '@/types/domains/analytics';
import calculatorService from '../../service/calculatorService';
import { StoreState } from '..';
import Logger from '../../service/Logger/logger';
import { hydrateStore } from '../actions/hydrateAction';
import { PortfolioPosition } from '../../service/portfolioService/portfolioCalculations';

// Helper functions to calculate income for different asset types
const calculateStockDividendIncome = (position: PortfolioPosition, month: number): number => {
  const { assetDefinition, totalQuantity, name } = position;
  
  if (!assetDefinition?.dividendInfo?.frequency || assetDefinition.dividendInfo.frequency === 'none') {
    return 0;
  }
  
  if (totalQuantity <= 0) return 0;
  
  try {
    const dividendForMonth = calculatorService.calculateDividendForMonth(assetDefinition.dividendInfo, totalQuantity, month);
    return isFinite(dividendForMonth) ? dividendForMonth : 0;
  } catch (error) {
    Logger.cache(`Error calculating dividend for ${name}: ${error}`);
    return 0;
  }
};

const calculateBondInterestIncome = (position: PortfolioPosition): number => {
  const { assetDefinition, currentValue } = position;
  
  if (assetDefinition?.bondInfo?.interestRate === undefined) {
    return 0;
  }
  
  const interestRate = assetDefinition.bondInfo.interestRate;
  const annualInterest = (interestRate * currentValue) / 100;
  const monthlyInterest = annualInterest / 12;
  
  return isFinite(monthlyInterest) ? monthlyInterest : 0;
};

const calculateRealEstateIncome = (position: PortfolioPosition): number => {
  const { assetDefinition } = position;
  
  if (assetDefinition?.rentalInfo?.baseRent === undefined) {
    return 0;
  }
  
  const monthlyRent = assetDefinition.rentalInfo.baseRent;
  return isFinite(monthlyRent) ? monthlyRent : 0;
};

// Helper function to calculate monthly income from portfolio positions for a specific month
const calculatePortfolioMonthlyIncome = (positions: PortfolioPosition[], month: number): number => {
  let totalIncome = 0;
  
  positions.forEach(position => {
    if (!position.assetDefinition) return;
    
    switch (position.type) {
      case 'stock':
        totalIncome += calculateStockDividendIncome(position, month);
        break;
      case 'bond':
      case 'cash':
        totalIncome += calculateBondInterestIncome(position);
        break;
      case 'real_estate':
        totalIncome += calculateRealEstateIncome(position);
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
    Logger.infoRedux('Starting forecast values update');
    const state = getState() as StoreState;
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
  { state: StoreState }
>(
  'forecast/updateAssetIncomeCache',
  async (_, { getState }) => {
    Logger.infoRedux('Updating monthly asset income cache');
    const state = getState() as StoreState;
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
