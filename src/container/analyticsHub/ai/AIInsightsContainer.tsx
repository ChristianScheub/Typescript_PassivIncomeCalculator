import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/redux";
import { useLLMService } from "@/hooks/useLLMService";
import AIInsightsView from "@/view/analytics-hub/ai/AIInsightsView";
import type { AIInsightsViewProps } from "@/types/domains/analytics/ai";

interface AIInsightsContainerProps {
  onBack: () => void;
}

const AIInsightsContainer: React.FC<AIInsightsContainerProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { generateFinancialInsights, modelStatus } = useLLMService();

  // Hole den gesamten Redux State
  const reduxState = useAppSelector((state) => state);
  
  // Redux state - Basic financial data for display
  const { items: assets, portfolioCache } = reduxState.transactions;
  const { items: income } = reduxState.income;
  const { items: expenses } = reduxState.expenses;
  const { items: liabilities } = reduxState.liabilities;

  // Local state
  const [insights, setInsights] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // Calculate current financial metrics
  const financialMetrics = {
    totalAssets: portfolioCache?.totals?.totalValue || 0,
    monthlyIncome: portfolioCache?.totals?.monthlyIncome || 0,
    totalExpenses: expenses.reduce(
      (sum: number, exp: any) => sum + (exp.paymentSchedule?.amount || 0),
      0
    ),
    totalLiabilities: liabilities.reduce(
      (sum: number, lib: any) => sum + (lib.currentBalance || 0),
      0
    ),
    assetsCount: assets.length,
    incomeSourcesCount: income.length,
    expenseCategories: new Set(expenses.map((e: any) => e.category)).size,
  };

  const netWorth =
    financialMetrics.totalAssets - financialMetrics.totalLiabilities;
  const savingsRate =
    financialMetrics.monthlyIncome > 0
      ? ((financialMetrics.monthlyIncome - financialMetrics.totalExpenses) /
          financialMetrics.monthlyIncome) *
        100
      : 0;

  // Auto-generate insights on mount
  useEffect(() => {
    if (modelStatus === "loaded" && !insights && !isGenerating) {
      handleGenerateInsights();
    }
  }, [modelStatus]);

  const handleGenerateInsights = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Verwende den kompletten Redux State für die AI-Analyse
      const result = await generateFinancialInsights(
        reduxState, 
        "portfolio"
      );

      // Create structured insights from AI response
      const structuredInsights = {
        summary: result?.insight || "AI analysis generated successfully",
        confidence: result?.confidence || 0.8,
        recommendations: result?.recommendations?.length
          ? result.recommendations.map((rec: any) => ({
              type: rec.type,
              title: rec.title,
              description: rec.description,
              priority: rec.priority,
              impact: rec.impact,
            }))
          : [],
        metrics: {
          riskScore: Math.min(
            85,
            Math.max(
              15,
              50 +
                (financialMetrics.totalLiabilities /
                  Math.max(1, financialMetrics.totalAssets)) *
                  50
            )
          ),
          diversificationScore: Math.min(
            100,
            Math.max(0, (financialMetrics.assetsCount / 10) * 100)
          ),
          liquidityScore: Math.min(100, Math.max(0, savingsRate * 2)),
        },
      };

      setInsights(structuredInsights);
      setLastGenerated(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("ai.insights.error.generation_failed")
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const viewProps: AIInsightsViewProps = {
    onBack,
    modelStatus,
    isGenerating,
    insights,
    error,
    lastGenerated,
    financialMetrics,
    netWorth,
    savingsRate,
    onGenerateInsights: handleGenerateInsights,
  };

  return <AIInsightsView {...viewProps} />;
};

export default AIInsightsContainer;
