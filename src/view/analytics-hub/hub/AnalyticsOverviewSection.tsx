import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/redux";
import { recentActivityService } from "../../../service";
import {
  TrendingUp,
  Target,
  PieChart,
  ArrowRight,
  Clock,
  Activity,
  Settings,
  BarChart3,
  Globe,
  Bookmark,
  Copy,
  CreditCard,
  LineChart,
  GitBranch,
  Calendar,
} from "lucide-react";
import {
  AnalyticsCategory,
  AnalyticsSubCategory,
} from "@/container/analyticsHub/AnalyticsHubContainer";
import { AIInsightsCard, AIChatCard } from "@ui/portfolioHub";
import type { AIAnalyticsCategory } from "@/types/domains/analytics/ai";
import { CollapsibleSection } from "@ui/shared";

interface RecentAnalyticItem {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
}

interface AnalyticsOverviewSectionProps {
  onCategoryChange: (
    category: AnalyticsCategory,
    subCategory?: AnalyticsSubCategory
  ) => void;
  onAINavigation?: (category: AIAnalyticsCategory) => void;
}

const AnalyticsOverviewSection: React.FC<AnalyticsOverviewSectionProps> = ({
  onCategoryChange,
  onAINavigation,
}) => {
  const { t } = useTranslation();
  
  // Get AI configuration from Redux
  const aiConfig = useAppSelector(state => state.config.apis.ai);
  const isAIEnabled = aiConfig.enabled;
  // Real recent analytics based on user data
  const recentAnalytics = useMemo(() => {
    const history = recentActivityService.getActivitiesByType("analytics", 3);

    // Map icon names to actual icon components
    const iconMap = {
      PieChart,
      TrendingUp,
      Activity,
      Settings,
      BarChart3,
      Globe,
      Target,
      Bookmark,
      Copy,
      CreditCard,
      LineChart,
      GitBranch,
      Calendar,
    };

    if (history.length === 0) {
      // Fallback to default analytics if no history
      return [
        {
          title: t("analytics.hub.recent.portfolioDistribution"),
          subtitle: ``,
          icon: PieChart,
          color: "text-blue-500",
          onClick: () => onCategoryChange("distributions", "assets"),
        },
      ];
    }

    // Map actual history to components
    return history
      .filter(
        (entry): entry is typeof entry & { type: "analytics" } =>
          entry.type === "analytics"
      )
      .map((entry, index: number) => {
        const IconComponent =
          iconMap[entry.icon as keyof typeof iconMap] || PieChart;
        const colors = ["text-blue-500", "text-green-500", "text-purple-500"];

        return {
          title: t(entry.titleKey),
          subtitle: t("analytics.hub.recent.viewedRecently"),
          icon: IconComponent,
          color: colors[index % colors.length],
          onClick: () => onCategoryChange(entry.category, entry.subCategory),
        };
      });
  }, [onCategoryChange, t]);

  return (
    <div className={`grid gap-6 mb-8 ${isAIEnabled ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
      {/* AI Cards - only show if AI is enabled and model is loaded */}
      {isAIEnabled && (
        <>
          {/* AI Insights Card */}
          <AIInsightsCard
            onClick={() => onAINavigation?.("insights")}
            className="p-3 rounded-lg"
          />

          {/* AI Chat Card */}
          <AIChatCard
            onClick={() => onAINavigation?.("chat")}
            className="p-3 rounded-lg"
          />
        </>
      )}
      
      {/* Recent Analytics */}
      <CollapsibleSection
        title={t("analytics.hub.recentAnalytics")}
        icon={<Clock className="h-5 w-5 text-yellow-500" />}
        defaultExpanded={true}
      >
        {recentAnalytics.map((item: RecentAnalyticItem) => {
          const IconComponent = item.icon;
          return (
            <div
              key={`recent-${item.title}-${item.color}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={item.onClick}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <IconComponent className={`h-4 w-4 ${item.color}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          );
        })}
      </CollapsibleSection>
    </div>
  );
};

export default AnalyticsOverviewSection;
