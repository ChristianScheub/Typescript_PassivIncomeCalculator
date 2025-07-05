import { TranslationProps } from "@/types/shared/ui/view-props";
import { MotivationalEmptyState } from "@/ui/shared";
import { TrendingUp } from "lucide-react";

export const EmptyStateView: React.FC<{ 
  t: TranslationProps['t']; 
  onSetIsAddingAsset: (isAdding: boolean) => void;
  onNavigateToDefinitions: () => void;
}> = ({ 
  t, 
  onSetIsAddingAsset,
  onNavigateToDefinitions
}) => (
  <MotivationalEmptyState
    icon={<TrendingUp className="h-8 w-8" />}
    title={t("emptyStates.assets.title")}
    description={t("emptyStates.assets.description")}
    motivationalText={t("emptyStates.assets.motivationalText")}
    primaryAction={{
      label: t("emptyStates.assets.primaryAction"),
      onClick: () => onSetIsAddingAsset(true),
      variant: 'primary'
    }}
    secondaryAction={{
      label: t("emptyStates.assets.secondaryAction"),
      onClick: onNavigateToDefinitions
    }}
    tips={t("emptyStates.assets.tips", { returnObjects: true }) as string[]}
  />
);