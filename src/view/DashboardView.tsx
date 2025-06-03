import React from "react";
import { useTranslation } from "react-i18next";
import { CiSettings } from "react-icons/ci";
import { AssetAllocation } from "../types";
import { StockInfo } from "../types/stock";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  LineChart
} from "lucide-react";
import formatService from "../service/formatService";
import TotalExpenseCoverage from "../ui/milestones/TotalExpenseCoverage";

interface DashboardViewProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
  passiveIncomeRatio: number;
  stockInfo: StockInfo | null;
  isLoadingStock: boolean;
  handleSettingsClick: () => void;
  handleFetchStock: () => void;
  assetAllocation: AssetAllocation[];
}

const DashboardView: React.FC<DashboardViewProps> = ({
  netWorth,
  totalAssets,
  totalLiabilities,
  monthlyIncome,
  monthlyExpenses,
  monthlyLiabilityPayments,
  monthlyAssetIncome,
  passiveIncome,
  monthlyCashFlow,
  handleSettingsClick,
  stockInfo,
  isLoadingStock,
  handleFetchStock
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-8 overflow-x-hidden">
            <div style={{ height: "10vw" }}> </div>

      <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl p-4 sm:p-6 text-white overflow-hidden">
        <div 
          className="absolute inset-0 w-3/4 cursor-pointer z-10" 
          onClick={() => navigate('/forecast')}
        />
        
        <div 
          className="absolute inset-y-0 right-0 w-1/4 cursor-pointer z-10" 
          onClick={handleSettingsClick}
        />
        
        <div className="relative z-0">
          <h2 className="text-base sm:text-lg font-medium opacity-90 truncate">{t('dashboard.netWorth')}</h2>
          <div className="text-2xl sm:text-4xl font-bold mb-2 truncate">
            {formatService.formatCurrency(netWorth)}
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm">
            <div className="flex items-center space-x-1 min-w-0">
              <TrendingUp size={14} className="flex-shrink-0" />
              <span className="truncate">{t('dashboard.totalAssets')}: {formatService.formatCurrency(totalAssets)}</span>
            </div>
            <div className="flex items-center space-x-1 min-w-0">
              <TrendingDown size={14} className="flex-shrink-0" />
              <span className="truncate">{t('dashboard.totalLiabilities')}: {formatService.formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </div>
        
        {/* Settings Button */}
        <button 
          className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all z-20 pointer-events-none"
        >
          <CiSettings className="w-5 h-5" />
        </button>
      </div>

      {/* Monatliche Übersicht */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-hidden">
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.monthlyOverview')}</h3>
        
        {/* Stock Info Section */}
        <div className="mb-6">
          <button
            onClick={handleFetchStock}
            className="mb-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoadingStock}
          >
            <LineChart className="w-4 h-4 mr-2" />
            {isLoadingStock ? t('common.loading') : t('dashboard.fetchAAPL')}
          </button>
          
          {stockInfo && !stockInfo.error && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Symbol</div>
                <div className="font-semibold">{stockInfo.symbol}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Current Price</div>
                <div className="font-semibold">{formatService.formatCurrency(stockInfo.price || 0)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Change</div>
                <div className={`font-semibold ${(stockInfo.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockInfo.change ? `${stockInfo.change >= 0 ? '+' : ''}${stockInfo.change.toFixed(2)}` : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Change %</div>
                <div className={`font-semibold ${(stockInfo.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockInfo.changePercent ? `${stockInfo.changePercent >= 0 ? '+' : ''}${stockInfo.changePercent.toFixed(2)}%` : '-'}
                </div>
              </div>
            </div>
          )}
          
          {stockInfo?.error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2">
                <div className="text-red-600 dark:text-red-400">
                  ⚠️ {stockInfo.error}
                </div>
              </div>
              {stockInfo.needsApiKey && (
                <button
                  onClick={handleSettingsClick}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:text-red-700 dark:hover:text-red-300"
                >
                  Go to Settings to configure API key
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-x-hidden">
          {/* Einkommen */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate('/income')}
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <ArrowUpCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{t('dashboard.income')}</p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-green-600 dark:text-green-400 truncate">
                {formatService.formatCurrency(monthlyIncome)}
              </p>
              <p className="text-xs text-gray-400 truncate hidden sm:block">{formatService.formatCurrency(monthlyIncome)} {t('dashboard.passive')}</p>
            </div>
          </div>

          {/* Vermögen */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate('/assets')}
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Vermögen</p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-blue-600 dark:text-blue-400 truncate">
                {formatService.formatCurrency(monthlyAssetIncome)}
              </p>
              <p className="text-xs text-gray-400 truncate hidden sm:block">{t('dashboard.fromDividends')}</p>
            </div>
          </div>

          {/* Ausgaben */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate('/expenses')}
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
              <ArrowDownCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{t('dashboard.expenses')}</p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-red-600 dark:text-red-400 truncate">
                {formatService.formatCurrency(monthlyExpenses)}
              </p>
            </div>
          </div>

          {/* Verbindlichkeiten */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate('/liabilities')}
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Verbindlichkeiten</p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-purple-600 dark:text-purple-400 truncate">
                {formatService.formatCurrency(monthlyLiabilityPayments)}
              </p>
            </div>
          </div>
        </div>

        {/* Monatlicher Cashflow */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('dashboard.monthlyCashFlow')}</span>
            <span className={`text-lg font-bold ${monthlyCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {monthlyCashFlow >= 0 ? '+' : ''}{formatService.formatCurrency(monthlyCashFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Ausgaben-Deckung mit TotalExpenseCoverage Komponente */}
      <TotalExpenseCoverage
        monthlyPassiveIncome={passiveIncome + monthlyAssetIncome}
        monthlyExpenses={monthlyExpenses}
        monthlyLiabilityPayments={monthlyLiabilityPayments}
      />

      {/* Assetkalender Button */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-hidden">
        <button 
          onClick={() => navigate('/asset-calendar')}
          className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] max-w-full overflow-hidden"
        >
          <BarChart3 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold truncate">Assetkalender</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardView;
