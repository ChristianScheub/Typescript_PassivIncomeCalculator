import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Asset, Income, Expense, Liability, AssetAllocation } from '../../types';
import calculatorService from '../../service/calculatorService';
import { RootState } from '..';
import { hydrateStore } from '../actions/hydrateAction';

interface DashboardState {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  totalLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  totalAssetValue: number;
  totalLiabilityValue: number;
  netWorth: number;
  monthlyCashFlow: number;
  passiveIncomeRatio: number;
  assetAllocation: AssetAllocation[];
}

const initialState: DashboardState = {
  totalMonthlyIncome: 0,
  totalMonthlyExpenses: 0,
  totalLiabilityPayments: 0,
  monthlyAssetIncome: 0,
  passiveIncome: 0,
  totalAssetValue: 0,
  totalLiabilityValue: 0,
  netWorth: 0,
  monthlyCashFlow: 0,
  passiveIncomeRatio: 0,
  assetAllocation: [],
};

// Thunk to recalculate all dashboard values
export const updateDashboardValues = createAsyncThunk(
  'dashboard/updateValues',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { assets, income, expenses, liabilities } = state;

    // Calculate all values
    const totalMonthlyIncome = calculatorService.calculateTotalMonthlyIncome(income.items);
    const totalMonthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses.items);
    const totalLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities.items);

    // Use cached calculation for monthly asset income
    const monthlyAssetIncome = calculatorService.calculateTotalMonthlyAssetIncomeWithCache
      ? calculatorService.calculateTotalMonthlyAssetIncomeWithCache(assets.items)
      : calculatorService.calculateTotalMonthlyAssetIncome(assets.items);

    // Only consider income entries marked as passive
    const passiveIncome = calculatorService.calculatePassiveIncome(income.items);

    // Calculate derived values
    const totalAssetValue = calculatorService.calculateTotalAssetValue(assets.items);
    const totalLiabilityValue = calculatorService.calculateTotalDebt(liabilities.items);
    const netWorth = calculatorService.calculateNetWorth(totalAssetValue, totalLiabilityValue);

    const monthlyCashFlow = calculatorService.calculateMonthlyCashFlow(
      totalMonthlyIncome + monthlyAssetIncome,
      totalMonthlyExpenses,
      totalLiabilityPayments
    );
    const passiveIncomeRatio = calculatorService.calculatePassiveIncomeRatio(totalMonthlyIncome, passiveIncome);
    const assetAllocation = calculatorService.calculateAssetAllocation(assets.items);

    return {
      totalMonthlyIncome,
      totalMonthlyExpenses,
      totalLiabilityPayments,
      monthlyAssetIncome,
      passiveIncome,
      totalAssetValue,
      totalLiabilityValue,
      netWorth,
      monthlyCashFlow,
      passiveIncomeRatio,
      assetAllocation,
    };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateDashboardValues.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
        };
      })
      .addCase(hydrateStore, (state, action) => {
        if (action.payload.dashboard) {
          return {
            ...state,
            ...action.payload.dashboard
          };
        }
        return state;
      });
  },
});

export default dashboardSlice.reducer;
