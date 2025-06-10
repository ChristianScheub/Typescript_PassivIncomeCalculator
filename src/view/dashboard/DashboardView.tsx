import React from "react";
import { useTranslation } from "react-i18next";
import { CiSettings } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import formatService from '../../service/formatService';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";
import TotalExpenseCoverage from "../../ui/milestones/TotalExpenseCoverage";

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
  handleSettingsClick: () => void;
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
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();


  return (
    <div className="space-y-6 pb-8 overflow-x-hidden">
      <div style={{ height: "10vw" }}> </div>

      <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl p-4 sm:p-6 text-white overflow-hidden">
        <div
          className="absolute inset-0 w-3/4 cursor-pointer z-10"
          onClick={() => navigate("/forecast")}
        />

        <div
          className="absolute inset-y-0 right-0 w-1/4 cursor-pointer z-10"
          onClick={handleSettingsClick}
        />

        <div className="relative z-0">
          <h2 className="text-base sm:text-lg font-medium opacity-90 truncate">
            {t("dashboard.netWorth")}
          </h2>
          <div className="text-2xl sm:text-4xl font-bold mb-2 truncate">
            {formatService.formatCurrency(netWorth)}
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm">
            <div className="flex items-center space-x-1 min-w-0">
              <TrendingUp size={14} className="flex-shrink-0" />
              <span className="truncate">
                {t("dashboard.totalAssets")}:{" "}
                {formatService.formatCurrency(totalAssets)}
              </span>
            </div>
            <div className="flex items-center space-x-1 min-w-0">
              <TrendingDown size={14} className="flex-shrink-0" />
              <span className="truncate">
                {t("dashboard.totalLiabilities")}:{" "}
                {formatService.formatCurrency(totalLiabilities)}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Button */}
        <button className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all z-20 pointer-events-none">
          <CiSettings className="w-5 h-5" />
        </button>
      </div>

      {/* Monthly Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-hidden">
        <h3 className="text-lg font-semibold mb-4">
          {t("dashboard.monthlyOverview")}
        </h3>

        <div className="grid grid-cols-2 gap-4 overflow-x-hidden">
          <div
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate("/income")}
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <ArrowUpCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {t("dashboard.income")}
              </p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-green-600 dark:text-green-400 truncate">
                {formatService.formatCurrency(monthlyIncome)}
              </p>
              <p className="text-xs text-gray-400 truncate hidden sm:block">
                {formatService.formatCurrency(monthlyIncome)}{" "}
                {t("dashboard.passive")}
              </p>
            </div>
          </div>

          <div
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate("/assets")}
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {t("dashboard.assets")}
              </p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-blue-600 dark:text-blue-400 truncate">
                {formatService.formatCurrency(monthlyAssetIncome)}
              </p>
              <p className="text-xs text-gray-400 truncate hidden sm:block">
                {t("dashboard.fromDividends")}
              </p>
            </div>
          </div>

          <div
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate("/expenses")}
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
              <ArrowDownCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {t("dashboard.expenses")}
              </p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-red-600 dark:text-red-400 truncate">
                {formatService.formatCurrency(monthlyExpenses)}
              </p>
            </div>
          </div>

          <div
            className="flex items-center space-x-2 sm:space-x-3 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => navigate("/liabilities")}
          >
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                {t("dashboard.liabilities")}
              </p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-purple-600 dark:text-purple-400 truncate">
                {formatService.formatCurrency(monthlyLiabilityPayments)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t("dashboard.monthlyCashFlow")}
            </span>
            <span
              className={`text-lg font-bold ${
                monthlyCashFlow >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {monthlyCashFlow >= 0 ? "+" : ""}
              {formatService.formatCurrency(monthlyCashFlow)}
            </span>
          </div>
        </div>
      </div>

      <TotalExpenseCoverage
        monthlyPassiveIncome={passiveIncome + monthlyAssetIncome}
        monthlyExpenses={monthlyExpenses}
        monthlyLiabilityPayments={monthlyLiabilityPayments}
      />
    </div>
  );
};

export default DashboardView;
