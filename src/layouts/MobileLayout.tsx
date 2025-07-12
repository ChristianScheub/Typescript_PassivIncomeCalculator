import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Briefcase, BarChart3 } from 'lucide-react';
import { NavLinkItem } from '@/ui/shared/navigation/NavLinkItem';
import { useTranslation } from 'react-i18next';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Hide bottom navigation during setup wizard
  const isSetupWizard = location.pathname === '/setup';
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            <div style={{ height: "5vw" }}> </div>

      {/* Main content */}
      <main className={`flex-1 container mx-auto px-4 py-4 overflow-x-hidden max-w-full ${!isSetupWizard ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {/* Bottom Navigation - Hidden during setup wizard */}
      {!isSetupWizard && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
          <div className="grid grid-cols-3 h-16">
            <NavLinkItem to="/" icon={Home} label={t('navigation.home')} variant="mobile" />
            <NavLinkItem to="/portfolio" icon={Briefcase} label={t('navigation.portfolio')} variant="mobile" />
            <NavLinkItem to="/analytics" icon={BarChart3} label={t('navigation.analytics')} variant="mobile" />
          </div>
        </nav>
      )}
    </div>
  );
};

export default MobileLayout;