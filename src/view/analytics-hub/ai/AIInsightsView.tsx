import React from "react";
import { useTranslation } from "react-i18next";
import { ViewHeader } from "@/ui/shared/ViewHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shared/Card";
import { Button } from "@/ui/shared/Button";
import { useDeviceCheck } from "@service/shared/utilities/helper/useDeviceCheck";
import type { AIInsightsViewProps } from "@/types/domains/analytics/ai";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Lightbulb,
  Target,
  DollarSign,
  PieChart,
} from "lucide-react";
import { Badge } from "@/ui/shared/common/Badge";

const getModelStatusVariant = (status: string) => {
  if (status === "loaded") return "success";
  if (status === "loading") return "warning";
  return "destructive";
};

const getButtonText = (isGenerating: boolean, insights: unknown, t: (key: string) => string) => {
  if (isGenerating) return t("ai.insights.generating");
  if (insights) return t("ai.insights.regenerate");
  return t("ai.insights.generate");
};

const AIInsightsView: React.FC<AIInsightsViewProps> = ({ 
  onBack,
  modelStatus,
  isGenerating,
  insights,
  error,
  lastGenerated,
  financialMetrics,
  netWorth,
  savingsRate,
  onGenerateInsights
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();



  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <ViewHeader
          title={t("ai.insights.title")}
          subtitle={t("ai.insights.subtitle")}
          onBack={onBack}
          isMobile={!isDesktop}
        />

        {/* Model Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("ai.model.status")}:
            </span>{" "}
            <Badge
              variant={getModelStatusVariant(modelStatus)}
            >
              {t(`ai.model.states.${modelStatus}`)}
            </Badge>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("analytics.overview.net_worth")}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    €{netWorth.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("analytics.overview.savings_rate")}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {savingsRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <PieChart className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("analytics.overview.assets_count")}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {financialMetrics.assetsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isGenerating && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">
                  {t("ai.insights.generating")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {insights && (
          <>
            {/* AI Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>{t("ai.insights.summary.title")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {insights.summary}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {t("ai.insights.confidence")}:{" "}
                    {(insights.confidence * 100).toFixed(0)}%
                  </span>
                  {lastGenerated && (
                    <span className="ml-4">
                      {t("ai.insights.generated_at")}:{" "}
                      {lastGenerated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Scores */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t("ai.insights.scores.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(
                        insights.metrics.riskScore
                      )}`}
                    >
                      {insights.metrics.riskScore.toFixed(0)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("ai.insights.scores.risk")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(
                        insights.metrics.diversificationScore
                      )}`}
                    >
                      {insights.metrics.diversificationScore.toFixed(0)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("ai.insights.scores.diversification")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(
                        insights.metrics.liquidityScore
                      )}`}
                    >
                      {insights.metrics.liquidityScore.toFixed(0)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("ai.insights.scores.liquidity")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>{t("ai.insights.recommendations.title")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.recommendations.map((rec: string, index: number) => (
                    <div
                      key={`recommendation-${rec.slice(0, 20)}-${index}`}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Generate Button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={onGenerateInsights}
            disabled={isGenerating || modelStatus !== "loaded"}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            <span>
              {getButtonText(isGenerating, insights, t)}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsView;
