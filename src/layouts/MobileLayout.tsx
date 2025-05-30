import React from 'react';
import { Home, Wallet, Landmark, ReceiptText, CreditCard, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">FinanceTrack</h1>
          <div className="flex items-center space-x-3">
            <NavLink to="/settings" className={({isActive}) => `p-1 rounded-full ${isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              <Settings size={20} />
            </NavLink>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-4 pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
        <div className="grid grid-cols-5 h-16">
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <Home size={20} />
            <span className="text-xs mt-1">{t('navigation.home')}</span>
          </NavLink>
          <NavLink to="/assets" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <Wallet size={20} />
            <span className="text-xs mt-1">{t('navigation.assets')}</span>
          </NavLink>
          <NavLink to="/liabilities" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <Landmark size={20} />
            <span className="text-xs mt-1">{t('navigation.debts')}</span>
          </NavLink>
          <NavLink to="/expenses" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <ReceiptText size={20} />
            <span className="text-xs mt-1">{t('navigation.expenses')}</span>
          </NavLink>
          <NavLink to="/income" className={({isActive}) => `flex flex-col items-center justify-center ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
            <CreditCard size={20} />
            <span className="text-xs mt-1">{t('navigation.income')}</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;