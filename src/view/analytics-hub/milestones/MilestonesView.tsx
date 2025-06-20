import React from "react";
import { useTranslation } from "react-i18next";
import { Target } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../ui/common/Card";
import { ViewHeader } from "../../../ui/layout/ViewHeader";
import BufferMilestone from "../../../ui/milestones/BufferMilestone";
import DebtBreaker from "../../../ui/milestones/DebtBreaker";
import DebtCoverage from "../../../ui/milestones/DebtCoverage";
import FixedCostFreedom from "../../../ui/milestones/FixedCostFreedom";
import LeisureMilestone from "../../../ui/milestones/LeisureMilestone";
import TotalExpenseCoverage from "../../../ui/milestones/TotalExpenseCoverage";
import { DebtEntry, DebtWithCoverage } from "../../../types/domains/financial/calculations";

interface MilestonesViewProps {
  liquidAssets: number;
  monthlyTotalExpenses: number;
  debts: DebtEntry[];
  totalProgress: number;
  debtCoverageData: DebtWithCoverage[];
  totalCoverage: number;
  monthlyLiabilityPayments: number;
  monthlyPassiveIncome: number;
  monthlyFixedCosts: number;
  monthlyLeisureExpenses: number;
  onBack?: () => void;
}

const MilestonesView: React.FC<MilestonesViewProps> = ({
  liquidAssets,
  monthlyTotalExpenses,
  debts,
  totalProgress,
  debtCoverageData,
  totalCoverage,
  monthlyLiabilityPayments,
  monthlyPassiveIncome,
  monthlyFixedCosts,
  monthlyLeisureExpenses,
  onBack,
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {onBack && (
          <ViewHeader
            title={t("milestones.title")}
            subtitle={t("milestones.subtitle")}
            onBack={onBack}
          />
        )}

        <div className="space-y-6 mt-8">
          {/* Progress Overview */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>{t("milestones.progressOverview")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(totalProgress, 100)}%` }}
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(totalProgress)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Overview Card */}
          <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6" />
                {t("milestones.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {(
                      (monthlyPassiveIncome /
                        Math.max(monthlyTotalExpenses, 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-sm opacity-90">
                    {t("milestones.expenseCoverage")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {totalProgress.toFixed(1)}%
                  </div>
                  <div className="text-sm opacity-90">
                    {t("milestones.debtProgress")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {(liquidAssets / Math.max(monthlyTotalExpenses, 1)).toFixed(
                      1
                    )}
                  </div>
                  <div className="text-sm opacity-90">
                    {t("milestones.monthsBuffer")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {(
                      (monthlyPassiveIncome / Math.max(monthlyFixedCosts, 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-sm opacity-90">
                    {t("milestones.fixedCosts")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buffer Milestone */}
          <BufferMilestone
            liquidAssets={liquidAssets}
            monthlyTotalExpenses={monthlyTotalExpenses}
          />

          {/* Debt and Coverage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DebtBreaker debts={debts} totalProgress={totalProgress} />
            <DebtCoverage
              debts={debtCoverageData}
              totalCoverage={totalCoverage}
              totalMonthlyPayments={monthlyLiabilityPayments}
            />
          </div>

          {/* Leisure Milestone */}
          <LeisureMilestone
            monthlyPassiveIncome={monthlyPassiveIncome}
            monthlyLeisureExpenses={monthlyLeisureExpenses}
          />

          {/* Fixed Cost Freedom */}
          <FixedCostFreedom
            monthlyPassiveIncome={monthlyPassiveIncome}
            monthlyFixedCosts={monthlyFixedCosts}
          />

          {/* Total Expense Coverage */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-full">
                  <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle>
                  {t("forecast.milestones.totalExpenseCoverage.title")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <TotalExpenseCoverage
                monthlyPassiveIncome={monthlyPassiveIncome}
                monthlyExpenses={monthlyTotalExpenses}
                monthlyLiabilityPayments={monthlyLiabilityPayments}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MilestonesView;
