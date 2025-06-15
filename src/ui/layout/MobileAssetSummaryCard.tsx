import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getDynamicFontSize } from "../../service/helper/fontSizeHelper";
import formatService from "../../service/formatService";
import {
  Calendar,
  Wallet,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MobileAssetSummaryCardProps {
  totalAssetValue: number;
  monthlyAssetIncome: number;
  annualAssetIncome: number;
  onNavigateToCalendar: () => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToPortfolioHistory?: () => void;
}

export const MobileAssetSummaryCard: React.FC<MobileAssetSummaryCardProps> = ({
  totalAssetValue,
  monthlyAssetIncome,
  annualAssetIncome,
  onNavigateToCalendar,
  onNavigateToAnalytics,
  onNavigateToPortfolioHistory
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="sm:hidden">
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Combined Income Card */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-800 dark:to-purple-900 border-2 border-blue-600 dark:border-blue-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header with Toggle */}
          <div
            className="p-6 cursor-pointer hover:bg-white/5 transition-colors duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white break-words">
                  Portfolio Übersicht
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="bg-white bg-opacity-20 p-2.5 sm:p-3 rounded-full flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToCalendar();
                  }}
                >
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded-full flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-white" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Content */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isExpanded
                ? "max-h-[500px] opacity-100 pb-6 px-6"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="space-y-4">
              {/* Gesamtwert */}
              <div 
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800 shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToPortfolioHistory?.();
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 p-2.5 rounded-xl flex-shrink-0 shadow-lg">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                        {t("assets.totalValue")}
                      </span>
                      <div className="text-right sm:text-right">
                        <p
                          className={`${getDynamicFontSize(
                            totalAssetValue
                          )} font-bold text-blue-600 dark:text-blue-400 break-all text-right`}
                        >
                          {formatService.formatCurrency(totalAssetValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monatliches Einkommen */}
              <div
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-green-200 dark:border-green-800 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToCalendar();
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 p-2.5 rounded-xl flex-shrink-0 shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                        {t("assets.monthlyIncome")}
                      </span>
                      <p
                        className={`${getDynamicFontSize(
                          monthlyAssetIncome
                        )} font-bold text-green-500 break-all text-right`}
                      >
                        {formatService.formatCurrency(monthlyAssetIncome)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jährliches Einkommen */}
              <div
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToCalendar();
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500 p-2.5 rounded-xl flex-shrink-0 shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                        {t("assets.annualIncome")}
                      </span>
                      <p
                        className={`${getDynamicFontSize(
                          annualAssetIncome
                        )} font-bold text-purple-500 break-all text-right`}
                      >
                        {formatService.formatCurrency(annualAssetIncome)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
