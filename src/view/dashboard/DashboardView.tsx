import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CiSettings } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import formatService from '../../service/formatService';
import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import TotalExpenseCoverage from "../../ui/milestones/TotalExpenseCoverage";
import PortfolioHistoryCard from "./PortfolioHistoryCard";
import MonthlyBreakdownCard from "./MonthlyBreakdownCard";
import { useAppSelector, useAppDispatch } from "../../hooks/redux";
import { calculate30DayHistory } from "../../store/slices/portfolioHistorySlice";

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
  const dispatch = useAppDispatch();
  const { history30Days = [], status } = useAppSelector((state: any) => state.portfolioHistory || {});

  // Calculate history only when component mounts
  useEffect(() => {
    const calculateHistory = async () => {
      if (status === 'idle') {
        await dispatch(calculate30DayHistory());
      }
    };
    calculateHistory();
  }, [dispatch, status]);


  return (
    <div className="space-y-6 pb-8 overflow-x-hidden">
      <div style={{ height: "10vw" }}> </div>
      {/* Net Worth Summary */}
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

        <MonthlyBreakdownCard
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          monthlyLiabilityPayments={monthlyLiabilityPayments}
          monthlyAssetIncome={monthlyAssetIncome}
          passiveIncome={passiveIncome}
          monthlyCashFlow={monthlyCashFlow}
        />
      </div>
      
      {/* Portfolio History */}
      {history30Days.length > 0 && (
        <div className="mt-6">
          <PortfolioHistoryCard history30Days={history30Days} />
        </div>
      )}

      {/* Total Expense Coverage */}
      <div className="mt-6">
        <TotalExpenseCoverage
          monthlyPassiveIncome={passiveIncome + monthlyAssetIncome}
          monthlyExpenses={monthlyExpenses}
          monthlyLiabilityPayments={monthlyLiabilityPayments}
        />
      </div>
    </div>
  );
};

export default DashboardView;
