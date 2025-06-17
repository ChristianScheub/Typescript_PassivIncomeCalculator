import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Landmark, ReceiptText, CreditCard, LineChart, BarChart3, Settings, Sun, Moon } from 'lucide-react';
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
            <NavLink 
              to="/" 
              className={({isActive}) => `flex items-center px-2 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
              end
            >
              <Home className="w-5 h-5 mr-3" />
              {t('navigation.dashboard')}
            </NavLink>
            <NavLink 
              to="/assets" 
              className={({isActive}) => `flex items-center px-2 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <Wallet className="w-5 h-5 mr-3" />
              {t('navigation.assets')}
            </NavLink>
            <NavLink 
              to="/liabilities" 
              className={({isActive}) => `flex items-center px-2 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <Landmark className="w-5 h-5 mr-3" />
              {t('navigation.liabilities')}
            </NavLink>
            <NavLink 
              to="/expenses" 
              className={({isActive}) => `flex items-center px-2 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <ReceiptText className="w-5 h-5 mr-3" />
              {t('navigation.expenses')}
            </NavLink>
            <NavLink 
              to="/income" 
              className={({isActive}) => `flex items-center px-2 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <CreditCard className="w-5 h-5 mr-3" />
              {t('navigation.income')}
            </NavLink>
            <NavLink 
              to="/forecast" 
              className={({isActive}) => `flex items-center px-2 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <LineChart className="w-5 h-5 mr-3" />
              {t('navigation.forecast')}
            </NavLink>
            <NavLink 
              to="/analytics" 
              className={({isActive}) => `flex items-center px-2 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              {t('navigation.analytics')}
            </NavLink>
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