import React from 'react';
import { NavLink } from 'react-router-dom';
import { NavLinkItem } from '@/ui/shared/navigation/NavLinkItem';
import { Home, Briefcase, BarChart3, Settings, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useAppContext();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm z-10 overflow-x-hidden">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">FinanceTrack</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <NavLinkItem to="/" icon={Home} label={t('navigation.dashboard')} variant="desktop" end />
            <NavLinkItem to="/portfolio" icon={Briefcase} label={t('navigation.portfolio')} variant="desktop" />
            <NavLinkItem to="/analytics" icon={BarChart3} label={t('navigation.analytics')} variant="desktop" />
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <NavLink 
                to="/settings" 
                className={({isActive}) => `flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <Settings className="w-5 h-5 mr-3" />
                {t('navigation.settings')}
              </NavLink>
              
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                aria-label={t('settings.theme')}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 ml-64 overflow-x-hidden">
        <main className="container mx-auto px-6 py-8 overflow-x-hidden max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DesktopLayout;