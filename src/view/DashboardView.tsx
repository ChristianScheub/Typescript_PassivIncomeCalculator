import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { CiSettings } from "react-icons/ci";
import MonthlyBreakdownCard from "./MonthlyBreakdownCard";
import NetWorthCard from "./NetWorthCard";
import AssetAllocationChart from "../ui/pieCharts/PieChartAssetAllocation";
import { Asset, Income, Expense, Liability, AssetAllocation } from "../types";
import { useNavigate } from "react-router-dom";
import { LineChart } from "lucide-react";

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
  assets: Asset[];
  liabilities: Liability[];
  expenses: Expense[];
  income: Income[];
  handleSettingsClick: () => void;
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
  passiveIncomeRatio,
  handleSettingsClick,
  assetAllocation
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/forecast')} variant="outline">
            <LineChart className="w-5 h-5 mr-2" />
            {t('navigation.forecast')}
          </Button>
          <Button onClick={handleSettingsClick} aria-label={t("dashboard.settings")}>
            <CiSettings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <NetWorthCard
            netWorth={netWorth}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
          />
          <MonthlyBreakdownCard
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            monthlyLiabilityPayments={monthlyLiabilityPayments}
            monthlyAssetIncome={monthlyAssetIncome}
            passiveIncome={passiveIncome}
            monthlyCashFlow={monthlyCashFlow}
            passiveIncomeRatio={passiveIncomeRatio}
          />
        </div>
        <div className="h-[calc(40vh)]">
          <AssetAllocationChart
            title={t('forecast.assetAllocation')}
            assetAllocation={assetAllocation}
            showTitle
          />
          <br /><br /><br /><br /><br /><br />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
