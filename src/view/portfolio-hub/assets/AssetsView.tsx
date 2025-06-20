import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Asset } from "../../../types/domains/assets/entities";
import { AssetFormData } from "../../../types/domains/forms/form-data";
import { TranslationProps } from "../../../types/shared/ui/view-props";
import { Card, CardContent } from "../../../ui/common/Card";
import { PortfolioPosition } from "../../../types/domains/portfolio/position";
import { AssetTransactionForm } from "../../shared/forms/AssetTransactionForm";
import { useDeviceCheck } from "@service/shared/utilities/helper/useDeviceCheck";
import { MobileAssetSummaryCard } from "../../../ui/layout/MobileAssetSummaryCard";
import { DesktopAssetSummaryCards } from "../../../ui/layout/DesktopAssetSummaryCards";
import { PortfolioView } from "../PortfolioView";
import { AssetDetailView } from "./AssetDetailView";
import TabSelector from "../../../ui/navigation/TabSelector";
import { HeaderButtonGroup } from "../../../ui/common/HeaderButtonGroup";
import FloatingBtn, { ButtonAlignment } from "../../../ui/layout/floatingBtn";
import { Add } from "@mui/icons-material";
import { MotivationalEmptyState } from "../../../ui/feedback/EnhancedEmptyState";
import { ViewHeader } from "../../../ui/layout/ViewHeader";
import formatService from "@service/infrastructure/formatService";
import { 
  TrendingUp, 
  Settings,
  Tag,
  BarChart3
} from "lucide-react";
import { SwipeableCard } from "../../../ui/common/SwipeableCard";

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

const EmptyStateView: React.FC<{ 
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

//der component for header buttons
const HeaderButtons: React.FC<{
  isDesktop: boolean;
  t: TranslationProps['t'];
  onNavigateToDefinitions: () => void;
  onNavigateToCategories?: () => void;
  onNavigateToAnalytics: () => void;
}> = ({ isDesktop, t, onNavigateToDefinitions, onNavigateToCategories, onNavigateToAnalytics }) => {
  const buttons = [
    {
      id: 'definitions',
      icon: Settings,
      label: t("assets.manageDefinitions"),
      onClick: onNavigateToDefinitions,
      tooltip: t("assets.manageDefinitions")
    },
    ...(onNavigateToCategories ? [{
      id: 'categories',
      icon: Tag,
      label: t("categories.management"),
      onClick: onNavigateToCategories,
      tooltip: t("categories.management")
    }] : []),
    {
      id: 'analytics',
      icon: BarChart3,
      label: t("analytics.portfolioAnalytics"),
      onClick: onNavigateToAnalytics,
      tooltip: t("analytics.portfolioAnalytics")
    }
  ];

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
  onNavigateToDefinitions: () => void;
  t: TranslationProps['t'];
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
  onNavigateToDefinitions,
  t
}) => {
  // Extract nested ternary for assets count
  const assetsCount = viewMode === "portfolio" 
    ? sortedPortfolioAssets.length 
    : assets.length;

  if (assetsCount === 0) {
    return <EmptyStateView 
      t={t} 
      onSetIsAddingAsset={onSetIsAddingAsset} 
      onNavigateToDefinitions={onNavigateToDefinitions}
    />;
  }

  return viewMode === "portfolio" ? (
    <PortfolioView
      portfolioAssets={sortedPortfolioAssets}
      getAssetTypeLabel={getAssetTypeLabel}
      onAssetClick={handleAssetClick}
    />
  ) : (
    <>
      {sortedAssets.map(asset => (
        <SwipeableCard
          key={asset.id}
          onEdit={() => onSetEditingAsset(asset)}
          onDelete={() => onDeleteAsset(asset.id)}
          className="hover:shadow-md transition-shadow mb-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                {/* Header with Asset Name and Type */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {asset.name}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {getAssetTypeLabel(asset.type)}
                  </span>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Purchase Date */}
                  <div className="flex flex-col">
                    <span className="text-gray-600 dark:text-gray-400">{t('assets.purchaseDate')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Transaction Type */}
                  <div className="flex flex-col">
                    <span className="text-gray-600 dark:text-gray-400">{t('assets.transactionType')}</span>
                    <span className={`font-medium ${asset.transactionType === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {asset.transactionType === 'buy' ? t('assets.buy') : t('assets.sell')}
                    </span>
                  </div>

                  {/* Quantity */}
                  {asset.purchaseQuantity && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.quantity')}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {asset.purchaseQuantity.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Purchase Price */}
                  {asset.purchasePrice && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.purchasePrice')}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatService.formatCurrency(asset.purchasePrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Volume */}
                {asset.value && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.totalVolume')}</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {formatService.formatCurrency(asset.value)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Asset Definition Info */}
                {asset.assetDefinition && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                    {asset.assetDefinition.ticker && (
                      <span className="mr-2">Ticker: {asset.assetDefinition.ticker}</span>
                    )}
                    {asset.assetDefinition.sector && (
                      <span>Sektor: {asset.assetDefinition.sector}</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SwipeableCard>
      ))}
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
      {/* Header */}
      <ViewHeader
        title={t("navigation.assets")}
        onBack={onBack}
        rightContent={
          <HeaderButtons
            isDesktop={isDesktop}
            t={t}
            onNavigateToDefinitions={onNavigateToDefinitions}
            onNavigateToCategories={onNavigateToCategories}
            onNavigateToAnalytics={onNavigateToAnalytics}
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
          icon={Add}
          onClick={() => onSetIsAddingAsset(true)}
          alignment={ButtonAlignment.RIGHT}
        />
      )}
    </div>
  );
};
