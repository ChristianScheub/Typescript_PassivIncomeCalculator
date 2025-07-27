import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Asset } from "@/types/domains/assets/entities";
import { AssetFormData } from "@/types/domains/forms/form-data";
import { TranslationProps } from "@/types/shared/ui/view-props";
import { PortfolioPosition } from "@/types/domains/portfolio/position";
import { AssetTransactionForm } from "../forms/AssetTransactionFormView";
import { useDeviceCheck } from "@service/shared/utilities/helper/useDeviceCheck";
import { MobileAssetSummaryCard } from "@/ui/portfolioHub/MobileAssetSummaryCard";
import { DesktopAssetSummaryCards } from "@/ui/portfolioHub/DesktopAssetSummaryCards";
import { AssetDetailView } from "./AssetDetailView";
import TabSelector from "@/ui/shared/navigation/TabSelector";
import { HeaderButtonGroup } from "@/ui/portfolioHub/HeaderButtonGroup";
import FloatingBtn, { ButtonAlignment } from "@/ui/shared/floatingBtn";
import { ViewHeader } from "@/ui/shared/ViewHeader";
import { 
  TrendingUp, 
  Settings,
  Tag,
  Plus
} from "lucide-react";
import PortfolioHubRecommendations from "../../../ui/portfolioHub/PortfolioHubRecommendations";
import { AssetsList } from "../../../ui/portfolioHub/assetList/AssetsViewList";

export interface PortfolioData {
  positions: PortfolioPosition[];
  totals: {
    totalValue: number;
    totalInvestment: number;
    totalReturn: number;
    totalReturnPercentage: number;
    monthlyIncome: number;
    annualIncome: number;
    positionCount: number;
    transactionCount: number;
  };
  metadata: {
    lastCalculated: string;
    assetCount: number;
    definitionCount: number;
    positionCount: number;
  };
}

interface AssetsViewProps {
  assets: Asset[];
  portfolioData: PortfolioData;
  status: string;
  totalAssetValue: number;
  monthlyAssetIncome: number;
  annualAssetIncome: number;
  isAddingAsset: boolean;
  editingAsset: Asset | null;
  getAssetTypeLabel: (type: string) => string;
  onAddAsset: (data: AssetFormData) => void;
  onUpdateAsset: (data: AssetFormData) => void;
  onDeleteAsset: (id: string) => void;
  onSetIsAddingAsset: (isAdding: boolean) => void;
  onSetEditingAsset: (asset: Asset | null) => void;
  onNavigateToDefinitions: () => void;
  onNavigateToCategories?: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToPortfolioHistory?: () => void;
  onBack?: () => void;
}

// Helper components to reduce cognitive complexity
const LoadingView: React.FC<TranslationProps> = ({ t }) => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex justify-center items-center h-64">
      <div className="text-lg">{t("common.loading")}</div>
    </div>
  </div>
);

//der component for header buttons
const HeaderButtons: React.FC<{
  isDesktop: boolean;
  t: TranslationProps['t'];
  onNavigateToDefinitions: () => void;
  onNavigateToCategories?: () => void;
}> = ({ isDesktop, t, onNavigateToDefinitions, onNavigateToCategories }) => {
  const baseButtons = [
    {
      id: 'definitions',
      icon: Settings,
      label: t("assets.manageDefinitions"),
      onClick: onNavigateToDefinitions,
      tooltip: t("assets.manageDefinitions")
    }
  ];

  const categoriesButton = {
    id: 'categories',
    icon: Tag,
    label: t("categories.management"),
    onClick: onNavigateToCategories ?? (() => {}),
    tooltip: t("categories.management")
  };

  const buttons = [...baseButtons];
  if (onNavigateToCategories) {
    buttons.push(categoriesButton);
  }

  return <HeaderButtonGroup buttons={buttons} isDesktop={isDesktop} />;
};

// Helper component for desktop summary
const DesktopSummary: React.FC<{
  totalAssetValue: number;
  monthlyAssetIncome: number;
  annualAssetIncome: number;
  viewMode: "portfolio" | "transactions";
  sortedPortfolioAssets: PortfolioPosition[];
  assets: Asset[];
  viewModeTabs: Array<{ id: string; label: string }>;
  onNavigateToCalendar: () => void;
  onNavigateToAnalytics: () => void;
  handleViewModeChange: (tabId: string) => void;
}> = ({
  totalAssetValue,
  monthlyAssetIncome,
  annualAssetIncome,
  viewMode,
  sortedPortfolioAssets,
  assets,
  viewModeTabs,
  onNavigateToCalendar,
  onNavigateToAnalytics,
  handleViewModeChange
}) => {
  // Extract nested ternary for total assets count
  const totalAssetsCount = viewMode === "portfolio" 
    ? sortedPortfolioAssets.length 
    : assets.length;

  return (
    <>
      <DesktopAssetSummaryCards
        totalAssetValue={totalAssetValue}
        monthlyAssetIncome={monthlyAssetIncome}
        annualAssetIncome={annualAssetIncome}
        totalAssets={totalAssetsCount}
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToAnalytics={onNavigateToAnalytics}
      />
      <div className="mb-4">
        <TabSelector
          tabs={viewModeTabs}
          selectedTab={viewMode}
          onTabChange={handleViewModeChange}
        />
      </div>
    </>
  );
};

// Helper component for mobile summary
const MobileSummary: React.FC<{
  totalAssetValue: number;
  monthlyAssetIncome: number;
  annualAssetIncome: number;
  viewMode: "portfolio" | "transactions";
  sortedPortfolioAssets: PortfolioPosition[];
  assets: Asset[];
  viewModeTabs: Array<{ id: string; label: string }>;
  t: TranslationProps['t'];
  onNavigateToCalendar: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToPortfolioHistory?: () => void;
  handleViewModeChange: (tabId: string) => void;
}> = ({
  totalAssetValue,
  monthlyAssetIncome,
  annualAssetIncome,
  viewMode,
  sortedPortfolioAssets,
  assets,
  viewModeTabs,
  t,
  onNavigateToCalendar,
  onNavigateToAnalytics,
  onNavigateToPortfolioHistory,
  handleViewModeChange
}) => {
  // Extract nested ternary operations
  const positionsLabel = viewMode === "portfolio"
    ? t("assets.totalPositions")
    : t("assets.totalTransactions");
  
  const positionsCount = viewMode === "portfolio"
    ? sortedPortfolioAssets.length
    : assets.length;

  return (
    <>
      <MobileAssetSummaryCard
        totalAssetValue={totalAssetValue}
        monthlyAssetIncome={monthlyAssetIncome}
        annualAssetIncome={annualAssetIncome}
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToPortfolioHistory={onNavigateToPortfolioHistory}
      />
      <div className="mb-4">
        <TabSelector
          tabs={viewModeTabs}
          selectedTab={viewMode}
          onTabChange={handleViewModeChange}
        />
      </div>

      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onNavigateToAnalytics}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {positionsLabel}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {positionsCount}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
    </>
  );
};

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  portfolioData,
  status,
  totalAssetValue,
  monthlyAssetIncome,
  annualAssetIncome,
  isAddingAsset,
  editingAsset,
  getAssetTypeLabel,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onSetIsAddingAsset,
  onSetEditingAsset,
  onNavigateToDefinitions,
  onNavigateToCategories,
  onNavigateToCalendar,
  onNavigateToAnalytics,
  onNavigateToPortfolioHistory,
  onBack,
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();
  const [viewMode, setViewMode] = useState<"portfolio" | "transactions">(
    "portfolio"
  );
  const [selectedAsset, setSelectedAsset] = useState<PortfolioPosition | null>(
    null
  );
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  // Tab configuration for ViewMode
  const viewModeTabs = [
    { id: "portfolio", label: t("assets.portfolioView") },
    { id: "transactions", label: t("assets.transactionsView") },
  ];

  const handleViewModeChange = (tabId: string) => {
    setViewMode(tabId as "portfolio" | "transactions");
  };

  const handleAssetClick = (asset: PortfolioPosition) => {
    setSelectedAsset(asset);
    setIsDetailViewOpen(true);
  };

  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false);
    setSelectedAsset(null);
  };

  // Sort portfolio positions by current value (highest to lowest)
  const sortedPortfolioAssets = useMemo(() => {
    const positionsCopy = Array.isArray(portfolioData.positions) ? [...portfolioData.positions] : [];
    return positionsCopy.sort((a, b) => b.currentValue - a.currentValue);
  }, [portfolioData.positions]);

  // Sort assets by purchase date (newest first) for transaction view
  const sortedAssets = useMemo(() => {
    const assetsCopy = [...assets];
    return assetsCopy.sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
  }, [assets]);

  if (status === "loading") {
    return <LoadingView t={t} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ViewHeader
        title={t("assets.title")}
        onBack={onBack}
        rightContent={
          <HeaderButtons
            isDesktop={isDesktop}
            t={t}
            onNavigateToDefinitions={onNavigateToDefinitions}
            onNavigateToCategories={onNavigateToCategories}
          />
        }
      />

      {/* Summary Cards and Tabs */}
      {isDesktop ? (
        <DesktopSummary
          totalAssetValue={totalAssetValue}
          monthlyAssetIncome={monthlyAssetIncome}
          annualAssetIncome={annualAssetIncome}
          viewMode={viewMode}
          sortedPortfolioAssets={sortedPortfolioAssets}
          assets={assets}
          viewModeTabs={viewModeTabs}
          onNavigateToCalendar={onNavigateToCalendar}
          onNavigateToAnalytics={onNavigateToAnalytics}
          handleViewModeChange={handleViewModeChange}
        />
      ) : (
        <MobileSummary
          totalAssetValue={totalAssetValue}
          monthlyAssetIncome={monthlyAssetIncome}
          annualAssetIncome={annualAssetIncome}
          viewMode={viewMode}
          sortedPortfolioAssets={sortedPortfolioAssets}
          assets={assets}
          viewModeTabs={viewModeTabs}
          t={t}
          onNavigateToCalendar={onNavigateToCalendar}
          onNavigateToAnalytics={onNavigateToAnalytics}
          onNavigateToPortfolioHistory={onNavigateToPortfolioHistory}
          handleViewModeChange={handleViewModeChange}
        />
      )}

      <PortfolioHubRecommendations context="assets" />

      {/* Assets/Portfolio List */}
      <AssetsList
        viewMode={viewMode}
        sortedPortfolioAssets={sortedPortfolioAssets}
        assets={assets}
        sortedAssets={sortedAssets}
        portfolioData={portfolioData}
        getAssetTypeLabel={getAssetTypeLabel}
        handleAssetClick={handleAssetClick}
        onSetEditingAsset={onSetEditingAsset}
        onDeleteAsset={onDeleteAsset}
        onSetIsAddingAsset={onSetIsAddingAsset}
        onNavigateToDefinitions={onNavigateToDefinitions}
        t={t}
      />

      {/* Asset Transaction Form Modal */}
      {(isAddingAsset || editingAsset) && (
        <AssetTransactionForm
          isOpen={isAddingAsset || !!editingAsset}
          editingAsset={editingAsset}
          onSubmit={editingAsset ? onUpdateAsset : onAddAsset}
          onClose={() => {
            onSetIsAddingAsset(false);
            onSetEditingAsset(null);
          }}
        />
      )}

      {/* Asset Detail View Modal */}
      {isDetailViewOpen && selectedAsset && (
        <AssetDetailView
          isOpen={isDetailViewOpen}
          asset={selectedAsset}
          getAssetTypeLabel={getAssetTypeLabel}
          onClose={handleCloseDetailView}
        />
      )}
      {(!isAddingAsset && !editingAsset) && (

        <FloatingBtn
          icon={Plus}
          onClick={() => onSetIsAddingAsset(true)}
          alignment={ButtonAlignment.RIGHT}
        />
      )}
    </div>
  );
};
