import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

// Layouts
import MobileLayout from "./layouts/MobileLayout";
import DesktopLayout from "./layouts/DesktopLayout";

// Pages
import DashboardContainer from "./container/dashboard/DashboardContainer";
import SettingsContainer from "./container/settings/SettingsContainer";
import SetupWizardContainer from "./container/setupWizard/SetupWizardContainer";

// Context
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./theme/ThemeProvider";

// Initialization
import { useAppInitialization } from "./hooks/useAppInitialization";
import { useAutoPortfolioHistoryUpdate } from "./hooks/useAutoPortfolioHistoryUpdate";
import { useSetupStatus } from "./hooks/useSetupStatus";
import { ErrorScreenAppStart } from "@/ui/shared/appStart/appStartError";
import { LoadingScreenAppStart } from "@/ui/shared/appStart/appStartLoading";
import GlobalSnackbar from "@/ui/shared/GlobalSnackbar";
import { useDeviceCheck } from "@/service/shared/utilities/helper/useDeviceCheck";
import PortfolioHubContainer from "./container/portfolioHub/portfolio/PortfolioHubContainer";
import AnalyticsHubContainer from "./container/analyticsHub/AnalyticsHubContainer";
import { featureFlag_SetupWizzard } from "./config/featureFlags";
import Datenschutz from "./legal/datenschutz";
import Impressum from "./legal/impressum";

const AppContent = () => {
  const { isInitialized, isInitializing, initializationError } =
    useAppInitialization();
  const { isFirstTimeUser, isCheckingSetup } = useSetupStatus();
  const isDesktop = useDeviceCheck();
  useAutoPortfolioHistoryUpdate();

  if (initializationError) {
    return <ErrorScreenAppStart error={initializationError} />;
  }

  if (isInitializing || !isInitialized || isCheckingSetup) {
    return <LoadingScreenAppStart />;
  }

  const Layout = isDesktop ? DesktopLayout : MobileLayout;

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            isFirstTimeUser && featureFlag_SetupWizzard ? (
              <Navigate to="/setup" replace />
            ) : (
              <DashboardContainer />
            )
          }
        />
        <Route path="/portfolio" element={<PortfolioHubContainer />} />
        <Route path="/analytics" element={<AnalyticsHubContainer />} />
        <Route path="/settings" element={<SettingsContainer />} />
        <Route path="/dataPrivacy" element={<Datenschutz />} />
        <Route path="/imprint" element={<Impressum />} />
        <Route
          path="/setup"
          element={
            !isFirstTimeUser ? (
              <Navigate to="/" replace />
            ) : (
              <SetupWizardContainer />
            )
          }
        />
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
