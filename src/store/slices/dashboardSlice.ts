import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StoreState } from '..';
import calculatorService from '@service/domain/financial/calculations/compositeCalculatorService';
import Logger from '@service/shared/logging/Logger/logger';
import { DashboardState } from '@/types/domains/dashboard/state';
import { PortfolioPosition } from '@/types/domains/portfolio/position';

const initialState: DashboardState = {
  netWorth: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  monthlyLiabilityPayments: 0,
  monthlyAssetIncome: 0,
  passiveIncome: 0,
  monthlyCashFlow: 0,
  passiveIncomeRatio: 0,
  assetAllocation: [],
  totalAssetGain: 0,
  totalAssetGainPercentage: 0,
  status: 'idle',
  error: null
};

// Thunk to recalculate all dashboard values
export const updateDashboardValues = createAsyncThunk(
  'dashboard/updateValues',
  async (_, { getState }) => {
    Logger.infoRedux('Starting dashboard values update');
    const state = getState() as StoreState;
    const { assets, income, expenses, liabilities } = state;

    // Calculate all values
    const monthlyIncome = calculatorService.calculateTotalMonthlyIncome(income.items);
    const monthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses.items);
    const monthlyLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities.items);

    const portfolioCache = assets.portfolioCache;
    let monthlyAssetIncome: number;
    let totalAssets: number;
    
    if (portfolioCache && assets.portfolioCacheValid) {
      monthlyAssetIncome = portfolioCache.totals.monthlyIncome;
      totalAssets = portfolioCache.totals.totalValue;
      Logger.infoRedux(`Using portfolio cache - monthlyIncome: ${monthlyAssetIncome}, totalValue: ${totalAssets}`);
    } else {
      // Cache invalid - trigger recalculation and use 0 as fallback until ready
      Logger.infoRedux('Portfolio cache invalid, using zero values until recalculation completes');
      monthlyAssetIncome = 0;
      totalAssets = 0;
    }

    // Only consider income entries marked as passive
    const passiveIncome = calculatorService.calculatePassiveIncome(income.items);

    // Calculate derived values
    const totalLiabilities = calculatorService.calculateTotalDebt(liabilities.items);
    const netWorth = calculatorService.calculateNetWorth(totalAssets, totalLiabilities);

    const monthlyCashFlow = calculatorService.calculateMonthlyCashFlow(
      monthlyIncome + monthlyAssetIncome,
      monthlyExpenses,
      monthlyLiabilityPayments
    );
    
    const passiveIncomeRatio = calculatorService.calculatePassiveIncomeRatio(monthlyIncome, passiveIncome);
    
    let assetAllocation: Array<{name: string; type: string; value: number; percentage: number}> = [];
    if (portfolioCache && assets.portfolioCacheValid) {
      const typeMap = new Map<string, number>();
      portfolioCache.positions.forEach((position: PortfolioPosition) => {
        const currentValue = typeMap.get(position.type) || 0;
        typeMap.set(position.type, currentValue + position.currentValue);
      });
      
      assetAllocation = Array.from(typeMap.entries()).map(([type, value]) => ({
        name: type,
        type: type,
        value: value,
        percentage: portfolioCache.totals.totalValue > 0 
          ? (value / portfolioCache.totals.totalValue) * 100 
          : 0
      }));
      Logger.infoRedux('Using direct portfolio cache access for asset allocation');
    } else {
      Logger.infoRedux('Portfolio cache invalid, using empty asset allocation');
    }

    // Calculate total asset gain and percentage using portfolio cache
    let totalAssetGain = 0;
    let totalAssetGainPercentage = 0;
    
    if (portfolioCache && assets.portfolioCacheValid) {
      const totalInitialInvestment = portfolioCache.positions.reduce((sum: number, position: PortfolioPosition) => {
        return sum + position.totalInvestment; // Already accounts for buy/sell transactions correctly
      }, 0);

      totalAssetGain = totalAssets - totalInitialInvestment;
      totalAssetGainPercentage = totalInitialInvestment > 0 
        ? (totalAssetGain / totalInitialInvestment) * 100 
        : 0;
      
      Logger.infoRedux(`Asset gain calculation - totalAssets: ${totalAssets}, totalInvestment: ${totalInitialInvestment}, gain: ${totalAssetGain} (${totalAssetGainPercentage}%)`);
    } else {
      Logger.infoRedux('Portfolio cache invalid, using zero values for asset gain calculation');
    }

    Logger.infoRedux(`Dashboard values updated: ${JSON.stringify({
      monthlyIncome,
      monthlyExpenses,
      netWorth,
      passiveIncomeRatio: Math.round(passiveIncomeRatio * 100) / 100
    })}`);

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      monthlyIncome,
      monthlyExpenses,
      monthlyLiabilityPayments,
      monthlyAssetIncome,
      passiveIncome,
      monthlyCashFlow,
      passiveIncomeRatio,
      assetAllocation,
      totalAssetGain,
      totalAssetGainPercentage,
      status: 'succeeded' as const,
      error: null
    } as DashboardState;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateDashboardValues.pending, (state) => {
        state.status = 'loading';
        Logger.infoRedux('Updating dashboard values...');
      })
      .addCase(updateDashboardValues.fulfilled, (state, action) => {
        Logger.infoRedux('Dashboard values updated successfully');
        return {
          ...state,
          ...action.payload,
          status: 'succeeded'
        };
      })
      .addCase(updateDashboardValues.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'An error occurred';
        Logger.infoRedux(`Failed to update dashboard values: ${action.error.message}`);
      });
  },
});

export default dashboardSlice.reducer;
