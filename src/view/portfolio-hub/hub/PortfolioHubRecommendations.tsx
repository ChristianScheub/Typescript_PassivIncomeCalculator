import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import analyticsService from "@service/domain/analytics/calculations/financialAnalyticsService";
import { RecommendationPriority } from "@service/domain/analytics/calculations/financialAnalyticsService/interfaces/IAnalyticsService";
import {
  PortfolioCategory,
  PortfolioSubCategory,
} from "@service/domain/analytics/reporting/recentActivityService/types";
import { CollapsibleSection } from "@/ui/common";
import { Target } from "lucide-react";

interface PortfolioHubRecommendationsProps {
  className?: string;
  onCategoryChange: (
    category: PortfolioCategory,
    subCategory?: PortfolioSubCategory
  ) => void;
}

const PortfolioHubRecommendations: React.FC<
  PortfolioHubRecommendationsProps
> = ({ className, onCategoryChange }) => {
  const { t } = useTranslation();

  // Get data from Redux store
  const assets = useSelector((state: RootState) => state.transactions.items);
  const income = useSelector((state: RootState) => state.income.items);
  const expenses = useSelector((state: RootState) => state.expenses.items);
  const liabilities = useSelector(
    (state: RootState) => state.liabilities.items
  );

  // Generate recommendations using analyticsService
  const recommendations = useMemo(() => {
    return analyticsService.generateRecommendations(
      assets,
      liabilities,
      expenses,
      income,
      [] // assetDefinitions - can be enhanced later
    );
  }, [assets, income, expenses, liabilities]);

  // Helper function to get priority styling
  const getPriorityColor = (priority: RecommendationPriority) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50 text-red-800";
      case "medium":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "border-gray-200 bg-gray-50 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: RecommendationPriority) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🔵";
      default:
        return "⚪";
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className={`p-6 bg-gray-50 rounded-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("hubRecommendations.title")}
        </h3>
        <p className="text-gray-600">
          {t("hubRecommendations.noRecommendations")}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <CollapsibleSection
        title={t("hubRecommendations.title")}
        icon={<Target className="h-5 w-5 text-green-500" />}
        defaultExpanded={false}
      >
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div
              key={`${recommendation.category}-${index}`}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(
                recommendation.priority
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">
                      {getPriorityIcon(recommendation.priority)}
                    </span>
                    <h4 className="font-medium">
                      {t(recommendation.titleKey)}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                      {t(`categories.${recommendation.category}`)}
                    </span>
                  </div>
                  <p className="text-sm opacity-80">
                    {t(recommendation.descriptionKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 0 && (
          <div className="text-xs text-gray-500 mt-4">
            {t("hubRecommendations.totalRecommendations", {
              count: recommendations.length,
            })}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default PortfolioHubRecommendations;
