import React from "react";
import { useTranslation } from "react-i18next";
import { Target } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../ui/shared/Card";
import { ViewHeader } from "../../../ui/shared/ViewHeader";
import { DebtEntry, DebtWithCoverage } from "../../../types/domains/financial/calculations";
import { BufferMilestone,TotalExpenseCoverage,LeisureMilestone,FixedCostFreedom,DebtCoverage,DebtBreaker } from "@/ui/portfolioHub";

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
            monthlyLiabilityPayments={monthlyLiabilityPayments}
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
