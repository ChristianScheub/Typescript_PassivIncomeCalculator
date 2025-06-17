import React from 'react';
import { Home, Wallet, Landmark, ReceiptText, CreditCard, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            <div style={{ height: "5vw" }}> </div>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-4 pb-20 overflow-x-hidden max-w-full">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
        <div className="grid grid-cols-6 h-16">
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <Home size={18} />
            <span className="text-xs mt-1">{t('navigation.home')}</span>
          </NavLink>
          <NavLink to="/assets" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <Wallet size={18} />
            <span className="text-xs mt-1">{t('navigation.assets')}</span>
          </NavLink>
          <NavLink to="/liabilities" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <Landmark size={18} />
            <span className="text-xs mt-1">{t('navigation.debts')}</span>
          </NavLink>
          <NavLink to="/expenses" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <ReceiptText size={18} />
            <span className="text-xs mt-1">{t('navigation.expenses')}</span>
          </NavLink>
          <NavLink to="/income" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <CreditCard size={18} />
            <span className="text-xs mt-1">{t('navigation.income')}</span>
          </NavLink>
          <NavLink to="/analytics" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <BarChart3 size={18} />
            <span className="text-xs mt-1">{t('navigation.analytics')}</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;