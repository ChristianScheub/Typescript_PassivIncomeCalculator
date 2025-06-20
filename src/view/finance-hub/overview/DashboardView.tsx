import React from "react";
import { useTranslation } from "react-i18next";
import { CiSettings } from "react-icons/ci";
import formatService from "@service/infrastructure/formatService";
import { useDeviceCheck } from "@service/shared/utilities/helper/useDeviceCheck";
import { IconButton } from "../../../ui/common/IconButton";
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import TotalExpenseCoverage from "../../../ui/milestones/TotalExpenseCoverage";
import PortfolioHistoryCard from "./PortfolioHistoryCard";
import MonthlyBreakdownCard from "./MonthlyBreakdownCard";
import { CollapsibleSection } from "../../../ui/common/CollapsibleSection";
import { QuickActionsCard } from "../../../ui/dashboard/QuickActionsCard";
import { MiniAnalyticsCard } from "../../../ui/dashboard/MiniAnalyticsCard";
import { MilestoneCard } from "../../../ui/dashboard/MilestoneCard";
import { AlertsCard } from "../../../ui/dashboard/AlertsCard";
import { PullToRefresh } from "../../../ui/common/PullToRefresh";
import { FinancialSummary } from "../../../service/analytics/financialAnalyticsService/interfaces/IAnalyticsService";
import { UIAlert } from "../../../service/alertsService/interfaces/IAlertsService";

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  translationKey: string;
  onClick: () => void;
}

interface MiniAnalytic {
  id: string;
  titleKey: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  onClick: () => void;
}

interface Milestone {
  id: string;
  titleKey: string;
  progress: number;
  target: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

interface NavigationHandlers {
  onNavigateToIncome: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToAssets: () => void;
  onNavigateToLiabilities: () => void;
  onNavigateToForecast: () => void;
  onNavigateToSettings: () => void;
}

interface DashboardViewProps {
  financialSummary: FinancialSummary;
  quickActions: QuickAction[];
  miniAnalytics: MiniAnalytic[];
  milestones: Milestone[];
  alerts: UIAlert[];
  history30Days: any[];
  navigationHandlers: NavigationHandlers;
  onRefresh: () => Promise<void>;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  financialSummary,
  quickActions,
  miniAnalytics,
  milestones,
  alerts,
  history30Days,
  navigationHandlers,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();

  const {
    netWorth,
    totalAssets,
    totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlyLiabilityPayments,
    monthlyAssetIncome,
    passiveIncome,
    totalPassiveIncome,
    monthlyCashFlow,
  } = financialSummary;

  return (
    <PullToRefresh
      onRefresh={onRefresh}
      refreshingText={t("dashboard.refreshing") || "Aktualisiere..."}
      pullToRefreshText={
        t("dashboard.pullToRefresh") || "Zum Aktualisieren ziehen"
      }
      releaseToRefreshText={
        t("dashboard.releaseToRefresh") || "Loslassen zum Aktualisieren"
      }
      className="min-h-screen"
    >
      <div className="space-y-6 pb-8 overflow-x-hidden">
        <div style={{ height: "10vw" }}> </div>

        {/* Net Worth Snapshot */}
        <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl p-4 sm:p-6 text-white overflow-hidden">
          <div
            className="absolute inset-0 w-3/4 cursor-pointer z-10"
            onClick={navigationHandlers.onNavigateToForecast}
          />

          <div
            className="absolute inset-y-0 right-0 w-1/4 cursor-pointer z-10"
            onClick={navigationHandlers.onNavigateToSettings}
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

          <IconButton
            icon={<CiSettings className="w-5 h-5" />}
            className="absolute top-4 right-4 z-20 pointer-events-none bg-white bg-opacity-20 hover:bg-opacity-30"
            variant="ghost"
            size="icon"
            aria-label="Settings"
          />
        </div>

        {/* Quick Actions */}
        <QuickActionsCard actions={quickActions} />

        {/* Mini Analytics */}
        <CollapsibleSection
          title={t("dashboard.miniAnalytics")}
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          defaultExpanded={true}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {miniAnalytics.map((analytic) => (
              <MiniAnalyticsCard
                key={analytic.id}
                title={t(analytic.titleKey)}
                value={analytic.value}
                icon={
                  isDesktop ? (
                    <analytic.icon
                      className={`h-4 w-4 ${analytic.colorClass}`}
                    />
                  ) : undefined
                }
                color={analytic.colorClass}
                onClick={analytic.onClick}
              />
            ))}
          </div>
        </CollapsibleSection>

        {/* Milestones */}
        <MilestoneCard
          title={t("dashboard.activeMilestones")}
          milestones={milestones.map((milestone) => ({
            title: t(milestone.titleKey),
            progress: milestone.progress,
            target: milestone.target,
            color: milestone.color,
            icon: milestone.icon,
            onClick: milestone.onClick,
          }))}
          icon={<Target className="h-5 w-5 text-green-500" />}
        />

        {/* Monthly Breakdown */}
        <CollapsibleSection
          title={t("dashboard.monthlyOverview")}
          icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
          defaultExpanded={false}
        >
          <MonthlyBreakdownCard
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            monthlyLiabilityPayments={monthlyLiabilityPayments}
            monthlyAssetIncome={monthlyAssetIncome}
            passiveIncome={passiveIncome}
            monthlyCashFlow={monthlyCashFlow}
          />
        </CollapsibleSection>

        {/* Portfolio History */}
        {history30Days.length > 0 && (
          <CollapsibleSection
            title={t("dashboard.portfolioHistory")}
            icon={<BarChart3 className="h-5 w-5 text-indigo-500" />}
            defaultExpanded={false}
          >
            <PortfolioHistoryCard history30Days={history30Days} />
          </CollapsibleSection>
        )}

        {/* Alerts & Recommendations */}
        <CollapsibleSection
          title={t("dashboard.alertsRecommendations")}
          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
          defaultExpanded={false}
        >
          <AlertsCard alerts={alerts} />
        </CollapsibleSection>

        {/* Total Expense Coverage */}
        <CollapsibleSection
          title={t("forecast.milestones.totalExpenseCoverage.title")}
          icon={<Target className="h-5 w-5 text-green-500" />}
          defaultExpanded={false}
        >
          <TotalExpenseCoverage
            monthlyPassiveIncome={totalPassiveIncome}
            monthlyExpenses={monthlyExpenses}
            monthlyLiabilityPayments={monthlyLiabilityPayments}
          />
        </CollapsibleSection>
      </div>
    </PullToRefresh>
  );
};

export default DashboardView;
