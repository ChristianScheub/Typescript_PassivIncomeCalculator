import React from "react";
import { useTranslation } from "react-i18next";
import { useDeviceCheck } from "@service/shared/utilities/helper/useDeviceCheck";
import { TrendingUp, Target, AlertTriangle, BarChart3 } from "lucide-react";
import { TotalExpenseCoverage } from "@ui/portfolioHub";
import PortfolioHistoryCard from "../../../ui/startHub/PortfolioHistoryCard";
import MonthlyBreakdownCard from "../../../ui/startHub/MonthlyBreakdownCard";
import { CollapsibleSection, MiniAnalyticsCard } from "@ui/shared";
import {
  QuickActionsCard,
  MilestoneCard,
  AlertsCard,
  PullToRefresh,
  NetWorthSnapshot,
} from "@ui/startHub";
import { FinancialSummary, UIAlert } from "@/types/domains/analytics/reporting";

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
  navigationHandlers: NavigationHandlers;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  portfolioHistory?: Array<{
    date: string;
    totalValue: number;
    change: number;
    changePercentage: number;
  }>;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  financialSummary,
  quickActions,
  miniAnalytics,
  milestones,
  alerts,
  navigationHandlers,
  onRefresh,
  isRefreshing,
  portfolioHistory = [],
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
      isRefreshing={isRefreshing}
      className="min-h-screen"
    >
      <div className="space-y-6 pb-8 overflow-x-hidden">
        <div style={{ height: "10vw" }}> </div>

        {/* Net Worth Snapshot */}
        <NetWorthSnapshot
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          onNavigateToForecast={navigationHandlers.onNavigateToForecast}
          onNavigateToSettings={navigationHandlers.onNavigateToSettings}
        />

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
        <CollapsibleSection
          title={t("dashboard.activeMilestones")}
          icon={<Target className="h-5 w-5 text-green-500" />}
          defaultExpanded={true}
        >
          <MilestoneCard
            milestones={milestones.map((milestone) => ({
              title: t(milestone.titleKey),
              progress: milestone.progress,
              target: milestone.target,
              color: milestone.color,
              icon: milestone.icon,
              onClick: milestone.onClick,
            }))}
          />
        </CollapsibleSection>

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
        <CollapsibleSection
          title={t("dashboard.portfolioHistory")}
          icon={<BarChart3 className="h-5 w-5 text-indigo-500" />}
          defaultExpanded={false}
        >
          <PortfolioHistoryCard
            history={portfolioHistory.map((point, index) => ({
              date: point.date,
              value: point.totalValue,
              change:
                index > 0
                  ? point.totalValue - portfolioHistory[index - 1].totalValue
                  : 0,
              changePercentage:
                index > 0 && portfolioHistory[index - 1].totalValue > 0
                  ? ((point.totalValue -
                      portfolioHistory[index - 1].totalValue) /
                      portfolioHistory[index - 1].totalValue) *
                    100
                  : 0,
            }))}
          />
        </CollapsibleSection>

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
