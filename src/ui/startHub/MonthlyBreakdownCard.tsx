import React from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  CreditCard,
} from "lucide-react";
import formatService from "@service/infrastructure/formatService";
import { useTranslation } from "react-i18next";

interface MonthlyBreakdownCardProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
}

const MonthlyBreakdownCard: React.FC<MonthlyBreakdownCardProps> = ({
  monthlyIncome,
  monthlyExpenses,
  monthlyLiabilityPayments,
  monthlyAssetIncome,
  passiveIncome,
  monthlyCashFlow,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-start space-x-2">
        <ArrowUpCircle className="text-emerald-500 mt-1" size={18} />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.income")}
          </p>
          <p className="text-lg font-semibold">
            {formatService.formatCurrency(monthlyIncome)}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
            <Wallet size={12} className="mr-1 text-purple-500" />
            <span>
              {formatService.formatCurrency(passiveIncome)}{" "}
              {t("dashboard.passive")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <ArrowUpCircle className="text-blue-500 mt-1" size={18} />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.assetIncome")}
          </p>
          <p className="text-lg font-semibold">
            {formatService.formatCurrency(monthlyAssetIncome)}
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t("dashboard.fromDividendsAndRental")}
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <ArrowDownCircle className="text-red-500 mt-1" size={18} />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.expenses")}
          </p>
          <p className="text-lg font-semibold">
            {formatService.formatCurrency(monthlyExpenses)}
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <CreditCard className="text-red-500 mt-1" size={18} />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.liabilities")}
          </p>
          <p className="text-lg font-semibold">
            {formatService.formatCurrency(monthlyLiabilityPayments)}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
        <div className="flex items-start space-x-2">
          <div
            className={`p-1 rounded-full mt-1 ${
              monthlyCashFlow >= 0
                ? "bg-emerald-100 dark:bg-emerald-900"
                : "bg-red-100 dark:bg-red-900"
            }`}
          >
            {monthlyCashFlow >= 0 ? (
              <ArrowUpCircle className="text-emerald-500" size={16} />
            ) : (
              <ArrowDownCircle className="text-red-500" size={16} />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("dashboard.monthlyCashFlow")}
            </p>
            <p
              className={`text-lg font-semibold ${
                monthlyCashFlow >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {formatService.formatCurrency(monthlyCashFlow)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBreakdownCard;
