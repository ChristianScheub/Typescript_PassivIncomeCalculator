import React from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Wallet,
  Landmark,
  CreditCard,
  ReceiptText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/shared/Card";
import { Button } from "../../ui/shared/Button";
import { ViewHeader } from "../../ui/shared/ViewHeader";
import { PortfolioRecentActivities } from "../../ui/portfolioHub/PortfolioRecentActivities";
import formatService from "@service/infrastructure/formatService";
import { useDeviceCheck } from "@service/shared/utilities/helper/useDeviceCheck";
import PortfolioHubRecommendations from "../../ui/portfolioHub/PortfolioHubRecommendations";
import { PortfolioCategory, PortfolioSubCategory } from "../../types/domains/analytics/reporting";

interface PortfolioSummary {
  totalAssetValue: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyCashFlow: number;
  assetsCount: number;
  liabilitiesCount: number;
  incomeSourcesCount: number;
  expenseCategoriesCount: number;
}

interface PortfolioOverviewViewProps {
  portfolioSummary: PortfolioSummary;
  onCategoryChange: (
    category: PortfolioCategory,
    subCategory?: PortfolioSubCategory
  ) => void;
}

const PortfolioOverviewView: React.FC<PortfolioOverviewViewProps> = ({
  portfolioSummary,
  onCategoryChange,
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();

  const {
    totalAssetValue,
    totalLiabilities,
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    monthlyLiabilityPayments,
    monthlyCashFlow,
    assetsCount,
    liabilitiesCount,
    incomeSourcesCount,
    expenseCategoriesCount,
  } = portfolioSummary;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ViewHeader
          title={t("portfolio.hub.title", "Portfolio Hub")}
          subtitle={t(
            "portfolio.hub.subtitle",
            "Manage your complete financial portfolio"
          )}
          isMobile={!isDesktop}
        />

        {/* Portfolio Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Net Worth */}
              <div className="text-center md:text-left">
                <p className="text-blue-100 text-sm font-medium">
                  {t("portfolio.netWorth", "Net Worth")}
                </p>
                <p className="text-3xl font-bold">
                  {formatService.formatCurrency(netWorth)}
                </p>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                </div>
              </div>

              {/* Assets vs Liabilities */}
              <div className="text-center">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-100 text-xs">
                      {t("portfolio.assets", "Assets")}
                    </p>
                    <p className="text-lg font-semibold">
                      {formatService.formatCurrency(totalAssetValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs">
                      {t("portfolio.liabilities", "Liabilities")}
                    </p>
                    <p className="text-lg font-semibold">
                      {formatService.formatCurrency(totalLiabilities)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Monthly Cash Flow */}
              <div className="text-center md:text-right">
                <p className="text-blue-100 text-sm font-medium">
                  {t("portfolio.monthlyCashFlow", "Monthly Cash Flow")}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    monthlyCashFlow >= 0 ? "text-green-100" : "text-red-200"
                  }`}
                >
                  {monthlyCashFlow >= 0 ? "+" : ""}
                  {formatService.formatCurrency(monthlyCashFlow)}
                </p>
                <p className="text-blue-100 text-xs mt-1">
                  {formatService.formatCurrency(monthlyIncome)}{" "}
                  {t("common.income")} -{" "}
                  {formatService.formatCurrency(
                    monthlyExpenses + monthlyLiabilityPayments
                  )}{" "}
                  {t("common.expenses")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Overview Section - Recent Activities & Recommendations */}
        <PortfolioHubRecommendations context="hub" />
        <br />
        {/* Portfolio Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Assets Management */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCategoryChange("assets")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Wallet className="w-5 h-5 mr-2 text-blue-500" />
                {t("portfolio.categories.assets", "Assets Management")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("portfolio.totalValue", "Total Value")}
                  </span>
                  <span className="font-semibold">
                    {formatService.formatCurrency(totalAssetValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("portfolio.positions", "Positions")}
                  </span>
                  <span className="font-semibold">{assetsCount}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryChange("assets", "portfolio");
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      {t("portfolio.view", "View")}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryChange("assets", "calendar");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      {t("portfolio.calendar", "Calendar")}
                    </Button>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income Management */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCategoryChange("income")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                {t("portfolio.categories.income", "Income Management")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("portfolio.monthlyIncome", "Monthly Income")}
                  </span>
                  <span className="font-semibold text-green-600">
                    {formatService.formatCurrency(monthlyIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("portfolio.sources", "Sources")}
                  </span>
                  <span className="font-semibold">{incomeSourcesCount}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryChange("income", "sources");
                      }}
                      variant="success"
                      size="sm"
                    >
                      {t("portfolio.manage", "Manage")}
                    </Button>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Management */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCategoryChange("expenses")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <ReceiptText className="w-5 h-5 mr-2 text-orange-500" />
                {t("portfolio.categories.expenses")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("portfolio.monthlyExpenses", "Monthly Expenses")}
                  </span>
                  <span className="font-semibold text-orange-600">
                    {formatService.formatCurrency(monthlyExpenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("portfolio.categoriesLabel", "Categories")}
                  </span>
                  <span className="font-semibold">
                    {expenseCategoriesCount}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryChange("expenses", "categories");
                      }}
                      variant="warning"
                      size="sm"
                    >
                      {t("portfolio.track", "Track")}
                    </Button>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liabilities Management */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCategoryChange("liabilities")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Landmark className="w-5 h-5 mr-2 text-red-500" />
                {t(
                  "portfolio.categories.liabilities",
                  "Liabilities Management"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("portfolio.totalDebt", "Total Debt")}
                  </span>
                  <span className="font-semibold text-red-600">
                    {formatService.formatCurrency(totalLiabilities)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("portfolio.debts", "Debts")}
                  </span>
                  <span className="font-semibold">{liabilitiesCount}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryChange("liabilities", "debts");
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      {t("portfolio.manage", "Manage")}
                    </Button>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Recent Activity */}
        <PortfolioRecentActivities
          portfolioData={{
            assetsCount: portfolioSummary.assetsCount,
            incomeSourcesCount: portfolioSummary.incomeSourcesCount,
          }}
          onCategoryChange={onCategoryChange}
          maxActivities={4}
        />
      </div>
    </div>
  );
};

export default PortfolioOverviewView;
