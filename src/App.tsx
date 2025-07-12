import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Layouts
import MobileLayout from './layouts/MobileLayout';
import DesktopLayout from './layouts/DesktopLayout';

// Pages
import DashboardContainer from './container/dashboard/DashboardContainer';
import SettingsContainer from './container/settings/SettingsContainer';
import SetupWizardContainer from './container/setupWizard/SetupWizardContainer';

// Context
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './theme/ThemeProvider';

// Initialization
import { useAppInitialization } from './hooks/useAppInitialization';
import { useAutoPortfolioHistoryUpdate } from './hooks/useAutoPortfolioHistoryUpdate';
import { ErrorScreenAppStart } from '@/ui/shared/appStart/appStartError';
import { LoadingScreenAppStart } from '@/ui/shared/appStart/appStartLoading';
import GlobalSnackbar from '@/ui/shared/GlobalSnackbar';
import { useDeviceCheck } from '@/service/shared/utilities/helper/useDeviceCheck';
import PortfolioHubContainer from './container/portfolioHub/portfolio/PortfolioHubContainer';
import AnalyticsHubContainer from './container/analyticsHub/AnalyticsHubContainer';

// Main App Content with initialization check
const AppContent = () => {
  const { isInitialized, isInitializing, initializationError } = useAppInitialization();
  const isDesktop = useDeviceCheck();
  
  // Auto-update portfolio history when assets change
  useAutoPortfolioHistoryUpdate();

  if (initializationError) {
    return <ErrorScreenAppStart error={initializationError} />;
  }

  if (isInitializing || !isInitialized) {
    return <LoadingScreenAppStart />;
  }

  // Render the appropriate layout
  const Layout = isDesktop ? DesktopLayout : MobileLayout;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardContainer />} />
        <Route path="/portfolio" element={<PortfolioHubContainer />} />
        <Route path="/analytics" element={<AnalyticsHubContainer />} />
        <Route path="/settings" element={<SettingsContainer />} />
        <Route path="/setup" element={<SetupWizardContainer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppProvider>
        <ThemeProvider>
          <Router>
            <AppContent />
            <GlobalSnackbar />
          </Router>
        </ThemeProvider>
      </AppProvider>
    </Provider>
  );
}

export default App;