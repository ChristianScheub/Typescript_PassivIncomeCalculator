import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Asset } from "../../types";
import { PortfolioPosition } from "../../service/portfolioService/portfolioCalculations";
import { AssetTransactionForm } from "../forms/AssetTransactionForm";
import { useDeviceCheck } from "../../service/helper/useDeviceCheck";
import { MobileAssetSummaryCard } from "../../ui/layout/MobileAssetSummaryCard";
import { DesktopAssetSummaryCards } from "../../ui/layout/DesktopAssetSummaryCards";
import { PortfolioView } from "../portfolio/PortfolioView";
import { TransactionView } from "../components/TransactionView";
import { AssetDetailView } from "./AssetDetailView";
import TabSelector from "../../ui/navigation/TabSelector";
import FloatingBtn, { ButtonAlignment } from "../../ui/layout/floatingBtn";
import { Add } from "@mui/icons-material";
import { 
  TrendingUp, 
  Settings,
  Tag,
  PieChart
} from "lucide-react";

interface PortfolioData {
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
  onAddAsset: (data: any) => void;
  onUpdateAsset: (data: any) => void;
  onDeleteAsset: (id: string) => void;
  onSetIsAddingAsset: (isAdding: boolean) => void;
  onSetEditingAsset: (asset: Asset | null) => void;
  onNavigateToDefinitions: () => void;
  onNavigateToCategories?: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToPortfolioHistory?: () => void;
}

// Helper components to reduce cognitive complexity
const LoadingView: React.FC<{ t: any }> = ({ t }) => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex justify-center items-center h-64">
      <div className="text-lg">{t("common.loading")}</div>
    </div>
  </div>
);

const EmptyStateView: React.FC<{ t: any; onSetIsAddingAsset: (isAdding: boolean) => void }> = ({ 
  t, 
  onSetIsAddingAsset 
}) => (
  <div className="text-center py-12">
    <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
      {t("assets.noAssets")}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      {t("assets.noAssetsDesc")}
    </p>
    <button
      onClick={() => onSetIsAddingAsset(true)}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      {t("assets.addTransaction")}
    </button>
  </div>
);

// Helper component for header buttons
const HeaderButtons: React.FC<{
  isDesktop: boolean;
  t: any;
  onNavigateToDefinitions: () => void;
  onNavigateToCategories?: () => void;
  onNavigateToAnalytics: () => void;
}> = ({ isDesktop, t, onNavigateToDefinitions, onNavigateToCategories, onNavigateToAnalytics }) => (
  <>
    <button
      onClick={onNavigateToDefinitions}
      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
    >
      <Settings className={`h-4 w-4 ${isDesktop ? 'mr-2' : ''}`} />
      {isDesktop && t("assets.manageDefinitions")}
    </button>

    {onNavigateToCategories && (
      <button
        onClick={onNavigateToCategories}
        className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        title={!isDesktop ? t("categories.management") : undefined}
      >
        <Tag className={`h-4 w-4 ${isDesktop ? 'mr-2' : ''}`} />
        {isDesktop && t("categories.management")}
      </button>
    )}

    <button
      onClick={onNavigateToAnalytics}
      className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      title={!isDesktop ? t("analytics.portfolioAnalytics") : undefined}
    >
      <PieChart className={`h-4 w-4 ${isDesktop ? 'mr-2' : ''}`} />
      {isDesktop && t("analytics.portfolioAnalytics")}
    </button>
  </>
);

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
  t: any;
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
        onNavigateToAnalytics={onNavigateToAnalytics}
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

// Helper component for assets list
const AssetsList: React.FC<{
  viewMode: "portfolio" | "transactions";
  sortedPortfolioAssets: PortfolioPosition[];
  assets: Asset[];
  sortedAssets: Asset[];
  portfolioData: PortfolioData;
  getAssetTypeLabel: (type: string) => string;
  handleAssetClick: (asset: PortfolioPosition) => void;
  onSetEditingAsset: (asset: Asset | null) => void;
  onDeleteAsset: (id: string) => void;
  onSetIsAddingAsset: (isAdding: boolean) => void;
  t: any;
}> = ({
  viewMode,
  sortedPortfolioAssets,
  assets,
  sortedAssets,
  portfolioData,
  getAssetTypeLabel,
  handleAssetClick,
  onSetEditingAsset,
  onDeleteAsset,
  onSetIsAddingAsset,
  t
}) => {
  // Extract nested ternary for assets count
  const assetsCount = viewMode === "portfolio" 
    ? sortedPortfolioAssets.length 
    : assets.length;

  if (assetsCount === 0) {
    return <EmptyStateView t={t} onSetIsAddingAsset={onSetIsAddingAsset} />;
  }

  return viewMode === "portfolio" ? (
    <PortfolioView
      portfolioAssets={sortedPortfolioAssets}
      getAssetTypeLabel={getAssetTypeLabel}
      onAssetClick={handleAssetClick}
    />
  ) : (
    <TransactionView
      assets={sortedAssets}
      portfolioData={portfolioData}
      getAssetTypeLabel={getAssetTypeLabel}
      onEditAsset={onSetEditingAsset}
      onDeleteAsset={onDeleteAsset}
    />
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
    return [...portfolioData.positions].sort(
      (a, b) => b.currentValue - a.currentValue
    );
  }, [portfolioData.positions]);

  // Sort assets by purchase date (newest first) for transaction view
  const sortedAssets = useMemo(() => {
    return [...assets].sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
  }, [assets]);

  if (status === "loading") {
    return <LoadingView t={t} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with management buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 lg:mb-0">
          {t("navigation.assets")}
        </h1>
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <HeaderButtons
            isDesktop={isDesktop}
            t={t}
            onNavigateToDefinitions={onNavigateToDefinitions}
            onNavigateToCategories={onNavigateToCategories}
            onNavigateToAnalytics={onNavigateToAnalytics}
          />
        </div>
      </div>

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

      {/* Floating Add Button */}
      {!isDesktop && (
        <FloatingBtn
          icon={Add}
          onClick={() => onSetIsAddingAsset(true)}
          alignment={ButtonAlignment.RIGHT}
        />
      )}
    </div>
  );
};
