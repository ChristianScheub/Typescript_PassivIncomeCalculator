import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Snackbar } from "@mui/material";

// Layouts
import MobileLayout from './layouts/MobileLayout';
import DesktopLayout from './layouts/DesktopLayout';

// Pages
import DashboardContainer from './container/dashboard/DashboardContainer';
import PortfolioHubContainer from './container/portfolio/PortfolioHubContainer';
import AnalyticsHubContainer from './container/analytics/AnalyticsHubContainer';
import SettingsContainer from './container/settings/SettingsContainer';

// Context
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './theme/ThemeProvider';

// Initialization
import { useAppInitialization } from './hooks/useAppInitialization';
import { useAutoPortfolioHistoryUpdate } from './hooks/useAutoPortfolioHistoryUpdate';
import { ErrorScreenAppStart } from '@/ui/appStart/appStartError';
import { LoadingScreenAppStart } from '@/ui/appStart/appStartLoading';
import GlobalSnackbar from './ui/components/GlobalSnackbar';

// Main App Content with initialization check
const AppContent = () => {
  const { isInitialized, isInitializing, initializationError } = useAppInitialization();
  
  // Auto-update portfolio history when assets change
  useAutoPortfolioHistoryUpdate();

  // Show error screen if initialization failed
  if (initializationError) {
    return <ErrorScreenAppStart error={initializationError} />;
  }

  // Show loading screen while initializing
  if (isInitializing || !isInitialized) {
    return <LoadingScreenAppStart />;
  }

  // Detect if mobile view (could be enhanced with a proper hook)
  const isMobile = window.innerWidth < 768;
  const Layout = isMobile ? MobileLayout : DesktopLayout;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardContainer />} />
          <Route path="/portfolio" element={<PortfolioHubContainer />} />
          <Route path="/analytics" element={<AnalyticsHubContainer />} />
          <Route path="/settings" element={<SettingsContainer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppProvider>
        <ThemeProvider>
          <AppContent />
          <GlobalSnackbar /> 
        </ThemeProvider>
      </AppProvider>
    </Provider>
  );
}

export default App;