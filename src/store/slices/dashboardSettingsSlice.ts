import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Simple logger for debugging
const log = (message: string) => console.log(`[DashboardSettings] ${message}`);

export type DashboardMode = 'smartSummary' | 'assetFocus';
export type AssetFocusTimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

interface DashboardSettingsState {
  mode: DashboardMode;
  assetFocus: {
    timeRange: AssetFocusTimeRange;
  };
}

const loadedMode = (localStorage.getItem('dashboard_mode') as DashboardMode) || 'smartSummary';
const loadedTimeRange = (localStorage.getItem('asset_focus_time_range') as AssetFocusTimeRange) || '1W';

log(`InitialState: Loading dashboard mode from localStorage: ${loadedMode}`);
log(`InitialState: Loading time range from localStorage: ${loadedTimeRange}`);

const initialState: DashboardSettingsState = {
  mode: loadedMode,
  assetFocus: {
    timeRange: loadedTimeRange,
  },
};

const dashboardSettingsSlice = createSlice({
  name: 'dashboardSettings',
  initialState,
  reducers: {
    setDashboardMode: (state, action: PayloadAction<DashboardMode>) => {
      log(`Setting dashboard mode to: ${action.payload}`);
      state.mode = action.payload;
      // Save to localStorage for persistence
      localStorage.setItem('dashboard_mode', action.payload);
      log(`Saved dashboard mode to localStorage: ${action.payload}`);
    },
    setAssetFocusTimeRange: (state, action: PayloadAction<AssetFocusTimeRange>) => {
      state.assetFocus.timeRange = action.payload;
      // Save to localStorage for persistence
      localStorage.setItem('asset_focus_time_range', action.payload);
    },
    loadDashboardSettingsFromStorage: (state) => {
      const savedMode = localStorage.getItem('dashboard_mode') as DashboardMode;
      const savedTimeRange = localStorage.getItem('asset_focus_time_range') as AssetFocusTimeRange;
      
      log(`Loading from localStorage - mode: ${savedMode}, timeRange: ${savedTimeRange}`);
      
      if (savedMode && (savedMode === 'smartSummary' || savedMode === 'assetFocus')) {
        log(`Setting mode from localStorage: ${savedMode}`);
        state.mode = savedMode;
      } else {
        log(`No valid mode in localStorage, using default: ${state.mode}`);
      }
      
      if (savedTimeRange && ['1D', '1W', '1M', '3M', '1Y', 'ALL'].includes(savedTimeRange)) {
        state.assetFocus.timeRange = savedTimeRange;
      }
    },
  },
});

export const { 
  setDashboardMode, 
  setAssetFocusTimeRange, 
  loadDashboardSettingsFromStorage 
} = dashboardSettingsSlice.actions;

export default dashboardSettingsSlice.reducer;
