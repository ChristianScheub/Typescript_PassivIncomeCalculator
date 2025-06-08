import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Layouts
import MobileLayout from './layouts/MobileLayout';
import DesktopLayout from './layouts/DesktopLayout';

// Pages
import DashboardContainer from './container/DashboardContainer';
import AssetsContainer from './container/AssetsContainer';
import LiabilitiesContainer from './container/LiabilitiesContainer';
import ExpensesContainer from './container/ExpensesContainer';
import IncomeContainer from './container/IncomeContainer';
import ForecastContainer from './container/ForecastContainer';
import SettingsContainer from './container/SettingsContainer';
import AssetCalendarContainer from './container/AssetCalendarContainer';

// Context
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  // Detect if mobile view (could be enhanced with a proper hook)
  const isMobile = window.innerWidth < 768;
  const Layout = isMobile ? MobileLayout : DesktopLayout;

  return (
    <Provider store={store}>
      <AppProvider>
        <ThemeProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardContainer />} />
                <Route path="/assets" element={<AssetsContainer />} />
                <Route path="/liabilities" element={<LiabilitiesContainer />} />
                <Route path="/expenses" element={<ExpensesContainer />} />
                <Route path="/income" element={<IncomeContainer />} />
                <Route path="/forecast" element={<ForecastContainer />} />
                <Route path="/settings" element={<SettingsContainer />} />
                <Route path="/asset-calendar" element={<AssetCalendarContainer />} />
                <Route path="*" element={<Navigate to="/\" replace />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </AppProvider>
    </Provider>
  );
}

export default App;