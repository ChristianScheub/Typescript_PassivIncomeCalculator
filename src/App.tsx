import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

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

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading application...</p>
    </div>
  </div>
);

// Error component
const ErrorScreen = ({ error }: { error: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Initialization Error</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Main App Content with initialization check
const AppContent = () => {
  const { isInitialized, isInitializing, initializationError } = useAppInitialization();

  // Show error screen if initialization failed
  if (initializationError) {
    return <ErrorScreen error={initializationError} />;
  }

  // Show loading screen while initializing
  if (isInitializing || !isInitialized) {
    return <LoadingScreen />;
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
        </ThemeProvider>
      </AppProvider>
    </Provider>
  );
}

export default App;