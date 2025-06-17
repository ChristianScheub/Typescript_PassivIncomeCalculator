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
                <Route path="/portfolio" element={<PortfolioHubContainer />} />
                <Route path="/analytics" element={<AnalyticsHubContainer />} />
                <Route path="/settings" element={<SettingsContainer />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </AppProvider>
    </Provider>
  );
}

export default App;