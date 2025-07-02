import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomAnalyticsConfig } from '@/types/domains/analytics/charts';

interface CustomAnalyticsState {
  charts: CustomAnalyticsConfig[];
  isConfigPanelOpen: boolean;
  editingChartId: string | null;
}

const initialState: CustomAnalyticsState = {
  charts: [],
  isConfigPanelOpen: false,
  editingChartId: null,
};

const customAnalyticsSlice = createSlice({
  name: 'customAnalytics',
  initialState,
  reducers: {
    // Chart-Management
    addChart: (state, action: PayloadAction<Omit<CustomAnalyticsConfig, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date().toISOString();
      const newChart: CustomAnalyticsConfig = {
        ...action.payload,
        id: `chart_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: now,
        updatedAt: now,
      };
      state.charts.push(newChart);
    },
    
    updateChart: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<CustomAnalyticsConfig, 'id' | 'createdAt'>> }>) => {
      const { id, updates } = action.payload;
      const chartIndex = state.charts.findIndex(chart => chart.id === id);
      if (chartIndex !== -1) {
        state.charts[chartIndex] = {
          ...state.charts[chartIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    removeChart: (state, action: PayloadAction<string>) => {
      state.charts = state.charts.filter(chart => chart.id !== action.payload);
      // Close config panel if the deleted chart was being edited
      if (state.editingChartId === action.payload) {
        state.isConfigPanelOpen = false;
        state.editingChartId = null;
      }
    },
    
    reorderCharts: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [removedChart] = state.charts.splice(fromIndex, 1);
      state.charts.splice(toIndex, 0, removedChart);
    },
    
    // Configuration Panel Management
    openConfigPanel: (state, action: PayloadAction<string | null>) => {
      state.isConfigPanelOpen = true;
      state.editingChartId = action.payload;
    },
    
    closeConfigPanel: (state) => {
      state.isConfigPanelOpen = false;
      state.editingChartId = null;
    },
    
    // Bulk operations
    importCharts: (state, action: PayloadAction<CustomAnalyticsConfig[]>) => {
      state.charts = action.payload;
    },
    
    clearAllCharts: (state) => {
      state.charts = [];
      state.isConfigPanelOpen = false;
      state.editingChartId = null;
    },
  },
});

export const {
  addChart,
  updateChart,
  removeChart,
  reorderCharts,
  openConfigPanel,
  closeConfigPanel,
  importCharts,
  clearAllCharts,
} = customAnalyticsSlice.actions;

export default customAnalyticsSlice.reducer;
